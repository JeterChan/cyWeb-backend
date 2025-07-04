FROM node:22.15.0-alpine as base
# 安裝 dumb-init
RUN apk add --no-cache dumb-init
# 設定工作目錄
WORKDIR /app
# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 設定 ENTRYPOINT（所有階段共用）
ENTRYPOINT ["dumb-init", "--"]

# 開發階段
FROM base as development
RUN npm install
RUN npm install -g nodemon
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 生產階段
FROM base as production

# 安裝依賴(只安裝生產環境需要的依賴)
RUN npm ci --only=production

# 複製應用程式的源碼
COPY . .

# 創建非 root 用戶
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# 切換到非 root 用戶
USER nodejs

# 暴露端口 
EXPOSE 8080

CMD ["npm","start"]