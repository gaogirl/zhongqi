# 使用 Node.js 官方镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY . .

# 创建 uploads 目录（用于音频文件上传）
RUN mkdir -p uploads

# 暴露端口
EXPOSE 5000

# 设置环境变量默认值
ENV NODE_ENV=production
ENV PORT=5000

# 启动应用
CMD ["node", "server.js"]
