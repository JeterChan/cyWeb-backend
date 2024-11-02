const { Sequelize } = require('sequelize');
const config = require('./config/database.js')[process.env.NODE_ENV || 'development'];

console.log(config)

// 建立 Sequelize 實例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    logging: console.log // 設為 false 可以關閉 SQL 查詢日誌
  }
);

// 測試連線函數
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');
    
    // 顯示連線資訊
    console.log('資料庫資訊：', {
      database: config.database,
      host: config.host,
      port: config.port,
      dialect: config.dialect
    });
    
  } catch (error) {
    console.error('❌ 無法連線到資料庫：', error);
  } finally {
    // 關閉連線
    await sequelize.close();
  }
}

// 執行測試
testConnection();