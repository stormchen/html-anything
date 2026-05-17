import { promises as fsp, chmodSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

/**
 * Per-provider config file storage. Tokens live as plaintext in
 * `~/.html-anything/<provider>.json` (chmod 600). When the API surfaces them
 * back to the client we substitute a fixed mask string so the real token
 * never leaves the server. The client sends the mask back unchanged when it
 * wants the existing value preserved during a partial update.
 *
 * Architecture cribbed from open-design (`apps/daemon/src/deploy.ts`):
 * single host, no multi-tenant story, no encryption-at-rest beyond chmod.
 * Acceptable because (a) HTML Anything is a developer tool the user runs
 * themselves and (b) the same machine already holds the dev's other CLI
 * sessions (claude, vercel, etc.) at similar trust level.
 */

import {
  VERCEL_PROVIDER_ID,
  CLOUDFLARE_PAGES_PROVIDER_ID,
  GITHUB_REPO_PROVIDER_ID,
  type DeployProviderId,
} from "./constants";

export { VERCEL_PROVIDER_ID, CLOUDFLARE_PAGES_PROVIDER_ID, GITHUB_REPO_PROVIDER_ID };
export type { DeployProviderId };

export const SAVED_VERCEL_TOKEN_MASK = "saved-vercel-token";
export const SAVED_CLOUDFLARE_TOKEN_MASK = "saved-cloudflare-token";
export const SAVED_GITHUB_TOKEN_MASK = "saved-github-repo-token";

/** Stored on-disk shape. Different providers populate different fields. */
export type DeployConfig = {
  token?: string;
  // Vercel
  teamId?: string;
  teamSlug?: string;
  // Cloudflare Pages
  accountId?: string;
  /** Legacy: pre-computed Pages project name. New writes leave this empty
   *  and the deployer derives it per-task. */
  projectName?: string;
  // GitHub Repo
  repo?: string;      // owner/repo, e.g. "stormchen/blog"
  branch?: string;    // target branch, default "main"
  filePath?: string;  // path in repo, default "html-anything/index.html"
  siteUrl?: string;   // Cloudflare Pages URL for the "Live at" link
};

/** Public-facing shape returned to the client. Token is masked. */
export type PublicDeployConfig = {
  providerId: DeployProviderId;
  configured: boolean;
  tokenMask: string;
  teamId?: string;
  teamSlug?: string;
  accountId?: string;
  projectName?: string;
  repo?: string;
  branch?: string;
  filePath?: string;
  siteUrl?: string;
  target: "preview";
};

export class DeployError extends Error {
  status: number;
  details?: unknown;
  code?: string;

  constructor(message: string, status = 400, details?: unknown, code?: string) {
    super(message);
    this.name = "DeployError";
    this.status = status;
    this.details = details;
    this.code = code;
  }
}

export function deployConfigPath(providerId: DeployProviderId): string {
  // `HTML_ANYTHING_USER_STATE_DIR` lets tests / sandboxed environments
  // redirect storage. Otherwise fall back to `~/.html-anything/`.
  const base =
    process.env.HTML_ANYTHING_USER_STATE_DIR ||
    path.join(homedir(), ".html-anything");
  const file =
    providerId === CLOUDFLARE_PAGES_PROVIDER_ID
      ? "cloudflare-pages.json"
      : providerId === GITHUB_REPO_PROVIDER_ID
        ? "github-repo.json"
        : "vercel.json";
  return path.join(base, file);
}

function isEnoent(err: unknown): err is NodeJS.ErrnoException {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as NodeJS.ErrnoException).code === "ENOENT"
  );
}

async function writeDeployConfigFile(
  file: string,
  config: DeployConfig,
): Promise<void> {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
  // mode flag on writeFile only sets perms when the file is created; force
  // chmod for the overwrite case. Best-effort on filesystems that don't
  // support it (e.g. Windows / FAT32).
  try {
    chmodSync(file, 0o600);
  } catch {
    /* ignore */
  }
}

export async function readVercelConfig(): Promise<DeployConfig> {
  try {
    const raw = await fsp.readFile(
      deployConfigPath(VERCEL_PROVIDER_ID),
      "utf8",
    );
    const parsed = JSON.parse(raw) as Partial<DeployConfig>;
    return {
      token: typeof parsed.token === "string" ? parsed.token : "",
      teamId: typeof parsed.teamId === "string" ? parsed.teamId : "",
      teamSlug: typeof parsed.teamSlug === "string" ? parsed.teamSlug : "",
    };
  } catch (err) {
    if (isEnoent(err)) return { token: "", teamId: "", teamSlug: "" };
    throw err;
  }
}

export async function readCloudflarePagesConfig(): Promise<DeployConfig> {
  try {
    const raw = await fsp.readFile(
      deployConfigPath(CLOUDFLARE_PAGES_PROVIDER_ID),
      "utf8",
    );
    const parsed = JSON.parse(raw) as Partial<DeployConfig>;
    return {
      token: typeof parsed.token === "string" ? parsed.token : "",
      accountId:
        typeof parsed.accountId === "string" ? parsed.accountId : "",
      projectName:
        typeof parsed.projectName === "string" ? parsed.projectName : "",
    };
  } catch (err) {
    if (isEnoent(err)) return { token: "", accountId: "", projectName: "" };
    throw err;
  }
}

export async function readGithubRepoConfig(): Promise<DeployConfig> {
  try {
    const raw = await fsp.readFile(
      deployConfigPath(GITHUB_REPO_PROVIDER_ID),
      "utf8",
    );
    const parsed = JSON.parse(raw) as Partial<DeployConfig>;
    return {
      token: typeof parsed.token === "string" ? parsed.token : "",
      repo: typeof parsed.repo === "string" ? parsed.repo : "",
      branch: typeof parsed.branch === "string" ? parsed.branch : "",
      filePath: typeof parsed.filePath === "string" ? parsed.filePath : "",
      siteUrl: typeof parsed.siteUrl === "string" ? parsed.siteUrl : "",
    };
  } catch (err) {
    if (isEnoent(err)) return { token: "", repo: "", branch: "", filePath: "", siteUrl: "" };
    throw err;
  }
}

export async function readDeployConfig(
  providerId: DeployProviderId,
): Promise<DeployConfig> {
  if (providerId === CLOUDFLARE_PAGES_PROVIDER_ID) return readCloudflarePagesConfig();
  if (providerId === GITHUB_REPO_PROVIDER_ID) return readGithubRepoConfig();
  return readVercelConfig();
}

export async function writeVercelConfig(
  input: Partial<DeployConfig>,
): Promise<PublicDeployConfig> {
  const current = await readVercelConfig();
  const tokenInput = typeof input?.token === "string" ? input.token.trim() : "";
  // The mask string is what the client sends back when it wants to keep
  // the existing token. Don't overwrite real value with a mask.
  const next: DeployConfig = {
    token:
      tokenInput && tokenInput !== SAVED_VERCEL_TOKEN_MASK
        ? tokenInput
        : current.token,
    teamId:
      typeof input?.teamId === "string" ? input.teamId.trim() : current.teamId,
    teamSlug:
      typeof input?.teamSlug === "string"
        ? input.teamSlug.trim()
        : current.teamSlug,
  };
  if (!next.token) {
    throw new DeployError("Vercel API token is required.", 400);
  }
  await writeDeployConfigFile(deployConfigPath(VERCEL_PROVIDER_ID), next);
  return publicVercelConfig(next);
}

export async function writeCloudflarePagesConfig(
  input: Partial<DeployConfig>,
): Promise<PublicDeployConfig> {
  const current = await readCloudflarePagesConfig();
  const tokenInput = typeof input?.token === "string" ? input.token.trim() : "";
  const next: DeployConfig = {
    token:
      tokenInput && tokenInput !== SAVED_CLOUDFLARE_TOKEN_MASK
        ? tokenInput
        : current.token,
    accountId:
      typeof input?.accountId === "string"
        ? input.accountId.trim()
        : current.accountId,
    // Pages project name is derived per-task by the deployer (see
    // `cloudflarePagesProjectNameForTask`), so we no longer persist a
    // user-set value. Intentionally cleared on write.
    projectName: "",
  };
  if (!next.token) {
    throw new DeployError("Cloudflare API token is required.", 400);
  }
  if (!next.accountId) {
    throw new DeployError("Cloudflare account ID is required.", 400);
  }
  await writeDeployConfigFile(
    deployConfigPath(CLOUDFLARE_PAGES_PROVIDER_ID),
    next,
  );
  return publicCloudflarePagesConfig(next);
}

export async function writeGithubRepoConfig(
  input: Partial<DeployConfig>,
): Promise<PublicDeployConfig> {
  const current = await readGithubRepoConfig();
  const tokenInput = typeof input?.token === "string" ? input.token.trim() : "";
  const next: DeployConfig = {
    token:
      tokenInput && tokenInput !== SAVED_GITHUB_TOKEN_MASK
        ? tokenInput
        : current.token,
    repo: typeof input?.repo === "string" ? input.repo.trim() : current.repo,
    branch: typeof input?.branch === "string" ? input.branch.trim() : current.branch,
    filePath: typeof input?.filePath === "string" ? input.filePath.trim() : current.filePath,
    siteUrl: typeof input?.siteUrl === "string" ? input.siteUrl.trim() : current.siteUrl,
  };
  if (!next.token) {
    throw new DeployError("GitHub Personal Access Token is required.", 400);
  }
  if (!next.repo) {
    throw new DeployError("GitHub repository is required (format: owner/repo).", 400);
  }
  await writeDeployConfigFile(deployConfigPath(GITHUB_REPO_PROVIDER_ID), next);
  return publicGithubRepoConfig(next);
}

export async function writeDeployConfig(
  providerId: DeployProviderId,
  input: Partial<DeployConfig> = {},
): Promise<PublicDeployConfig> {
  if (providerId === CLOUDFLARE_PAGES_PROVIDER_ID) return writeCloudflarePagesConfig(input);
  if (providerId === GITHUB_REPO_PROVIDER_ID) return writeGithubRepoConfig(input);
  return writeVercelConfig(input);
}

export function publicVercelConfig(
  config: Partial<DeployConfig>,
): PublicDeployConfig {
  return {
    providerId: VERCEL_PROVIDER_ID,
    configured: Boolean(config.token),
    tokenMask: config.token ? SAVED_VERCEL_TOKEN_MASK : "",
    teamId: config.teamId || "",
    teamSlug: config.teamSlug || "",
    target: "preview",
  };
}

export function publicCloudflarePagesConfig(
  config: Partial<DeployConfig>,
): PublicDeployConfig {
  return {
    providerId: CLOUDFLARE_PAGES_PROVIDER_ID,
    configured: Boolean(config.token && config.accountId),
    tokenMask: config.token ? SAVED_CLOUDFLARE_TOKEN_MASK : "",
    accountId: config.accountId || "",
    projectName: config.projectName || "",
    target: "preview",
  };
}

export function publicGithubRepoConfig(
  config: Partial<DeployConfig>,
): PublicDeployConfig {
  return {
    providerId: GITHUB_REPO_PROVIDER_ID,
    configured: Boolean(config.token && config.repo),
    tokenMask: config.token ? SAVED_GITHUB_TOKEN_MASK : "",
    repo: config.repo || "",
    branch: config.branch || "",
    filePath: config.filePath || "",
    siteUrl: config.siteUrl || "",
    target: "preview",
  };
}

export function publicDeployConfigForProvider(
  providerId: DeployProviderId,
  config: Partial<DeployConfig> = {},
): PublicDeployConfig {
  if (providerId === CLOUDFLARE_PAGES_PROVIDER_ID) return publicCloudflarePagesConfig(config);
  if (providerId === GITHUB_REPO_PROVIDER_ID) return publicGithubRepoConfig(config);
  return publicVercelConfig(config);
}

export function isDeployProviderId(value: unknown): value is DeployProviderId {
  return (
    value === VERCEL_PROVIDER_ID ||
    value === CLOUDFLARE_PAGES_PROVIDER_ID ||
    value === GITHUB_REPO_PROVIDER_ID
  );
}
