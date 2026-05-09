# ClawCloud 部署指南

## 概述

本指南帮助你将 AI Virtual Master 后端部署到 ClawCloud 平台，使用 MongoDB Atlas 作为数据库。

---

## 你需要提供的信息

部署前，请准备好以下两项敏感信息：

| 变量名 | 值 | 用途 |
|--------|-----|------|
| **MONGO_URI** | `mongodb://user1:user1@ac-ewfdsrt-shard-00-00.ppuvwan.mongodb.net:27017,ac-ewfdsrt-shard-00-01.ppuvwan.mongodb.net:27017,ac-ewfdsrt-shard-00-02.ppuvwan.mongodb.net:27017/?ssl=true&replicaSet=atlas-4hlrjh-shard-0&authSource=admin&appName=Cluster0` | 连接数据库 |
| **ZHIPU_API_KEY** | `86d3729a016c439489ff89b2e8be9c4a.gvXGzjxxwI4QwZ8t` | AI 对话/翻译/评估功能 |

---

## 部署步骤

### 1. 推送代码到 GitHub

确保你的代码已推送到 GitHub 仓库（包含 `backend/Dockerfile` 文件）。

```bash
git add backend/Dockerfile backend/.dockerignore
git commit -m "Add ClawCloud Docker deployment config"
git push origin main
```

### 2. 登录 ClawCloud

1. 访问 [ClawCloud 官网](https://run.claw.cloud/)
2. 使用 GitHub 账号登录

### 3. 创建应用

1. 点击 **New Application** 或 **Create App**
2. 选择 **Docker** 部署方式
3. 配置应用信息：
   - **Name**: `ai-virtual-master-backend`（或自定义）
   - **Image Source**: 选择 **Build from Git**
   - **Git Repository**: `https://github.com/gaogirl/zhongqi`
   - **Branch**: `main`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context Path**: `backend`

### 4. 配置资源

- **CPU**: 0.5 核（免费版默认）
- **Memory**: 512 MB
- **Port**: `5000`

### 5. 配置环境变量

在 **Environment Variables** 区域添加以下变量：

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb://user1:user1@ac-ewfdsrt-shard-00-00.ppuvwan.mongodb.net:27017,ac-ewfdsrt-shard-00-01.ppuvwan.mongodb.net:27017,ac-ewfdsrt-shard-00-02.ppuvwan.mongodb.net:27017/?ssl=true&replicaSet=atlas-4hlrjh-shard-0&authSource=admin&appName=Cluster0` |
| `JWT_SECRET` | `your-random-secret-key-at-least-32-characters-long` |
| `JWT_EXPIRE` | `30d` |
| `JWT_COOKIE_EXPIRE` | `30` |
| `CLIENT_URL` | `https://gaogirl.github.io` |
| `ZHIPU_API_KEY` | `86d3729a016c439489ff89b2e8be9c4a.gvXGzjxxwI4QwZ8t` |

> **注意**: `JWT_SECRET` 请使用随机字符串，至少 32 位。

### 6. 部署应用

点击 **Deploy** 按钮，等待构建和部署完成。

部署成功后，你会获得一个类似 `https://xxx.run.claw.cloud` 的 URL。

---

## 配置前端

部署完成后，需要更新前端配置指向新的后端地址。

### 修改前端环境变量

编辑 `frontend/.env.production`：

```
VITE_API_URL=https://你的-clawcloud-应用地址.run.claw.cloud/api
VITE_LOCAL_AUTH=false
VITE_ENABLE_COURSES=false
```

### 重新部署前端

```bash
cd frontend
npm run build
git add dist/
git commit -m "Update API URL for ClawCloud production"
git push origin main
```

GitHub Actions 会自动部署到 GitHub Pages。

---

## 验证部署

1. 访问你的 ClawCloud 应用 URL，应看到：
   ```
   AI 实时翻译 API 正在运行...
   ```

2. 访问 `https://你的地址.run.claw.cloud/api/auth/register` 测试 API（POST 请求）。

3. 打开前端页面，测试注册/登录功能。

---

## 故障排查

### 数据库连接失败

- 检查 MongoDB Atlas 的 **Network Access** 是否允许所有 IP（`0.0.0.0/0`）
- 确认 MONGO_URI 中的用户名和密码正确
- 检查 MongoDB Atlas 集群状态是否正常

### AI 功能不可用

- 确认 ZHIPU_API_KEY 已正确设置
- 检查智谱 AI 账户余额是否充足
- 查看 ClawCloud 日志中的错误信息

### CORS 错误

- 如果前端部署在其他域名，需要修改 `CLIENT_URL` 环境变量
- 或修改 `backend/server.js` 中的 `corsOptions.origin` 数组

### 端口问题

- 确保 Dockerfile 中 `EXPOSE 5000`
- 确保 ClawCloud 配置的端口为 `5000`

---

## ClawCloud 免费版限制

- 每天最多运行 12 小时（可配置运行时段）
- 512 MB RAM
- 0.5 CPU
- 100GB 出站流量/月
- 冷启动快（1-3 秒），不强制休眠

---

## 更新部署

代码更新后，推送到 GitHub，ClawCloud 会自动重新部署：

```bash
git add .
git commit -m "Your changes"
git push origin main
```

或在 ClawCloud 控制台手动触发重新部署。

---

## 文件清单

| 文件 | 说明 |
|------|------|
| `backend/Dockerfile` | Docker 构建配置 |
| `backend/.dockerignore` | Docker 构建忽略文件 |
