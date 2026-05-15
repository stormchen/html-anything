import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENV_PATH = path.resolve(process.cwd(), ".env.local");

/** 讀取 .env.local 並解析成 key-value Map */
function parseEnvFile(content: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    map.set(key, value);
  }
  return map;
}

/** 將 Map 重新序列化成 .env.local 格式，保留原有的注解行 */
function serializeEnvFile(
  original: string,
  updates: Record<string, string>,
): string {
  const lines = original.split("\n");
  const updatedKeys = new Set(Object.keys(updates));
  const written = new Set<string>();

  const result = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return line;
    const key = trimmed.slice(0, eqIdx).trim();
    if (updatedKeys.has(key)) {
      written.add(key);
      return `${key}=${updates[key]}`;
    }
    return line;
  });

  // 加入原本不存在的新 key
  for (const [key, value] of Object.entries(updates)) {
    if (!written.has(key)) {
      result.push(`${key}=${value}`);
    }
  }

  return result.join("\n");
}

/** GET /api/config — 讀取目前 .env.local 設定 */
export async function GET() {
  try {
    const content = fs.existsSync(ENV_PATH)
      ? fs.readFileSync(ENV_PATH, "utf-8")
      : "";
    const map = parseEnvFile(content);
    return NextResponse.json({
      NEXT_PUBLIC_OLLAMA_URL: map.get("NEXT_PUBLIC_OLLAMA_URL") ?? "",
      NEXT_PUBLIC_OLLAMA_MODEL: map.get("NEXT_PUBLIC_OLLAMA_MODEL") ?? "",
      NEXT_PUBLIC_DEFAULT_AGENT: map.get("NEXT_PUBLIC_DEFAULT_AGENT") ?? "",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/config — 更新 .env.local 中的特定 key */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const allowed = [
      "NEXT_PUBLIC_OLLAMA_URL",
      "NEXT_PUBLIC_OLLAMA_MODEL",
      "NEXT_PUBLIC_DEFAULT_AGENT",
    ];

    // 只允許更新白名單內的 key
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (typeof body[key] === "string") {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid keys to update" }, { status: 400 });
    }

    const original = fs.existsSync(ENV_PATH)
      ? fs.readFileSync(ENV_PATH, "utf-8")
      : "";
    const updated = serializeEnvFile(original, updates);
    if (updated !== original) {
      fs.writeFileSync(ENV_PATH, updated, "utf-8");
    }

    return NextResponse.json({ ok: true, updated: Object.keys(updates) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
