# Render 部署指南

## 概述

本指南帮助你将 AI Virtual Master 后端部署到 Render 平台，使用 MongoDB Atlas 作为数据库。

---

## 你需要提供的信息

部署前，请准备好以下两项敏感信息：

| 变量名 | 获取方式 | 用途 |
|--------|----------|------|
| **MONGO_URI** | 你已提供 MongoDB Atlas 连接字符串 | 连接数据库 |
| **ZHIPU_API_KEY** | 从 [open.bigmodel.cn](https://open.bigmodel.cn) 注册获取 | AI 对话/翻译/评估功能 |

---

## 部署步骤

### 1. 推送代码到 GitHub

确保你的代码已推送到 GitHub 仓库（包含 `backend/render.yaml` 文件）。

```bash
git add backend/render.yaml
git commit -m "Add Render deployment config"
git push origin master
```

### 2. 在 Render 创建服务

**方式一：使用 Blueprint（推荐）**

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **New +** → **Blueprint**
3. 选择你的 GitHub 仓库
4. Render 会自动识别 `render.yaml` 文件
5. 点击 **Apply**

**方式二：手动创建 Web Service**

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **New +** → **Web Service**
3. 选择你的 GitHub 仓库
4. 填写配置：
   - **Name**: `ai-virtual-master-backend`（或自定义）
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`

### 3. 配置环境变量

创建服务后，进入 **Environment** 标签页，添加以下变量：

```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb://user1:user1@ac-ewfdsrt-shard-00-00.ppuvwan.mongodb.net:27017,ac-ewfdsrt-shard-00-01.ppuvwan.mongodb.net:27017,ac-ewfdsrt-shard-00-02.ppuvwan.mongodb.net:27017/?ssl=true&replicaSet=atlas-4hlrjh-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=<随机字符串，至少32位>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLIENT_URL=https://gaogirl.github.io
ZHIPU_API_KEY=<你的智谱AI API密钥>
```

> **注意**: 你的 MongoDB 用户名为 `user1`，密码也是 `user1`。

### 4. 部署

点击 **Manual Deploy** → **Deploy Latest Commit**，等待部署完成。

部署成功后，你会获得一个类似 `https://ai-virtual-master-backend.onrender.com` 的 URL。

---

## 配置前端

部署完成后，需要更新前端配置指向新的后端地址。

### 修改前端环境变量

编辑 `frontend/.env.production`：

```
VITE_API_URL=https://你的-render-服务名.onrender.com/api
VITE_LOCAL_AUTH=false
VITE_ENABLE_COURSES=false
```

### 重新部署前端

```bash
cd frontend
npm run build
git add dist/
git commit -m "Update API URL for production"
git push origin master
```

GitHub Actions 会自动部署到 GitHub Pages。

---

## 验证部署

1. 访问你的 Render 服务 URL，应看到：
   ```
   AI 实时翻译 API 正在运行...
   ```

2. 访问 `https://你的-render-服务名.onrender.com/api/auth/register` 测试 API（POST 请求）。

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
- 查看 Render 日志中的错误信息

### CORS 错误

- 如果前端部署在其他域名，需要修改 `CLIENT_URL` 环境变量
- 或修改 `backend/server.js` 中的 `corsOptions.origin` 数组

---

## 免费版限制

Render Free Plan 的限制：

- 服务在 15 分钟无活动后会休眠
- 首次访问可能需要 30 秒唤醒
- 每月 750 小时运行时间
- 512 MB RAM

---

## 更新部署

代码更新后，推送到 GitHub，Render 会自动重新部署：

```bash
git add .
git commit -m "Your changes"
git push origin master
```

或手动在 Render Dashboard 点击 **Manual Deploy**。
