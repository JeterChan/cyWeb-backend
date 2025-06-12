const express = require('express');
const Router = express.Router();

const client = require('../config/redis'); // 假設你有一個 redis 配置文件
const db = require('../db/models'); // 假設你有一個 Sequelize 模型

Router.get('/test-simple', (req, res) => {
  console.log('簡單測試端點被調用');
  res.json({ message: 'OK', timestamp: new Date().toISOString() });
});

Router.get('/test-redis', async (req, res) => {
  try {
    console.log('測試 Redis 連接');
    await client.set('test', 'hello');
    const result = await client.get('test');
    res.json({ redis: 'OK', result });
  } catch (error) {
    console.error('Redis 測試失敗:', error);
    res.status(500).json({ redis: 'FAIL', error: error.message });
  }
});


// 測試 db 對象載入
Router.get('/debug-db-object', async (req, res) => {
  try {
    console.log('🔹 檢查 db 對象');
    
    // 檢查 sequelize 實例
    console.log('🔹 Sequelize 實例存在:', !!db.sequelize);
    console.log('🔹 可用的模型:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
    
    // 測試連線
    await db.sequelize.authenticate();
    console.log('✅ Sequelize 連線成功');
    
    res.json({
      sequelize: 'OK',
      models: Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ db 對象測試失敗:', error);
    res.status(500).json({ 
      error: error.message,
      name: error.name,
      config: 'check console logs'
    });
  }
});

Router.get('/debug-sequelize-config', (req, res) => {
  try {
    const env = process.env.NODE_ENV || 'development';
    const config = require('./config/database.js')[env]; // 調整路徑
    
    console.log('🔧 當前環境:', env);
    console.log('🔧 載入的配置:', {
      hasConfig: !!config,
      useEnvVariable: config?.use_env_variable,
      host: config?.host,
      database: config?.database,
      username: config?.username,
      hasPassword: !!config?.password,
      dialect: config?.dialect
    });
    
    res.json({
      environment: env,
      config: {
        hasConfig: !!config,
        useEnvVariable: config?.use_env_variable,
        host: config?.host,
        database: config?.database,
        username: config?.username,
        hasPassword: !!config?.password,
        dialect: config?.dialect
      }
    });
  } catch (error) {
    console.error('❌ 配置載入失敗:', error);
    res.status(500).json({ 
      configLoad: 'FAIL', 
      error: error.message 
    });
  }
});

module.exports = Router;