const express = require('express');
const Router = express.Router();

const client = require('../config/redis'); // 假設你有一個 redis 配置文件

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

module.exports = Router;