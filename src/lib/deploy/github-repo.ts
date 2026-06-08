import { DeployError, type DeployConfig } from "./config";
import type { DeployFile } from "./vercel";

const GH_API = "https://api.github.com";

export type GithubRepoDeployResult = {
  providerId: "github-repo";
  url: string;
  commitUrl: string;
  deploymentId: string;
  target: "preview";
  status: "ready";
  statusMessage: string;
};

async function ghRequest(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const resp = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined ?? {}),
    },
  });
  const json = await resp.json();
  if (!resp.ok) {
    throw new DeployError(
      (json as { message?: string }).message ||
        `GitHub API error (${resp.status}).`,
      resp.status,
      json,
    );
  }
  return json;
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim() || "Untitled";
}

function extractDescription(html: string): string {
  // 1. Try <meta name="description" content="...">
  const m =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,200})["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']{1,200})["'][^>]+name=["']description["']/i);
  if (m?.[1]) return m[1].trim();

  // 2. Fallback: Extract from content
  // Remove scripts, styles, and tags to get clean text
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const content = bodyMatch ? bodyMatch[1] : html;

  const cleanText = content
    .replace(/<(script|style|nav|footer)[^>]*>([\s\S]*?)<\/\1>/gi, "") // Remove non-content tags
    .replace(/<[^>]+>/g, " ") // Remove all other tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();

  // Take the first 150 characters as a summary
  if (cleanText.length > 0) {
    return cleanText.slice(0, 150) + (cleanText.length > 150 ? "..." : "");
  }

  return "由 HTML Anything 生成";
}

function generateSlug(taskId: string): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const id = taskId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase();
  return `${date}-${id}`;
}

/** Inject a small floating "← 返回" button just before </body>. */
function injectBackNav(html: string, galleryUrl: string): string {
  const nav =
    `<div id="__ha_back" style="position:fixed;bottom:16px;right:16px;z-index:2147483647;">` +
    `<a href="${galleryUrl}" style="display:inline-flex;align-items:center;gap:5px;` +
    `padding:7px 14px;background:rgba(15,15,15,0.82);color:#fff;text-decoration:none;` +
    `border-radius:100px;font-size:12px;font-family:-apple-system,system-ui,sans-serif;` +
    `backdrop-filter:blur(8px);letter-spacing:0.01em;">← 返回</a></div>`;
  return html.includes("</body>")
    ? html.replace(/<\/body>/i, `${nav}\n</body>`)
    : html + nav;
}

/**
 * Commit multiple files in one Git commit using the Git Data API.
 *
 * Contents API (PUT /contents/{path}) only handles one file per request and
 * creates one commit per call. The Git Data API lets us build a tree with
 * any number of files and wrap it in a single commit.
 *
 * Includes automatic retry (up to 3 attempts) when the branch ref PATCH
 * returns 422 "Reference cannot be updated" — this happens when another
 * commit advances the branch between the time we read the HEAD SHA and
 * the time we try to update the ref (race condition).
 */
async function commitFiles(
  token: string,
  repo: string,
  branch: string,
  message: string,
  files: Array<{ path: string; content: string; encoding: "base64" | "utf-8" }>,
): Promise<{ sha: string; html_url?: string }> {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // 1. Resolve HEAD commit SHA (re-read on every retry to get latest)
    const ref = (await ghRequest(
      token,
      `/repos/${repo}/git/ref/heads/${branch}`,
    )) as { object: { sha: string } };
    const headSha = ref.object.sha;

    // 2. Resolve current tree SHA
    const headCommit = (await ghRequest(
      token,
      `/repos/${repo}/git/commits/${headSha}`,
    )) as { tree: { sha: string } };
    const treeSha = headCommit.tree.sha;

    // 3. Create a blob for every file (parallel)
    const blobs = await Promise.all(
      files.map((f) =>
        ghRequest(token, `/repos/${repo}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: f.content, encoding: f.encoding }),
        }) as Promise<{ sha: string }>,
      ),
    );

    // 4. Build a new tree on top of the existing one
    const newTree = (await ghRequest(token, `/repos/${repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({
        base_tree: treeSha,
        tree: files.map((f, i) => ({
          path: f.path,
          mode: "100644",
          type: "blob",
          sha: blobs[i].sha,
        })),
      }),
    })) as { sha: string };

    // 5. Create the commit
    const newCommit = (await ghRequest(token, `/repos/${repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message,
        tree: newTree.sha,
        parents: [headSha],
      }),
    })) as { sha: string; html_url?: string };

    // 6. Fast-forward the branch ref — may fail with 422 if another commit
    //    raced ahead of us. Retry from step 1 with the updated HEAD.
    try {
      await ghRequest(token, `/repos/${repo}/git/refs/heads/${branch}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: newCommit.sha }),
      });
      return newCommit;
    } catch (err) {
      const isConflict =
        err instanceof DeployError && err.status === 422;
      if (isConflict && attempt < MAX_RETRIES) {
        // Branch was pushed by another commit between our read and write.
        // Wait briefly, then retry the entire sequence with the new HEAD.
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }
      throw err;
    }
  }

  // Unreachable — TypeScript needs an explicit throw.
  throw new DeployError("Failed to update branch ref after retries.", 422);
}

export async function deployToGithubRepo({
  config,
  files,
  taskId,
}: {
  config: DeployConfig;
  files: DeployFile[];
  taskId: string;
}): Promise<GithubRepoDeployResult> {
  if (!config?.token) {
    throw new DeployError("GitHub Personal Access Token is required.", 400);
  }

  const repo = config.repo?.trim();
  const branch = config.branch?.trim() || "main";
  const siteUrl = config.siteUrl?.trim().replace(/\/$/, "") || "";

  if (!repo || !repo.includes("/")) {
    throw new DeployError(
      "GitHub repository is required (format: owner/repo).",
      400,
    );
  }

  const file = files.find((f) => f.file === "index.html") ?? files[0];
  if (!file) throw new DeployError("No files to deploy.", 400);

  const rawHtml =
    typeof file.data === "string" ? file.data : file.data.toString("utf-8");

  const title = extractTitle(rawHtml);
  const description = extractDescription(rawHtml);
  const slug = generateSlug(taskId);
  const galleryUrl = siteUrl || "/";
  const htmlWithNav = injectBackNav(rawHtml, galleryUrl);

  const htmlPath = `public/p/${slug}/index.html`;
  const jsonPath = `src/content/pages/${slug}.json`;

  const jsonContent = JSON.stringify(
    { title, description, pubDate: new Date().toISOString() },
    null,
    2,
  );

  const commit = await commitFiles(
    config.token,
    repo,
    branch,
    `publish: ${title}`,
    [
      {
        path: htmlPath,
        content: Buffer.from(htmlWithNav).toString("base64"),
        encoding: "base64",
      },
      {
        path: jsonPath,
        content: jsonContent,
        encoding: "utf-8",
      },
    ],
  );

  const commitUrl =
    commit.html_url ??
    `https://github.com/${repo}/commit/${commit.sha}`;
  const liveUrl = siteUrl
    ? `${siteUrl}/p/${slug}/`
    : `https://github.com/${repo}/blob/${branch}/${htmlPath}`;

  return {
    providerId: "github-repo",
    url: liveUrl,
    commitUrl,
    deploymentId: commit.sha.slice(0, 7),
    target: "preview",
    status: "ready",
    statusMessage: `Published: ${title}`,
  };
}
