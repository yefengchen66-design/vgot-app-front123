# Vgot.app 移动端 Vercel 部署指南

## 📦 项目概述

- **项目名称**: Vgot-app-font-main (移动端)
- **线上域名**: app.vgot.ai
- **部署平台**: Vercel
- **框架**: React + Vite + TypeScript

## 🚀 部署步骤

### 1. 准备工作

#### 1.1 确保本地项目可以正常构建
```bash
cd c:\Users\Administrator\Desktop\vgot-app\Vgot-app-font-main
npm install
npm run build
```

#### 1.2 检查环境变量
创建或更新 `.env.production` 文件：
```bash
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# API Base URL (后端API地址)
VITE_API_BASE_URL=https://api.vgot.ai
```

### 2. Vercel 部署

#### 方式一：通过 Vercel CLI 部署（推荐）

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **初次部署**
```bash
cd c:\Users\Administrator\Desktop\vgot-app\Vgot-app-font-main
vercel
```

按照提示操作：
- Set up and deploy? → Y
- Which scope? → 选择你的账号
- Link to existing project? → N
- What's your project's name? → vgot-app-mobile
- In which directory is your code located? → ./
- Want to override the settings? → N

4. **部署到生产环境**
```bash
vercel --prod
```

#### 方式二：通过 Vercel Dashboard 部署

1. 访问 https://vercel.com/dashboard
2. 点击 "Add New" → "Project"
3. 导入 Git 仓库（需要先将代码推送到 GitHub/GitLab/Bitbucket）
4. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: Vgot-app-font-main
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. 添加环境变量（Environment Variables）：
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_API_BASE_URL=https://api.vgot.ai
   ```

6. 点击 "Deploy"

### 3. 配置自定义域名 app.vgot.ai

#### 3.1 在 Vercel Dashboard 中添加域名

1. 进入项目 Settings
2. 选择 "Domains"
3. 添加域名：`app.vgot.ai`

#### 3.2 配置 DNS 记录

在您的域名服务商（如 Cloudflare、阿里云等）添加 DNS 记录：

**方式A：使用 CNAME（推荐）**
```
类型: CNAME
名称: app
值: cname.vercel-dns.com
```

**方式B：使用 A 记录**
```
类型: A
名称: app
值: 76.76.21.21
```

#### 3.3 等待 DNS 生效
通常需要 5-30 分钟，Vercel 会自动配置 SSL 证书。

### 4. 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_GOOGLE_CLIENT_ID` | your-google-client-id.apps.googleusercontent.com | Production, Preview, Development |
| `VITE_API_BASE_URL` | https://api.vgot.ai | Production |
| `VITE_API_BASE_URL` | http://localhost:8000 | Development |

### 5. 后续更新部署

#### 自动部署（推荐）
- 将代码推送到 Git 仓库的主分支
- Vercel 会自动触发构建和部署

#### 手动部署
```bash
cd c:\Users\Administrator\Desktop\vgot-app\Vgot-app-font-main
vercel --prod
```

## 📝 重要配置文件

### vercel.json
已创建，包含：
- 构建配置
- 路由重写规则（SPA 支持）
- 安全响应头
- 静态资源缓存

### vite.config.ts
已配置：
- React SWC 插件
- 路径别名
- 依赖解析

## 🔧 故障排查

### 构建失败
1. 检查 Node.js 版本（建议 18+）
2. 清除缓存：`npm cache clean --force`
3. 重新安装依赖：`rm -rf node_modules && npm install`
4. 查看 Vercel 构建日志

### 404 错误
- 确保 `vercel.json` 中有正确的 rewrite 规则
- 检查 `outputDirectory` 设置是否正确

### 环境变量不生效
- 确保变量名以 `VITE_` 开头
- 重新部署项目
- 检查 Vercel Dashboard 中的环境变量配置

### API 请求失败
- 检查 `VITE_API_BASE_URL` 配置
- 确认后端 CORS 配置允许 `app.vgot.ai` 域名
- 检查网络请求是否使用了正确的 API 地址

## 📊 部署架构

```
用户访问 app.vgot.ai
    ↓
Vercel CDN (全球边缘节点)
    ↓
静态资源 + SPA 路由
    ↓
API 请求 → api.vgot.ai (后端服务)
```

## 🌐 多环境部署

### Production (生产环境)
- 域名: app.vgot.ai
- 分支: main
- API: https://api.vgot.ai

### Preview (预览环境)
- 域名: vgot-app-mobile-xxx.vercel.app
- 分支: develop / feature/*
- API: https://api-dev.vgot.ai

### Development (本地开发)
- 域名: localhost:3001
- API: http://localhost:8000

## 📱 移动端优化

已在配置中包含：
- PWA 支持 (manifest.webmanifest)
- Service Worker (sw.js)
- 移动端适配 viewport
- 主题色配置

## ✅ 部署检查清单

- [ ] 本地构建成功
- [ ] 环境变量配置完成
- [ ] vercel.json 已创建
- [ ] Git 仓库已推送（如使用 Git 部署）
- [ ] Vercel 项目已创建
- [ ] 自定义域名已添加
- [ ] DNS 记录已配置
- [ ] SSL 证书已生效
- [ ] 功能测试通过
- [ ] API 连接正常
- [ ] Google 登录正常

## 🔗 相关链接

- Vercel 文档: https://vercel.com/docs
- Vite 部署指南: https://vitejs.dev/guide/static-deploy.html
- 项目仪表板: https://vercel.com/dashboard

## 💡 提示

1. **首次部署**建议使用 Vercel CLI，可以更好地控制部署过程
2. **生产环境**建议通过 Git 集成实现自动部署
3. **环境变量**更改后需要重新部署才能生效
4. **域名配置**建议使用 CNAME 记录，更灵活
5. **API 地址**确保后端支持 CORS 并允许 app.vgot.ai 域名
