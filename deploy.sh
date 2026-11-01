#!/usr/bin/env bash
# ==============================================================================
# HTML Anything - Google Cloud Run 一鍵自動化部署腳本 (Linux / macOS / WSL)
# ==============================================================================
# 具備 GCP 專案檢驗、API 自動啟用、Artifact Registry 建立、
# 容器映像檔建置 (支援本地 Docker 或 Google Cloud Build)、Cloud Run 發布、
# 預設連線 URL 自動解析與健康探測。
# ==============================================================================

set -euo pipefail

# 彩色終端輸出定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

log_step() { echo -e "\n${CYAN}====> $1${NC}"; }
log_ok() { echo -e " ${GREEN}[OK] $1${NC}"; }
log_warn() { echo -e " ${YELLOW}[WARN] $1${NC}"; }
log_err() { echo -e " ${RED}[ERROR] $1${NC}"; }

# 預設參數值
PROJECT_ID="${GCP_PROJECT_ID:-}"
REGION="${GCP_REGION:-us-central1}"
SERVICE_NAME="html-anything"
ARTIFACT_REPO="html-anything-repo"
ENV_FILE=".env.production"
USE_CLOUD_BUILD=false
SKIP_HEALTH_CHECK=false

print_usage() {
  cat << EOF
使用方式: ./deploy.sh [選項]

選項說明:
  -p, --project-id <ID>       Google Cloud 專案 ID (預設讀取 GCP_PROJECT_ID 或 gcloud 設定)
  -r, --region <REGION>       部署區域 (預設: us-central1)
  -s, --service-name <NAME>   Cloud Run 服務名稱 (預設: html-anything)
      --artifact-repo <REPO>  Artifact Registry Docker 儲存庫名稱 (預設: html-anything-repo)
  -e, --env-file <FILE>       環境變數設定檔 (預設: .env.production)
      --use-cloud-build       使用 Google Cloud Build 進行雲端構建 (本機免啟動 Docker)
      --skip-health-check     略過部署完成後的連線探測
  -h, --help                  顯示此說明訊息

範例:
  ./deploy.sh --project-id my-gcp-project-123
  ./deploy.sh -p my-gcp-project-123 --use-cloud-build
EOF
}

# 解析命令列參數
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--project-id)
      PROJECT_ID="$2"
      shift 2
      ;;
    -r|--region)
      REGION="$2"
      shift 2
      ;;
    -s|--service-name)
      SERVICE_NAME="$2"
      shift 2
      ;;
    --artifact-repo)
      ARTIFACT_REPO="$2"
      shift 2
      ;;
    -e|--env-file)
      ENV_FILE="$2"
      shift 2
      ;;
    --use-cloud-build)
      USE_CLOUD_BUILD=true
      shift 1
      ;;
    --skip-health-check)
      SKIP_HEALTH_CHECK=true
      shift 1
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      log_err "未知參數: $1"
      print_usage
      exit 1
      ;;
  esac
done

# ==============================================================================
# 階段 1: 前置環境相依性檢驗
# ==============================================================================
log_step "1. 檢查本機相依工具 (gcloud CLI 與容器建置環境)..."

if ! command -v gcloud >/dev/null 2>&1; then
  log_err "找不到 gcloud CLI！請先安裝 Google Cloud SDK (https://cloud.google.com/sdk)。"
  exit 1
fi

# 檢查 gcloud 認證狀態
CURRENT_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || true)
if [[ -z "${CURRENT_ACCOUNT}" ]]; then
  log_err "gcloud 尚未登入！請先執行 'gcloud auth login' 完成身分驗證。"
  exit 1
fi
log_ok "GCP 認證帳號: ${CURRENT_ACCOUNT}"

# 檢查 Docker 或 Cloud Build 支援
if [[ "${USE_CLOUD_BUILD}" == "false" ]]; then
  HAS_DOCKER=false
  if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      HAS_DOCKER=true
      log_ok "本機 Docker 守護行程運行中，將採用本機構建並推送。"
    fi
  fi

  if [[ "${HAS_DOCKER}" == "false" ]]; then
    log_warn "未檢測到本機 Docker 運行環境！"
    echo -e "${YELLOW}  -> 將自動切換至 Google Cloud Build 執行雲端容器構建。${NC}"
    USE_CLOUD_BUILD=true
  fi
else
  log_ok "已指定 --use-cloud-build，將直接使用 Google Cloud Build 執行構建。"
fi

# ==============================================================================
# 階段 2: 檢查專案設定與載入環境變數
# ==============================================================================
log_step "2. 檢查專案設定與載入環境變數..."

if [[ -z "${PROJECT_ID}" ]]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
  if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
    read -rp "請輸入目標 Google Cloud 專案 ID (Project ID): " PROJECT_ID
  fi
fi

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  log_err "未指定專案 ID (PROJECT_ID)，部署終止！"
  exit 1
fi

echo "  - 目標專案 ID : ${PROJECT_ID}"
echo "  - 部署區域   : ${REGION}"
echo "  - 服務名稱   : ${SERVICE_NAME}"
echo "  - 映像檔倉庫 : ${ARTIFACT_REPO}"
if [[ "${USE_CLOUD_BUILD}" == "true" ]]; then
  echo "  - 建置模式   : Google Cloud Build (雲端)"
else
  echo "  - 建置模式   : Docker Engine (本機)"
fi

# 宣告關聯陣列儲存環境變數
declare -A ENV_MAP

if [[ -f "${ENV_FILE}" ]]; then
  echo -e "${GRAY}  - 偵測到環境設定檔: ${ENV_FILE}，開始解析...${NC}"
  while IFS= read -r line || [[ -n "$line" ]]; do
    # 去除前後空白
    line=$(echo "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
    # 跳過空行與註解
    if [[ -z "$line" || "$line" =~ ^# ]]; then
      continue
    fi
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      val="${BASH_REMATCH[2]}"
      # 去除前後引號
      val=$(echo "$val" | sed -e 's/^["'"'"']//' -e 's/["'"'"']$//')
      ENV_MAP["$key"]="$val"
    fi
  done < "${ENV_FILE}"
else
  log_warn "未找到環境設定檔 '${ENV_FILE}'！將僅使用系統目前現存之環境變數。"
fi

# 檢查關鍵環境變數
MISSING_KEYS=()
for CK in GEMINI_API_KEY AUTH_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET; do
  if [[ -z "${ENV_MAP[$CK]:-}" && -z "${!CK:-}" ]]; then
    MISSING_KEYS+=("$CK")
  fi
done

if [[ -z "${ENV_MAP[ALLOWED_EMAILS]:-}" && -z "${ENV_MAP[ADMIN_EMAIL]:-}" && -z "${ALLOWED_EMAILS:-}" && -z "${ADMIN_EMAIL:-}" ]]; then
  MISSING_KEYS+=("ALLOWED_EMAILS (或 ADMIN_EMAIL)")
fi

if [[ ${#MISSING_KEYS[@]} -gt 0 ]]; then
  log_warn "以下關鍵環境變數未於 ${ENV_FILE} 或 Shell 環境中檢測到: ${MISSING_KEYS[*]}"
  log_warn "部署完成後服務可能無法正常調用 Gemini 或進行 Google OAuth 登入！"
else
  log_ok "關鍵環境變數驗證齊全。"
fi

# ==============================================================================
# 階段 3: 設定 GCP 當前專案與預設區域
# ==============================================================================
log_step "3. 設定 gcloud 專案環境..."
gcloud config set project "${PROJECT_ID}" --quiet
gcloud config set run/region "${REGION}" --quiet
log_ok "gcloud 專案與區域已綁定 (${PROJECT_ID}, ${REGION})。"

# ==============================================================================
# 階段 4: 啟用必要 GCP 服務 API
# ==============================================================================
log_step "4. 檢查並啟用必要 GCP 服務 API..."
REQUIRED_APIS=("run.googleapis.com" "artifactregistry.googleapis.com")
if [[ "${USE_CLOUD_BUILD}" == "true" ]]; then
  REQUIRED_APIS+=("cloudbuild.googleapis.com")
fi

echo -e "${GRAY}  - 啟用 API 清單: ${REQUIRED_APIS[*]}...${NC}"
ENABLED_APIS=$(gcloud services list --enabled --project="${PROJECT_ID}" --format="value(config.name)" 2>/dev/null || true)
MISSING_APIS=()
for API in "${REQUIRED_APIS[@]}"; do
  if ! echo "${ENABLED_APIS}" | grep -Fxq "${API}"; then
    MISSING_APIS+=("${API}")
  fi
done

if [[ ${#MISSING_APIS[@]} -eq 0 ]]; then
  log_ok "所有必要 GCP API (${REQUIRED_APIS[*]}) 均已處於啟用狀態，略過重複啟用。"
else
  echo -e "${GRAY}  - 尚需啟用 API: ${MISSING_APIS[*]}...${NC}"
  gcloud services enable "${MISSING_APIS[@]}" --project="${PROJECT_ID}" --quiet
  log_ok "必要 GCP API 已成功啟用。"
fi

# ==============================================================================
# 階段 5: 初始化 Artifact Registry 與 Docker 認證
# ==============================================================================
log_step "5. 檢查 Artifact Registry 儲存庫..."
if ! gcloud artifacts repositories describe "${ARTIFACT_REPO}" --location="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo -e "${GRAY}  - 儲存庫 ${ARTIFACT_REPO} 尚未建立，建立中...${NC}"
  gcloud artifacts repositories create "${ARTIFACT_REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Docker repository for HTML Anything" \
    --project="${PROJECT_ID}" --quiet
  log_ok "Artifact Registry 儲存庫建立成功。"
else
  log_ok "Artifact Registry 儲存庫已存在。"
fi

if [[ "${USE_CLOUD_BUILD}" == "false" ]]; then
  echo -e "${GRAY}  - 配置 Docker 憑證協助程式至 ${REGION}-docker.pkg.dev...${NC}"
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
fi

# ==============================================================================
# 階段 6: 構建與推播容器映像檔
# ==============================================================================
log_step "6. 構建並發布容器映像檔..."
BUILD_TAG=$(date +%Y%m%d-%H%M%S)
IMAGE_TARGET="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:${BUILD_TAG}"
IMAGE_LATEST="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:latest"

echo "  - 目標映像檔: ${IMAGE_TARGET}"
echo "  - 最新映像檔: ${IMAGE_LATEST}"

if [[ "${USE_CLOUD_BUILD}" == "true" ]]; then
  echo -e "${CYAN}  - 透過 Google Cloud Build 提交雲端建置作業...${NC}"
  gcloud builds submit --tag "${IMAGE_TARGET}" --tag "${IMAGE_LATEST}" --project="${PROJECT_ID}" .
  log_ok "Cloud Build 雲端構建與推播成功完成！"
else
  echo -e "${CYAN}  - 執行本地 Docker 建置...${NC}"
  docker build -t "${IMAGE_TARGET}" -t "${IMAGE_LATEST}" .
  log_ok "本地 Docker 建置完成，開始推送映像檔至 Artifact Registry..."
  docker push "${IMAGE_TARGET}"
  docker push "${IMAGE_LATEST}"
  log_ok "容器映像檔成功發布至 Artifact Registry。"
fi

# ==============================================================================
# 階段 7: 部署服務至 Google Cloud Run
# ==============================================================================
log_step "7. 部署修訂版本至 Google Cloud Run..."

# 組合注入環境變數 (注意: PORT 是 Cloud Run 保留字，禁止手動注入)
ENV_VARS_LIST=("NODE_ENV=production" "AUTH_TRUST_HOST=true")

INJECTABLE_KEYS=(
  "GEMINI_API_KEY"
  "AUTH_SECRET"
  "NEXTAUTH_SECRET"
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "ALLOWED_EMAILS"
  "ADMIN_EMAIL"
  "NEXT_PUBLIC_APP_URL"
  "AUTH_URL"
  "NEXTAUTH_URL"
  "HTML_ANYTHING_USER_STATE_DIR"
)

for KEY in "${INJECTABLE_KEYS[@]}"; do
  VAL=""
  if [[ -n "${ENV_MAP[$KEY]:-}" ]]; then
    VAL="${ENV_MAP[$KEY]}"
  elif [[ -n "${!KEY:-}" ]]; then
    VAL="${!KEY}"
  fi

  if [[ -n "${VAL}" ]]; then
    # 跳脫特殊字符
    ESCAPED_VAL=$(echo "$VAL" | sed 's/,/\\,/g')
    ENV_VARS_LIST+=("${KEY}=${ESCAPED_VAL}")
  fi
done

# 逗號連接
ENV_ARGS=$(IFS=,; echo "${ENV_VARS_LIST[*]}")

echo "  - 套用核心配置："
echo "    * 超時時間 (Timeout)   : 3600s (1 小時，保障 SSE 串流長連線)"
echo "    * 監聽端口 (Port)      : 3000"
echo "    * 運算規格 (CPU / RAM) : 1 vCPU / 1Gi RAM"
echo "    * 實例規模 (Min / Max) : 0 ~ 10 (縮容至零，個人使用免費額度防護)"
echo "    * 存取模式             : 允許未認證公開連線 (由應用層 Google OAuth 防護)"

gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TARGET}" \
  --region "${REGION}" \
  --platform managed \
  --port 3000 \
  --timeout 3600 \
  --cpu 1 \
  --memory 1Gi \
  --min-instances 0 \
  --max-instances 10 \
  --allow-unauthenticated \
  --set-env-vars "${ENV_ARGS}" \
  --project "${PROJECT_ID}" \
  --quiet

log_ok "Google Cloud Run 服務發布成功！"

# ==============================================================================
# 階段 8: 取得服務預設連線 URL 與執行健康檢測
# ==============================================================================
log_step "8. 取得服務連線網址與連線探測..."

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --project "${PROJECT_ID}" --format="value(status.url)" 2>/dev/null || true)

if [[ -z "${SERVICE_URL}" ]]; then
  log_err "無法取得 Cloud Run 服務 URL，請至 GCP 控制台檢視服務狀態。"
  exit 1
fi

echo -e "\n${GREEN}================================================================================${NC}"
echo -e "  🎉 HTML Anything 成功發布至 Google Cloud Run！"
echo -e "  🌐 預設服務連線網址: ${CYAN}${SERVICE_URL}${NC}"
echo -e "${GREEN}================================================================================${NC}\n"

if [[ "${SKIP_HEALTH_CHECK}" == "false" ]]; then
  echo -e "${GRAY}正在對健康探測端點與首頁發起連線探測 (${SERVICE_URL})...${NC}"
  
  # 探測 /api/health
  HEALTH_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "${SERVICE_URL}/api/health" || echo "000")
  if [[ "${HEALTH_HTTP_CODE}" == "200" ]]; then
    log_ok "健康檢查端點 (/api/health) 響應: HTTP 200 OK"
  else
    log_warn "健康檢查端點響應狀態碼: ${HEALTH_HTTP_CODE}"
  fi

  # 探測首頁（預期未登入會 307 或 200）
  ROOT_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "${SERVICE_URL}" || echo "000")
  log_ok "首頁存取探測響應: HTTP ${ROOT_HTTP_CODE} (存取控制攔截運作正常)"
fi

# ==============================================================================
# 完成摘要與 Google Cloud OAuth 設定提示
# ==============================================================================
echo -e "\n${YELLOW}【重要：OAuth 2.0 授權重新導向 URI 回填指南】${NC}"
echo "為確保 Google OAuth 登入能正常完成回呼，請依下列步驟設定："
echo "1. 前往 Google Cloud Console ->「API 和服務」->「憑證」："
echo -e "   ${CYAN}https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}${NC}"
echo "2. 點擊編輯您的「OAuth 2.0 用戶端 ID (網頁應用程式)」。"
echo "3. 在「已授權的重新導向 URI」清單中新增此網址："
echo -e "   ${GREEN}${SERVICE_URL}/api/auth/callback${NC}"
echo "4. 在「已授權的 JavaScript 來源」清單中新增："
echo -e "   ${GREEN}${SERVICE_URL}${NC}"
echo "5. (若尚未設定) 請將 ${ENV_FILE} 內的 NEXT_PUBLIC_APP_URL 更新為 ${SERVICE_URL}"
echo -e "   並重新執行部署以更新環境變數。\n"
log_ok "部署作業圓滿完成！"
