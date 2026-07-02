"use client";

import type { DeckSlide } from "@/lib/deck";
import { downloadBlob } from "./image";

const BOOLEAN_ATTRS = new Set([
  "disabled",
  "checked",
  "selected",
  "readOnly",
  "multiple",
  "required",
  "muted",
  "autoFocus",
  "loop",
  "controls",
]);

const ATTR_MAP: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  tabindex: "tabIndex",
  autocomplete: "autoComplete",
  readonly: "readOnly",
  maxlength: "maxLength",
  charset: "charSet",
  crossorigin: "crossOrigin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-miterlimit": "strokeMiterlimit",
  "fill-opacity": "fillOpacity",
  "stroke-opacity": "strokeOpacity",
};

/** Parse inline style string to JSX-compatible style string */
function parseStyleStr(styleStr: string): string {
  const rules = styleStr.split(";").filter((r) => r.trim());
  const styleObj: Record<string, string> = {};
  for (const rule of rules) {
    const idx = rule.indexOf(":");
    if (idx === -1) continue;
    const rawProp = rule.slice(0, idx).trim();
    const val = rule.slice(idx + 1).trim();
    // Convert kebab-case property to camelCase
    const prop = rawProp.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    styleObj[prop] = val;
  }
  const pairs = Object.entries(styleObj).map(
    ([k, v]) => `${k}: ${JSON.stringify(v)}`
  );
  return `{{ ${pairs.join(", ")} }}`;
}

/** Escapes special JSX characters in text nodes */
function escapeText(text: string): string {
  // If it's a simple clean string, return it as is.
  // Otherwise wrap it in curly braces and JSON stringify to escape safely.
  if (/^[a-zA-Z0-9\s\u4e00-\u9fa5，。？！、：；“”‘’（）《》]+$/.test(text)) {
    return text;
  }
  return `{${JSON.stringify(text)}}`;
}

/** Recursive conversion of DOM nodes to JSX string */
function domToJsx(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    if (!text.trim()) {
      return text;
    }
    return escapeText(text);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ""; // Skip comments and other node types
  }

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  const attrs: string[] = [];
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    const name = attr.name;
    const val = attr.value;

    if (name === "class") {
      attrs.push(`className=${JSON.stringify(val)}`);
    } else if (name === "style") {
      attrs.push(`style=${parseStyleStr(val)}`);
    } else if (name.startsWith("data-") || name.startsWith("aria-")) {
      attrs.push(`${name}=${JSON.stringify(val)}`);
    } else {
      const camelName = name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const attrName = ATTR_MAP[name] || camelName;
      if (BOOLEAN_ATTRS.has(attrName)) {
        attrs.push(`${attrName}={true}`);
      } else {
        attrs.push(`${attrName}=${JSON.stringify(val)}`);
      }
    }
  }

  const children: string[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    children.push(domToJsx(el.childNodes[i]));
  }

  const attrsStr = attrs.length > 0 ? " " + attrs.join(" ") : "";

  if (children.length === 0) {
    return `<${tag}${attrsStr} />`;
  } else {
    return `<${tag}${attrsStr}>${children.join("")}</${tag}>`;
  }
}

/** Convert a slide's HTML string into a React TSX component string */
function convertSlideHtmlToTsx(slideHtml: string): string {
  // Parse HTML
  if (typeof window === "undefined") return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(slideHtml, "text/html");
  // Find the main section.slide element
  const slideEl = doc.querySelector("section.slide");
  if (!slideEl) {
    return `import type { Page } from '@open-slide/core';

const SlidePage: Page = () => (
  <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white">
    <h1>Slide parsed error</h1>
  </div>
);

export default [SlidePage] satisfies Page[];
`;
  }

  // Convert node to JSX
  const jsxCode = domToJsx(slideEl);

  return `import type { Page } from '@open-slide/core';

const SlidePage: Page = () => (
  ${jsxCode}
);

export default [SlidePage] satisfies Page[];
`;
}

/** Export all slides as a full-fledged open-slide React project inside a ZIP file */
export async function exportDeckOpenSlide(
  slides: DeckSlide[],
  basename = "open-slide-deck"
): Promise<void> {
  if (slides.length === 0) throw new Error("no slides");

  // Lazy-load JSZip
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  // 1. Generate slides/ directory
  const pad = (n: number) => String(n).padStart(2, "0");
  slides.forEach((slide, index) => {
    const slideNum = index + 1;
    const folderName = `slides/${pad(slideNum)}-slide`;
    
    // Convert HTML to JSX
    const tsxCode = convertSlideHtmlToTsx(slide.html);
    
    // Append notes if present
    let finalCode = tsxCode;
    if (slide.notes) {
      finalCode += `\nexport const notes = ${JSON.stringify(slide.notes)};\n`;
    }
    
    zip.file(`${folderName}/index.tsx`, finalCode);
  });

  // 2. Generate package.json
  const pkgJson = {
    name: basename.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "open-slide dev",
      build: "open-slide build",
      preview: "open-slide preview",
    },
    dependencies: {
      "@open-slide/core": "^0.1.0",
      react: "^19.2.4",
      "react-dom": "^19.2.4",
    },
    devDependencies: {
      typescript: "^5.7.0",
    },
  };
  zip.file("package.json", JSON.stringify(pkgJson, null, 2));

  // 3. Generate open-slide.config.ts
  const configTs = `import { defineConfig } from '@open-slide/core';

export default defineConfig({
  // Configure open-slide options here
});
`;
  zip.file("open-slide.config.ts", configTs);

  // 4. Generate README.md
  const readmeMd = `# Open-Slide Presentation Deck

This presentation was generated with **HTML Anything** and exported as a React project using the [1weiho/open-slide](https://github.com/1weiho/open-slide) framework.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   pnpm install
   # or
   npm install
   \`\`\`

2. Run local dev server:
   \`\`\`bash
   pnpm dev
   # or
   npm run dev
   \`\`\`
   This will start a local server (usually at \`http://localhost:5173\`) with:
   - Live presentation preview
   - Speaker notes panel
   - Drawing tools & laser pointer
   - Navigation controls (Arrow keys, Spacebar, swipe gestures)

3. Build and Export:
   \`\`\`bash
   pnpm build
   # or
   npm run build
   \`\`\`
   This outputs static files that can be published to Vercel, Netlify, or Cloudflare Pages, or printed to PDF.

## Project Structure

- \`slides/\` - Individual React components for each slide.
  - \`slides/01-slide/index.tsx\` - Slide 1 component and notes.
  - \`slides/02-slide/index.tsx\` - Slide 2 component and notes.
- \`open-slide.config.ts\` - Open-Slide configuration.
- \`CLAUDE.md\` - Agent directives for editing slides.
`;
  zip.file("README.md", readmeMd);

  // 5. Generate CLAUDE.md
  const claudeMd = `# CLAUDE.md

This file provides guidance to coding agents (such as Claude Code) when modifying slides in this repository.

## Commands

- \`npm install\` / \`pnpm install\` - Install dependencies
- \`npm run dev\` / \`pnpm dev\` - Start dev server (brings up slide preview & notes)
- \`npm run build\` / \`pnpm build\` - Compile and export slides as static build

## Slide Guidelines

- Slides are located under the \`slides/\` directory.
- Each slide has its own folder, e.g., \`slides/01-slide/index.tsx\`.
- The folder name determines the slide order (alphabetical/numeric order).
- The \`index.tsx\` file must export a default array of \`Page\` components:
  \`\`\`tsx
  import type { Page } from '@open-slide/core';
  
  const Slide: Page = () => (
    <div className="...">...</div>
  );
  
  export default [Slide] satisfies Page[];
  \`\`\`
- Speaker notes can be exported as a string in the same file:
  \`\`\`tsx
  export const notes = "Speaker notes content...";
  \`\`\`
- Design specs:
  - All slides render inside a fixed \`1920 × 1080\` canvas.
  - Rely on Tailwind CSS for all styling.
  - Keep slide content centered or aligned strictly within the 1920x1080 boundary (no overflow or scrollbars).
`;
  zip.file("CLAUDE.md", claudeMd);

  // 6. Generate ZIP and download
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, `${basename}-open-slide-${Date.now()}.zip`);
}
