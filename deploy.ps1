# Vercel 部署脚本
# 使用方法: .\deploy.ps1

Write-Host "🚀 开始部署 Vgot.app 移动端到 Vercel..." -ForegroundColor Green

# 检查是否安装了 Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ 未检测到 Vercel CLI，正在安装..." -ForegroundColor Yellow
    npm install -g vercel
}

# 检查是否登录
Write-Host "📝 检查 Vercel 登录状态..." -ForegroundColor Cyan
vercel whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 未登录 Vercel，请先登录" -ForegroundColor Red
    vercel login
}

# 构建前检查
Write-Host "🔍 检查环境变量配置..." -ForegroundColor Cyan
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  警告: .env.production 文件不存在" -ForegroundColor Yellow
}

# 询问部署类型
Write-Host "`n请选择部署类型:" -ForegroundColor Cyan
Write-Host "1. 预览部署 (Preview)"
Write-Host "2. 生产部署 (Production)"
$choice = Read-Host "请输入选项 (1/2)"

switch ($choice) {
    "1" {
        Write-Host "`n🔄 开始预览部署..." -ForegroundColor Green
        vercel
    }
    "2" {
        Write-Host "`n🚀 开始生产部署..." -ForegroundColor Green
        vercel --prod
    }
    default {
        Write-Host "❌ 无效选项，退出" -ForegroundColor Red
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ 部署成功！" -ForegroundColor Green
    Write-Host "📱 移动端地址: https://app.vgot.ai" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ 部署失败，请检查错误信息" -ForegroundColor Red
    exit 1
}
