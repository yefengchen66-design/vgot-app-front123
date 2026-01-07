# 🚀 快速部署到 Vercel

## 最快捷的部署方式

### 步骤 1: 安装 Vercel CLI
```powershell
npm install -g vercel
```

### 步骤 2: 登录 Vercel
```powershell
vercel login
```

### 步骤 3: 配置环境变量
编辑 `.env.production` 文件，设置：
- `VITE_GOOGLE_CLIENT_ID`: 你的 Google OAuth Client ID
- `VITE_API_BASE_URL`: 后端 API 地址 (例如: https://api.vgot.ai)

### 步骤 4: 部署
```powershell
# 预览部署（测试）
vercel

# 生产部署
vercel --prod
```

或者直接运行部署脚本：
```powershell
.\deploy.ps1
```

### 步骤 5: 配置域名
1. 访问 Vercel Dashboard
2. 进入项目 Settings → Domains
3. 添加域名: `app.vgot.ai`
4. 按照提示配置 DNS 记录

## DNS 配置示例

在你的域名管理后台添加：
```
类型: CNAME
主机记录: app
记录值: cname.vercel-dns.com
```

## 完成！🎉

部署完成后访问: https://app.vgot.ai

---

详细文档请查看: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
