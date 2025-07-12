# cyWeb-backend
### website URL
https://cyweb-backend-staging.up.railway.app/products
# 駿英電商網站後端 (cyWeb-backend)

本專案為駿英電商網站的後端服務，採用 Node.js、Express、MySQL 及 Redis 技術棧開發，並以 Docker 容器化部署。主要提供會員系統、商品管理、購物車、訂單處理等核心 API，支援多種電商流程與即時資料存取。

## 專案特色

- 使用 Node.js + Express 建立 RESTful API
- 整合 MySQL 做為主要關聯式資料庫
- Redis 作為 Session 儲存與快取，提升效能
- 會員註冊/登入/驗證、商品 CRUD、購物車、訂單管理等完整功能
- 採用 Docker 容器化，方便部署與環境一致性
- 支援 Session、認證（Passport）、Email 通知等
- 完善的資料庫模型設計，易於擴充

## 專案架構
- `config/`：存放專案設定（DB、redis 等）
- `controllers/`：存放所有 API 控制器
- `middleware/`：自訂 Express middleware
- `models/`：資料庫 schema 與 ORM 物件
- `routes/`：API 路由定義
- `services/`：邏輯服務層，像是寄信、第三方串接
- `public/`：靜態資源
- `Dockerfile`、`docker-compose.yml`：容器化相關
- `cyWeb.js`：主程式入口


