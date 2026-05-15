import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let host = searchParams.get("host") || "http://localhost:11434";
  host = host.replace(/\/$/, "");

  try {
    // 1. Try OpenAI-compatible endpoint (/v1/models) - commonly used by MLX-VLM, LM Studio, etc.
    try {
      const v1Res = await fetch(`${host}/v1/models`, { signal: AbortSignal.timeout(2000) });
      if (v1Res.ok) {
        const data = await v1Res.json();
        if (data.data && Array.isArray(data.data)) {
          return NextResponse.json({
            models: data.data.map((m: any) => ({ id: m.id, label: m.id })),
          });
        }
      }
    } catch (e) {}

    // 2. Try Ollama-compatible endpoint (/api/tags)
    const res = await fetch(`${host}/api/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Server error: ${res.statusText}` }, { status: res.status });
    }

    const data = await res.json();
    const models = (data.models || []).map((m: any) => ({
      id: m.name,
      label: m.name,
    }));

    return NextResponse.json({ models });
  } catch (err: any) {
    console.error("[Ollama Proxy] Failed to fetch models:", err);
    return NextResponse.json({ error: err.message || "Failed to reach Ollama" }, { status: 500 });
  }
}
