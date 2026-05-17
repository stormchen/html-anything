import { NextRequest, NextResponse } from "next/server";
import { promises as fsp } from "node:fs";
import fs from "node:fs";
import path from "node:path";
import {
  readGithubRepoConfig,
  readVercelConfig,
  readCloudflarePagesConfig,
  deployConfigPath,
} from "@/lib/deploy/config";
import {
  GITHUB_REPO_PROVIDER_ID,
  VERCEL_PROVIDER_ID,
  CLOUDFLARE_PAGES_PROVIDER_ID,
} from "@/lib/deploy/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

const ALLOWED_ENV_KEYS = [
  "NEXT_PUBLIC_OLLAMA_URL",
  "NEXT_PUBLIC_OLLAMA_MODEL",
  "NEXT_PUBLIC_DEFAULT_AGENT",
];

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    if (ALLOWED_ENV_KEYS.includes(key)) {
      result[key] = trimmed.slice(eqIdx + 1).trim();
    }
  }
  return result;
}

/**
 * GET /api/backup
 * Returns raw token configs (unmasked) + env vars for client-side encryption.
 */
export async function GET() {
  try {
    const [github, vercel, cloudflare] = await Promise.all([
      readGithubRepoConfig(),
      readVercelConfig(),
      readCloudflarePagesConfig(),
    ]);
    const envRaw = fs.existsSync(ENV_PATH)
      ? fs.readFileSync(ENV_PATH, "utf-8")
      : "";
    const envLocal = parseEnvFile(envRaw);
    return NextResponse.json({
      tokens: {
        [GITHUB_REPO_PROVIDER_ID]: github,
        [VERCEL_PROVIDER_ID]: vercel,
        [CLOUDFLARE_PAGES_PROVIDER_ID]: cloudflare,
      },
      envLocal,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * POST /api/backup
 * Accepts decrypted token data and writes directly to ~/.html-anything/<provider>.json.
 * Validation is intentionally skipped here — we're restoring a known-good backup.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      tokens?: Record<string, Record<string, string>>;
    };
    const { tokens } = body;
    if (!tokens || typeof tokens !== "object") {
      return NextResponse.json({ ok: true });
    }

    const writeOps: Promise<void>[] = [];

    for (const providerId of [
      GITHUB_REPO_PROVIDER_ID,
      VERCEL_PROVIDER_ID,
      CLOUDFLARE_PAGES_PROVIDER_ID,
    ] as const) {
      const cfg = tokens[providerId];
      if (!cfg || typeof cfg !== "object" || !cfg.token) continue;
      const file = deployConfigPath(providerId);
      writeOps.push(
        fsp
          .mkdir(path.dirname(file), { recursive: true })
          .then(() =>
            fsp.writeFile(file, `${JSON.stringify(cfg, null, 2)}\n`, {
              mode: 0o600,
            }),
          ),
      );
    }

    await Promise.all(writeOps);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
