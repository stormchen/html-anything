import { randomUUID, createHash } from "node:crypto";
import { DeployError, type DeployConfig } from "./config";
import {
  waitForReachableDeploymentUrl,
} from "./url-check";
import type { DeployFile } from "./vercel";

/**
 * Cloudflare Pages Direct Upload.
 *
 * CF Pages deployment endpoint:
 *   POST /accounts/{account_id}/pages/projects/{project_name}/deployments
 *
 * Required multipart fields:
 *   manifest  – JSON string: { "/path": "sha256-hex-hash" }
 *   {hash}    – file bytes, field name = hash, filename = hash (BOTH required)
 *   branch    – git branch name (e.g. "main")
 *
 * We build the multipart body manually as a Buffer instead of using
 * Node.js's native FormData. Node.js (undici) has a known issue where
 * FormData.append(name, blob, filename) does not emit the `filename`
 * parameter in Content-Disposition when the body is serialised to a
 * ReadableStream — CF Pages silently accepts the request but stores no
 * file content, resulting in a blank deployed page.
 *
 * Manual construction gives us exact control over every header, line
 * ending, and byte, matching what browser FormData sends.
 */

const CF_API = "https://api.cloudflare.com/client/v4";

export type CloudflarePagesDeployResult = {
  providerId: "cloudflare-pages";
  url: string;
  deploymentId: string;
  target: "preview";
  status: "ready" | "protected" | "link-delayed";
  statusMessage: string;
  reachableAt?: number;
};

async function cfRequest(
  config: DeployConfig,
  path: string,
  options: RequestInit = {},
) {
  const url = `${CF_API}/accounts/${config.accountId}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token}`,
  };

  if (!(options.body instanceof FormData) && !Buffer.isBuffer(options.body)) {
    headers["Content-Type"] = "application/json";
  }

  const resp = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const json = await resp.json();
  if (!resp.ok || !json.success) {
    const error = json.errors?.[0];
    throw new DeployError(
      error?.message || `Cloudflare request failed (${resp.status}).`,
      resp.status,
      json,
    );
  }
  return json.result;
}

function safeProjectName(raw: string): string {
  return (
    String(raw)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 58) || `html-anything-${randomUUID().slice(0, 8)}`
  );
}

/**
 * Build a multipart/form-data body as a raw Buffer.
 *
 * Node.js's FormData → fetch pipeline serialises Blob fields without the
 * `filename` attribute in Content-Disposition (only `File` objects carry a
 * name through undici's encoder). CF Pages requires `filename` to be present
 * on file fields, so we skip FormData entirely and produce the wire bytes
 * ourselves — same format a browser would send.
 */
function buildMultipart(fields: Array<{
  name: string;
  value: Buffer | string;
  filename?: string;
  contentType?: string;
}>): { body: Buffer; contentType: string } {
  const boundary = `----CFPagesUpload${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const CRLF = "\r\n";
  const e = (s: string) => Buffer.from(s, "utf-8");
  const parts: Buffer[] = [];

  for (const field of fields) {
    parts.push(e(`--${boundary}${CRLF}`));

    if (field.filename !== undefined) {
      parts.push(
        e(
          `Content-Disposition: form-data; name="${field.name}"; filename="${field.filename}"${CRLF}` +
          `Content-Type: ${field.contentType ?? "application/octet-stream"}${CRLF}` +
          CRLF,
        ),
      );
    } else {
      parts.push(e(`Content-Disposition: form-data; name="${field.name}"${CRLF}${CRLF}`));
    }

    parts.push(
      typeof field.value === "string"
        ? Buffer.from(field.value, "utf-8")
        : field.value,
    );
    parts.push(e(CRLF));
  }

  parts.push(e(`--${boundary}--${CRLF}`));

  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

export async function deployToCloudflarePages({
  config,
  files,
  taskId,
}: {
  config: DeployConfig;
  files: DeployFile[];
  taskId: string;
}): Promise<CloudflarePagesDeployResult> {
  if (!config?.token || !config?.accountId) {
    throw new DeployError("Cloudflare Token and Account ID are required.", 400);
  }

  const projectName = safeProjectName(`html-anything-${taskId}`);

  // 1. Ensure the CF Pages project exists (create on first deploy).
  try {
    await cfRequest(config, `/pages/projects/${projectName}`);
  } catch (err) {
    if (err instanceof DeployError && err.status === 404) {
      await cfRequest(config, "/pages/projects", {
        method: "POST",
        body: JSON.stringify({
          name: projectName,
          production_branch: "main",
        }),
      });
    } else {
      throw err;
    }
  }

  // 2. Build manifest and encode file bytes.
  const manifest: Record<string, string> = {};
  const fileFields: Array<{
    name: string;
    value: Buffer;
    filename: string;
    contentType: string;
  }> = [];

  for (const f of files) {
    const bytes: Buffer =
      typeof f.data === "string" ? Buffer.from(f.data, "utf-8") : f.data;
    const hash = createHash("sha256").update(bytes).digest("hex");
    const path = f.file.startsWith("/") ? f.file : `/${f.file}`;
    manifest[path] = hash;
    fileFields.push({
      name: hash,
      value: bytes,
      filename: hash,
      contentType: "text/html; charset=utf-8",
    });
  }

  // 3. POST deployment — manual multipart so every byte is exactly what CF
  //    expects (see buildMultipart comment above).
  const { body, contentType } = buildMultipart([
    { name: "manifest", value: JSON.stringify(manifest) },
    ...fileFields,
    { name: "branch", value: "main" },
  ]);

  const deployUrl = `${CF_API}/accounts/${config.accountId}/pages/projects/${projectName}/deployments`;
  const deployResp = await fetch(deployUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": contentType,
      "Content-Length": String(body.length),
    },
    body: new Uint8Array(body),
  });

  const deployJson = await deployResp.json() as {
    success: boolean;
    result?: { id?: string; url?: string };
    errors?: Array<{ message: string }>;
  };
  if (!deployResp.ok || !deployJson.success) {
    const msg =
      deployJson.errors?.[0]?.message ||
      `Cloudflare deployment failed (HTTP ${deployResp.status}).`;
    throw new DeployError(msg, deployResp.status, deployJson);
  }

  const { id: deploymentId, url: initialUrl } = deployJson.result ?? {};

  // 4. Poll until the preview URL is reachable (CF CDN propagation ~5–30 s).
  let link;
  try {
    link = await waitForReachableDeploymentUrl(
      [initialUrl],
      { providerLabel: "Cloudflare Pages" },
    );
  } catch {
    link = {
      url: initialUrl ?? "",
      status: "ready" as const,
      statusMessage: "Deployed",
    };
  }

  return {
    providerId: "cloudflare-pages",
    url: link.url || initialUrl || "",
    deploymentId: deploymentId ?? "",
    target: "preview",
    status: link.status,
    statusMessage: link.statusMessage || "Ready",
    reachableAt: link.reachableAt,
  };
}
