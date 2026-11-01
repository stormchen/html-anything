import { chromium, webkit } from "@playwright/test";
import { EncryptJWT } from "jose";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const PORT = 3199;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SECRET = "verify-mobile-secret-key-32chars-minimum!!";
const EMAIL = "verify@example.com";
const OUT_DIR =
  process.env.VERIFY_OUT_DIR ||
  "C:/Users/chen_/.gemini/antigravity/brain/ed41d6af-9c84-47c5-98b4-36ba775d14ca";

async function createSessionToken() {
  const hash = crypto.createHash("sha256").update(SECRET).digest();
  const key = new Uint8Array(hash);
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return await new EncryptJWT({
    email: EMAIL,
    name: "Verifier",
    sub: "verify-sub-1",
    expiresAt,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .encrypt(key);
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("Server did not start in time");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const nextBin = path.join(
    process.cwd(),
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    env: {
      ...process.env,
      PORT: String(PORT),
      AUTH_SECRET: SECRET,
      ALLOWED_EMAILS: EMAIL,
    },
    stdio: "pipe",
  });

  try {
    await waitForServer(BASE_URL);
    console.log("✓ Next.js server listening on", BASE_URL);

    // 1. Verify unauthenticated PWA endpoints
    const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`, {
      redirect: "manual",
    });
    if (manifestRes.status !== 200) {
      throw new Error(`/manifest.webmanifest returned ${manifestRes.status}`);
    }
    const manifestJson = await manifestRes.json();
    if (manifestJson.display !== "standalone") {
      throw new Error(`Expected display=standalone, got ${manifestJson.display}`);
    }
    console.log("✓ /manifest.webmanifest HTTP 200, display=standalone");

    const iconRes = await fetch(`${BASE_URL}/icon`, { redirect: "manual" });
    const appleIconRes = await fetch(`${BASE_URL}/apple-icon`, {
      redirect: "manual",
    });
    if (iconRes.status !== 200 || appleIconRes.status !== 200) {
      throw new Error(
        `Icon status check failed: icon=${iconRes.status}, apple-icon=${appleIconRes.status}`,
      );
    }
    console.log(
      "✓ /icon and /apple-icon HTTP 200, content-type:",
      iconRes.headers.get("content-type"),
    );

    const token = await createSessionToken();
    const browser = await webkit.launch();

    // 2. iPhone 15 Pro Portrait (393 x 852, DPR 3, touch)
    const portraitCtx = await browser.newContext({
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    });
    await portraitCtx.addCookies([
      {
        name: "session",
        value: token,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);

    const pPage = await portraitCtx.newPage();
    await pPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await pPage.locator(".m-shell").waitFor({ state: "visible", timeout: 10000 });

    const fontSize = await pPage
      .locator(".m-editor-textarea")
      .evaluate((el) => window.getComputedStyle(el).fontSize);
    if (fontSize !== "16px") {
      throw new Error(`Expected mobile textarea font-size 16px, got ${fontSize}`);
    }
    console.log("✓ iPhone 15 Pro Portrait rendered .m-shell, textarea font-size =", fontSize);

    await pPage
      .locator(".m-editor-textarea")
      .fill("# iPhone 15 Pro PWA 測試\n\n這是一段在行動版輸入視圖撰寫的內容，字級為 16px，聚焦時不會觸發 iOS Safari 自動放大。");
    await pPage.waitForTimeout(300);
    await pPage.screenshot({
      path: path.join(OUT_DIR, "iphone15pro-portrait-editor.png"),
    });

    // Open Template Sheet
    await pPage.locator(".m-shell button").nth(3).click();
    await pPage.locator('[role="dialog"]').waitFor({ state: "visible" });
    await pPage.waitForTimeout(300);
    await pPage.screenshot({
      path: path.join(OUT_DIR, "iphone15pro-portrait-templates.png"),
    });
    await pPage.locator('[role="dialog"] button[aria-label="關閉"]').click();

    // Open Task Sheet
    await pPage.locator(".m-shell header > button").first().click();
    await pPage.locator('[role="dialog"]').waitFor({ state: "visible" });
    await pPage.waitForTimeout(300);
    await pPage.screenshot({
      path: path.join(OUT_DIR, "iphone15pro-portrait-tasks.png"),
    });
    await pPage.locator('[role="dialog"] button[aria-label="關閉"]').click();

    // Switch to Preview tab
    await pPage.locator('[role="tab"]').nth(1).click();
    await pPage.waitForTimeout(1200);
    await pPage.screenshot({
      path: path.join(OUT_DIR, "iphone15pro-portrait-preview.png"),
    });
    console.log("✓ iPhone 15 Pro Portrait screenshots saved");
    await portraitCtx.close();

    // 3. iPhone 15 Pro Landscape (852 x 393, DPR 3, touch)
    const landscapeCtx = await browser.newContext({
      viewport: { width: 852, height: 393 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    });
    await landscapeCtx.addCookies([
      {
        name: "session",
        value: token,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const lPage = await landscapeCtx.newPage();
    await lPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await lPage.locator(".m-shell").waitFor({ state: "visible", timeout: 10000 });
    await lPage.locator('[role="tab"]').nth(1).click();
    await lPage.waitForTimeout(1000);
    await lPage.screenshot({
      path: path.join(OUT_DIR, "iphone15pro-landscape-preview.png"),
    });
    console.log("✓ iPhone 15 Pro Landscape (852x393) stayed in .m-shell and saved screenshot");
    await landscapeCtx.close();

    // 4. Desktop Regression (1440 x 900, non-touch)
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      isMobile: false,
      hasTouch: false,
    });
    await desktopCtx.addCookies([
      {
        name: "session",
        value: token,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const dPage = await desktopCtx.newPage();
    await dPage.addInitScript(() => {
      window.localStorage.setItem(
        "html-everything-store",
        JSON.stringify({
          state: {
            welcomeAck: true,
            selectedAgent: "gemini",
            layoutMode: "split",
            sidebarCollapsed: false,
            locale: "zh-TW",
          },
          version: 7,
        }),
      );
    });
    await dPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await dPage.waitForTimeout(1000);
    const mobileShellCount = await dPage.locator(".m-shell").count();
    if (mobileShellCount !== 0) {
      throw new Error("Desktop regression failed: .m-shell rendered on 1440x900 desktop!");
    }
    await dPage.screenshot({
      path: path.join(OUT_DIR, "desktop-1440x900.png"),
    });
    console.log("✓ Desktop 1440x900 regression passed (.m-shell count = 0)");
    await desktopCtx.close();

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
