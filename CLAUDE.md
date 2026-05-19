# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # start dev server (binds 0.0.0.0:3000, accessible over LAN)
pnpm build      # production build
pnpm start      # serve production build
```

No lint or test scripts are defined. TypeScript checking is done implicitly via `next build`.

## Architecture

HTML Anything is a **local-first agentic HTML editor**. The user pastes content (Markdown / CSV / JSON / plain text), picks a skill template, and the app spawns their already-logged-in coding-agent CLI (Claude Code, Codex, Gemini CLI, etc.) to generate a single-file HTML document, streamed live into a sandboxed `<iframe>`.

### Request flow

```
Browser → POST /api/convert (SSE)
  → invokeAgent() spawns CLI via child_process.spawn
  → stdout JSON-lines parsed by makeParser(agent)
  → text deltas re-emitted as SSE events
  → client appends to iframe.srcdoc
```

### Key layers

**Agent detection & invocation** (`src/lib/agents/`)
- `detect.ts` — `AGENTS` registry + `detectAgents()` scans `PATH` (including non-standard dirs like `~/.local/bin`, `~/.bun/bin`) and returns which CLIs are installed. Each `AgentDef` has `bin`, `fallbackBins`, `envOverride`, `protocol`, and `fallbackModels`.
- `argv.ts` — `buildArgv(agent, opts)` constructs the CLI flags per agent, plus `makeParser(agent)` returns a stateful per-invocation line parser emitting `AgentParse` events (`delta` | `html` | `meta` | `noise`). The `html` kind rescues HTML from file-write tool calls (when the agent uses its Write tool instead of streaming inline).
- `invoke.ts` — `invokeAgent()` orchestrates the spawn, stdin write, and SSE event loop.
- Protocols: `stdin` (most agents), `argv` (Gemini: prompt as positional arg), `argv-message` (OpenClaw: `--message <text>`, single JSON blob after close), `acp`/`pi-rpc` (not implemented — surface error).

**Skill template system** (`src/lib/templates/`)
- `loader.ts` — file-based registry scanning `src/lib/templates/skills/`. Each skill is a folder with `SKILL.md` (YAML frontmatter + prompt body), optional `example.md` / `example.html`. No code change needed to add a skill — restart `pnpm dev` and the API picks it up.
- `shared.ts` — `SHARED_DESIGN_DIRECTIVES` (Chinese-first font stack, 8 px baseline grid, no lorem ipsum, CDN-only assets) prepended to every prompt via `assemblePrompt()`.
- `index.ts` — `SkillFrontmatter` type; `scenarios.ts` — scenario/mode grouping for the picker.
- Diff-edit mode: when a task already has generated HTML, `/api/convert` receives `editFromHtml` + `editFromContent` and uses `buildEditPrompt()` instead — asks the agent for minimal changes only, saving tokens and preventing creative drift.

**State management** (`src/lib/store.ts`)
- Single `zustand` store with `persist` middleware (localStorage key `html-everything-store`, current version 7). Stores multi-task state: each `Task` has `content`, `format`, `templateId`, `html`, `status`, `log`, `stats`, `assets`, and `deployments`.
- Per-task setters (`setHtmlFor`, `appendHtmlFor`, `pushLogFor`, etc.) allow background tasks to keep streaming while the user navigates to another task.
- `assets` map: pasted images are stored as `asset:<id>` tokens in the textarea; resolved back to data URLs before the prompt ships.

**SSE streaming** (`src/app/api/convert/route.ts`)
- `export const runtime = "nodejs"` and `dynamic = "force-dynamic"` are required for SSE routes.
- The route assembles the prompt, calls `invokeAgent()`, and pipes parsed deltas back as `data: <json>\n\n` SSE frames.

**Export** (`src/lib/export/`)
- `wechat.ts` — `juice` inlines CSS for WeChat MP paste compatibility.
- `image.ts` — `modern-screenshot` renders the iframe to a 2× PNG.
- `clipboard.ts` — `ClipboardItem` with `text/html` + `image/png` MIME types.
- `deck.ts` — deck-specific PDF export.
- `download.ts` — `.html` standalone download.

**Deploy** (`src/lib/deploy/`, `src/app/api/deploy/`)
- Tokens stored as `~/.html-anything/<provider>.json` (chmod 600). Supported providers: Vercel (`vercel.ts`) and Cloudflare Pages (`cloudflare-pages.ts`).
- Config API (`/api/deploy/config`) reads/writes tokens; deploy API (`/api/deploy`) does the actual push.
- Token mask constants (`SAVED_VERCEL_TOKEN_MASK`, `SAVED_CLOUDFLARE_TOKEN_MASK`) are substituted in responses so raw tokens never leave the server.

**i18n** (`src/lib/i18n.ts`)
- Flat key→string dictionaries. `useT()` hook reads the active locale from the store. Adding a locale = add a dictionary object and register it in `DICTS`. The `Dict` interface enforces complete key coverage at build time.
- Shipped locales: `en`, `zh-CN`, `zh-TW`.

**UI components** (`src/components/`)
- `toolbar.tsx` — agent picker, model picker, Convert button, layout toggle.
- `editor-pane.tsx` — textarea + format detection + upload.
- `preview-pane.tsx` — sandboxed iframe (`sandbox="allow-scripts allow-same-origin"`).
- `template-picker.tsx` — skill gallery with mode/scenario filters.
- `settings-modal.tsx` — Ollama URL, agent binary overrides, locale.
- `deploy-control.tsx` — one-click deploy UI.

## Environment variables

Configured in `.env.local` (not committed). All are `NEXT_PUBLIC_` so they're embedded at build time:

```
NEXT_PUBLIC_OLLAMA_URL=http://<host>:<port>   # Ollama / MLX-VLM server URL
NEXT_PUBLIC_OLLAMA_MODEL=<model-id>           # Default Ollama model
NEXT_PUBLIC_DEFAULT_AGENT=ollama              # Agent selected on first load
```

Agent binary paths can also be overridden per-agent via Settings UI (stored in localStorage under `agentBinOverrides`) or env vars like `CLAUDE_BIN`, `GEMINI_BIN`, etc. (see `detect.ts` `envOverride` fields).

## Adding a skill template

1. Create `src/lib/templates/skills/<skill-id>/SKILL.md` with YAML frontmatter (`name`, `scenario`, `category`, `description`, optionally `recommended`, `featured`) followed by the prompt body.
2. Optionally add `example.md` (sample input) and `example.html` (pre-rendered preview).
3. Restart `pnpm dev` — the picker auto-discovers it.

## Adding a coding-agent adapter

1. Add an `AgentDef` entry to `AGENTS` in `src/lib/agents/detect.ts`.
2. Add a `case` to `buildArgv()` in `src/lib/agents/argv.ts`.
3. Add parser logic in `parseLineWithState()` in `argv.ts`.
4. Handle stdin/argv/argv-message protocol differences in `src/lib/agents/invoke.ts`.
