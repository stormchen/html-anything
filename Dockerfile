# -----------------------------------------------------------------------------
# 階段 1：基礎環境 (Base)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# 安裝 libc6-compat 確保 Alpine 上的相容性
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 啟用 corepack 並鎖定相容之 pnpm 9 系列，避免版本漂移
RUN corepack enable && corepack prepare pnpm@9 --activate

# -----------------------------------------------------------------------------
# 階段 2：安裝依賴 (Dependencies)
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# 複製 package 依賴定義
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# 安裝所有相依套件（包括 devDependencies 以便編譯 TypeScript）
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# 階段 3：建置專案 (Builder)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 停用 Next.js 遙測追蹤
ENV NEXT_TELEMETRY_DISABLED=1

# 執行正式編譯（由 next.config.ts 的 output: 'standalone' 產生獨立運行檔案）
RUN pnpm build

# -----------------------------------------------------------------------------
# 階段 4：運行映像檔 (Production Runner)
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 建立非 root 的系統專用使用者以提高安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 預先建立 .next 快取目錄並設定擁有權
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# 複製靜態檔案與模板目錄並設定擁有權
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/templates/skills ./src/lib/templates/skills
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/templates/skills ./.next/standalone/src/lib/templates/skills

# 從 builder 複製 standalone 輸出與 static 靜態資源
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切換到低權限使用者
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 原生存活性健康檢查（使用 Node.js 原生 fetch，探測 /api/health 端點）
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# 啟動 Next.js standalone 伺服器
CMD ["node", "server.js"]
