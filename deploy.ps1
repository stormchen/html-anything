<#
.SYNOPSIS
    HTML Anything - Google Cloud Run 一鍵自動化部署腳本 (Windows PowerShell)
.DESCRIPTION
    本腳本負責自動化檢查前置相依套件、綁定 GCP 專案、啟用必要 API、建立 Artifact Registry 存放區、
    進行容器映像檔建置（支援 Docker 本機或 Google Cloud Build 雲端構建）、推播並發布至 Google Cloud Run，
    最後自動擷取產出的 *.run.app 服務網址並發起連線健康探測。
.PARAMETER ProjectId
    Google Cloud 專案 ID。若未提供，腳本會依序讀取環境變數 GCP_PROJECT_ID、gcloud 設定或互動式提示輸入。
.PARAMETER Region
    部署之 GCP 區域，預設為 "us-central1"。
.PARAMETER ServiceName
    Cloud Run 服務名稱，預設為 "html-anything"。
.PARAMETER ArtifactRepo
    Artifact Registry Docker 儲存庫名稱，預設為 "html-anything-repo"。
.PARAMETER EnvFile
    生產環境設定檔路徑，預設為 ".env.production"。
.PARAMETER UseCloudBuild
    切換為使用 Google Cloud Build 進行雲端容器構建（免於本機啟動 Docker Desktop）。
.PARAMETER SkipHealthCheck
    略過部署完成後的 HTTP 連線探測。
.PARAMETER SkipApiCheck
    略過 GCP API 檢查與啟用步驟。
.EXAMPLE
    .\deploy.ps1 -ProjectId "html-anything-prod"
.EXAMPLE
    .\deploy.ps1 -ProjectId "html-anything-prod" -UseCloudBuild
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false, HelpMessage = "Google Cloud 專案 ID")]
    [string]$ProjectId = $env:GCP_PROJECT_ID,

    [Parameter(Mandatory = $false, HelpMessage = "GCP 部署區域")]
    [string]$Region = "us-central1",

    [Parameter(Mandatory = $false, HelpMessage = "Cloud Run 服務名稱")]
    [string]$ServiceName = "html-anything",

    [Parameter(Mandatory = $false, HelpMessage = "Artifact Registry 存放區名稱")]
    [string]$ArtifactRepo = "html-anything-repo",

    [Parameter(Mandatory = $false, HelpMessage = "生產環境變數檔案路徑")]
    [string]$EnvFile = ".env.production",

    [Parameter(Mandatory = $false, HelpMessage = "使用 Google Cloud Build 雲端構建")]
    [switch]$UseCloudBuild,

    [Parameter(Mandatory = $false, HelpMessage = "略過部署後連線健康檢查")]
    [switch]$SkipHealthCheck,

    [Parameter(Mandatory = $false, HelpMessage = "略過 GCP API 檢查與啟用步驟")]
    [switch]$SkipApiCheck
)

# 避免原生命令的 stderr 輸出觸發 PowerShell NativeCommandError 例外中斷
$ErrorActionPreference = "Continue"

function Write-Step {
    param([string]$Message)
    Write-Host "`n====> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host " [OK] $Message" -ForegroundColor Green
}

function Write-WarnMsg {
    param([string]$Message)
    Write-Host " [WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrMsg {
    param([string]$Message)
    Write-Host " [ERROR] $Message" -ForegroundColor Red
}

# ==============================================================================
# 階段 1: 前置環境相依性檢驗
# ==============================================================================
Write-Step "1. 檢查本機相依工具 (gcloud CLI 與容器建置環境)..."

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    $defaultGcloudPath = "C:\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin"
    if (Test-Path $defaultGcloudPath) {
        $env:PATH = "$defaultGcloudPath;$env:PATH"
    }
}

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-ErrMsg "找不到 gcloud CLI！請先確認 Google Cloud SDK 已安裝並加入 PATH。"
    exit 1
}

$currentAccount = & gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $currentAccount) {
    Write-ErrMsg "gcloud 尚未登入！請先在終端機執行 'gcloud auth login' 完成登入。"
    exit 1
}
Write-Success "GCP 認證帳號: $currentAccount"

$hasDocker = $false
if (-not $UseCloudBuild) {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        try {
            & docker info > $null 2>&1
            if ($LASTEXITCODE -eq 0) {
                $hasDocker = $true
                Write-Success "本機 Docker 守護行程運行中，將採用本機構建並推送。"
            }
        } catch {
            $hasDocker = $false
        }
    }

    if (-not $hasDocker) {
        Write-WarnMsg "未檢測到本機 Docker 守護行程運行！"
        Write-Host "  -> 將自動切換至 Google Cloud Build 執行雲端容器構建。" -ForegroundColor Yellow
        $UseCloudBuild = [switch]::new($true)
    }
} else {
    Write-Success "已指定 -UseCloudBuild，將直接使用 Google Cloud Build 執行構建。"
}

# ==============================================================================
# 階段 2: 載入專案 ID 與環境變數
# ==============================================================================
Write-Step "2. 檢查專案設定與載入環境變數..."

if (-not $ProjectId) {
    $ProjectId = & gcloud config get-value project 2>$null
    if (-not $ProjectId -or $ProjectId -eq "(unset)") {
        $ProjectId = Read-Host "請輸入目標 Google Cloud 專案 ID (Project ID)"
    }
}

if (-not $ProjectId -or $ProjectId -eq "(unset)") {
    Write-ErrMsg "未指定專案 ID (ProjectId)，部署終止！"
    exit 1
}

Write-Host "  - 目標專案 ID : $ProjectId"
Write-Host "  - 部署區域   : $Region"
Write-Host "  - 服務名稱   : $ServiceName"
Write-Host "  - 映像檔倉庫 : $ArtifactRepo"
if ($UseCloudBuild) {
    Write-Host "  - 建置模式   : Google Cloud Build (雲端)"
} else {
    Write-Host "  - 建置模式   : Docker Engine (本機)"
}

$envMap = @{}
if (Test-Path $EnvFile) {
    Write-Host "  - 偵測到環境設定檔: $EnvFile，開始解析..." -ForegroundColor Gray
    Get-Content $EnvFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            if ($val.StartsWith('"') -and $val.EndsWith('"')) {
                $val = $val.Substring(1, $val.Length - 2)
            } elseif ($val.StartsWith("'") -and $val.EndsWith("'")) {
                $val = $val.Substring(1, $val.Length - 2)
            }
            $envMap[$key] = $val
        }
    }
} else {
    Write-WarnMsg "未找到環境設定檔 '$EnvFile'！將僅使用系統現存之環境變數。"
}

$criticalKeys = @("GEMINI_API_KEY", "AUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")
$missingKeys = @()
foreach ($ck in $criticalKeys) {
    if (-not $envMap.ContainsKey($ck) -and -not [Environment]::GetEnvironmentVariable($ck)) {
        $missingKeys += $ck
    }
}

$hasAllowedEmail = $envMap.ContainsKey("ALLOWED_EMAILS") -or $envMap.ContainsKey("ADMIN_EMAIL") -or
                   [Environment]::GetEnvironmentVariable("ALLOWED_EMAILS") -or [Environment]::GetEnvironmentVariable("ADMIN_EMAIL")

if (-not $hasAllowedEmail) {
    $missingKeys += "ALLOWED_EMAILS (或 ADMIN_EMAIL)"
}

if ($missingKeys.Count -gt 0) {
    Write-WarnMsg "以下關鍵環境變數未於 $EnvFile 或環境變數中檢測到: $($missingKeys -join ', ')"
    Write-WarnMsg "部署完成後服務可能無法正常調用 Gemini 或進行 Google OAuth 登入！"
} else {
    Write-Success "關鍵環境變數驗證齊全。"
}

# ==============================================================================
# 階段 3: 設定 GCP 當前專案與預設區域
# ==============================================================================
Write-Step "3. 設定 gcloud 專案環境..."
& gcloud config set project $ProjectId --quiet 2>&1 | Out-Null
& gcloud config set run/region $Region --quiet 2>&1 | Out-Null
Write-Success "gcloud 專案與區域已綁定 ($ProjectId, $Region)。"

# ==============================================================================
# 階段 4: 檢查必要 GCP API
# ==============================================================================
Write-Step "4. 檢查並啟用必要 GCP 服務 API..."

if ($SkipApiCheck) {
    Write-WarnMsg "已指定 -SkipApiCheck，略過 API 檢查。"
} else {
    $requiredApis = @("run.googleapis.com", "artifactregistry.googleapis.com")
    if ($UseCloudBuild) {
        $requiredApis += "cloudbuild.googleapis.com"
    }

    $enabledApisRaw = & gcloud services list --enabled --project=$ProjectId --format="value(config.name)" 2>$null
    $enabledApis = @()
    if ($enabledApisRaw) {
        $enabledApis = $enabledApisRaw -split "`r?`n" | ForEach-Object { $_.Trim() }
    }

    $missingApis = @()
    foreach ($api in $requiredApis) {
        if ($enabledApis -notcontains $api) {
            $missingApis += $api
        }
    }

    if ($missingApis.Count -eq 0) {
        Write-Success "所有必要 GCP API ($($requiredApis -join ', ')) 均已處於啟用狀態，略過重複啟用。"
    } else {
        Write-Host "  - 尚需啟用 API: $($missingApis -join ', ')..." -ForegroundColor Gray
        & gcloud services enable $missingApis --project=$ProjectId --quiet 2>&1 | Out-Null
        Write-Success "必要 GCP API 已就緒。"
    }
}

# ==============================================================================
# 階段 5: 初始化 Artifact Registry
# ==============================================================================
Write-Step "5. 檢查 Artifact Registry 儲存庫..."
$repoCheck = & gcloud artifacts repositories describe $ArtifactRepo --location=$Region --project=$ProjectId 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  - 儲存庫 $ArtifactRepo 尚未建立，建立中..." -ForegroundColor Gray
    & gcloud artifacts repositories create $ArtifactRepo `
        --repository-format=docker `
        --location=$Region `
        --description="Docker repository for HTML Anything" `
        --project=$ProjectId --quiet 2>&1 | Out-Null
    Write-Success "Artifact Registry 儲存庫建立成功。"
} else {
    Write-Success "Artifact Registry 儲存庫已存在。"
}

if (-not $UseCloudBuild) {
    & gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet 2>&1 | Out-Null
}

# ==============================================================================
# 階段 6: 構建與推播容器映像檔
# ==============================================================================
Write-Step "6. 構建並發布容器映像檔..."
$buildTag = (Get-Date -Format "yyyyMMdd-HHmmss")
$imageTarget = "$Region-docker.pkg.dev/$ProjectId/$ArtifactRepo/${ServiceName}:$buildTag"
$imageLatest = "$Region-docker.pkg.dev/$ProjectId/$ArtifactRepo/${ServiceName}:latest"

Write-Host "  - 目標映像檔: $imageTarget"
Write-Host "  - 最新映像檔: $imageLatest"

if ($UseCloudBuild) {
    Write-Host "  - 透過 Google Cloud Build 提交雲端建置作業 (需耗時約 2~3 分鐘)..." -ForegroundColor Cyan
    & gcloud builds submit --tag $imageTarget --project=$ProjectId .
    if ($LASTEXITCODE -ne 0) {
        Write-ErrMsg "Google Cloud Build 建置作業失敗！"
        exit 1
    }
    Write-Success "Cloud Build 雲端構建與推播成功完成！"
    # 同步為 latest 標籤
    & gcloud artifacts docker tags add $imageTarget $imageLatest --quiet 2>&1 | Out-Null
} else {
    Write-Host "  - 執行本地 Docker 建置..." -ForegroundColor Cyan
    & docker build -t $imageTarget -t $imageLatest .
    if ($LASTEXITCODE -ne 0) {
        Write-ErrMsg "Docker 本地建置失敗！請確認 Dockerfile 是否完整相容。"
        exit 1
    }
    Write-Success "本地 Docker 建置完成，開始推送映像檔至 Artifact Registry..."

    & docker push $imageTarget
    & docker push $imageLatest
    if ($LASTEXITCODE -ne 0) {
        Write-ErrMsg "推送映像檔至 Artifact Registry 失敗！"
        exit 1
    }
    Write-Success "容器映像檔成功發布至 Artifact Registry。"
}

# ==============================================================================
# 階段 7: 部署服務至 Google Cloud Run
# ==============================================================================
Write-Step "7. 部署修訂版本至 Google Cloud Run..."

# 組合注入環境變數 (注意: PORT 是 Cloud Run 保留關鍵字，由 --port 參數自動注入，禁止放進 set-env-vars)
$envEntries = @(
    "NODE_ENV=production",
    "AUTH_TRUST_HOST=true"
)

$injectableKeys = @(
    "GEMINI_API_KEY",
    "GEMINI_MODEL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ALLOWED_EMAILS",
    "ADMIN_EMAIL",
    "AUTH_SECRET",
    "NEXT_PUBLIC_APP_URL",
    "APP_URL",
    "MAX_FILE_SIZE_MB",
    "MAX_CONCURRENT_TASKS"
)

foreach ($key in $injectableKeys) {
    if ($envMap.ContainsKey($key)) {
        $envEntries += "$key=$($envMap[$key])"
    } elseif ([Environment]::GetEnvironmentVariable($key)) {
        $envEntries += "$key=$([Environment]::GetEnvironmentVariable($key))"
    }
}

$envString = $envEntries -join ","

Write-Host "  - 服務部署參數配置:"
Write-Host "    * 超時上限 (Timeout)   : 3600s (1小時，保障 SSE 串流長任務)"
Write-Host "    * 最小執行個體 (Min)    : 0 (自動縮容至零，個人使用維持 $0.00)"
Write-Host "    * 最大執行個體 (Max)    : 10 (上限保護，防範帳單爆增)"
Write-Host "    * 記憶體/CPU 配置       : 1GiB / 1 vCPU"
Write-Host "    * 公開存取控制         : --allow-unauthenticated (由 Next.js 應用層接管白名單保護)"

& gcloud run deploy $ServiceName `
    --image=$imageTarget `
    --platform=managed `
    --region=$Region `
    --project=$ProjectId `
    --allow-unauthenticated `
    --port=3000 `
    --timeout=3600 `
    --memory=1Gi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=10 `
    --set-env-vars=$envString `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-ErrMsg "Cloud Run 服務部署失敗！請檢查 GCP 配額或日誌。"
    exit 1
}

Write-Success "Cloud Run 服務修訂版本部署成功！"

# ==============================================================================
# 階段 8: 取得服務公開網址與健康檢查探測
# ==============================================================================
Write-Step "8. 檢索服務公開網址與驗收連線..."

$serviceUrl = & gcloud run services describe $ServiceName `
    --platform=managed `
    --region=$Region `
    --project=$ProjectId `
    --format="value(status.url)" 2>$null

if (-not $serviceUrl) {
    Write-WarnMsg "未能自動取得服務 URL，請至 Google Cloud Console 查閱 Cloud Run 服務網址。"
    exit 0
}

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host "  恭喜！HTML Anything 雲端部署成功！" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "  * 服務連線網址 : $serviceUrl" -ForegroundColor Cyan
Write-Host "  * 登入頁面網址 : $serviceUrl/login" -ForegroundColor Cyan
Write-Host "  * 健康檢查端點 : $serviceUrl/api/health" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Green

Write-Host "`n[重要安全設定提醒 - 關鍵最後一步]" -ForegroundColor Yellow
Write-Host "請至 Google Cloud Console -> 'API 和服務' -> '憑證' -> 編輯您的 OAuth 2.0 用戶端 ID："
Write-Host "將下列回呼 URL 加入「已授權的重新導向 URI (Authorized redirect URIs)」清單中：" -ForegroundColor Yellow
Write-Host "  >> $serviceUrl/api/auth/callback" -ForegroundColor Magenta
Write-Host "加入並儲存後，即可透過 Google 帳號安全登入並受到單一使用者白名單防護！`n"

if (-not $SkipHealthCheck) {
    Write-Host "正在對公開端點執行健康檢查探測..." -ForegroundColor Gray
    try {
        $healthUrl = "$serviceUrl/api/health"
        $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 15
        if ($resp.StatusCode -eq 200) {
            Write-Success "端點健康探測成功 (HTTP 200 OK)！服務正式運作中。"
        } else {
            Write-WarnMsg "健康探測回傳 HTTP $($resp.StatusCode)。"
        }
    } catch {
        Write-WarnMsg "端點暫未就緒或需等待容器冷啟動: $($_.Exception.Message)"
    }
}
