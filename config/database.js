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
    // 使用 Railway 的 DATABASE_URL
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    }
  },
}
