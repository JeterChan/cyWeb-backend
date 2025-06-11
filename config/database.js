module.exports = {
  development: {
    username:process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    }
  },
  test: {
    username: 'root',
    password: null,
    database: null,
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: process.env.MYSQL_USER,           // 使用用戶, not root
    password: process.env.MYSQL_PASSWORD,       // 使用環境變數密碼
    database: process.env.MYSQL_DATABASE,       // 指定資料庫
    host: process.env.MYSQL_HOST || 'mysql',    // 支援 Docker 容器名稱
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false,                             // 生產環境不顯示 SQL
    dialectOptions: {
      charset: 'utf8mb4'                        // 支援 emoji 和 Unicode
    },
    pool: {
      max: 10,        // 最大連線數
      min: 1,         // 最小連線數
      acquire: 30000, // 取得連線的最大等待時間
      idle: 10000     // 連線閒置多久後釋放
    }
  }
}
