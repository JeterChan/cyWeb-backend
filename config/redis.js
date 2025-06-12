const redis = require('redis');

const config = {
  production: {
    url: process.env.REDIS_URL
  },
  
  development: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
};

const env = process.env.NODE_ENV || 'development';
const client = redis.createClient(config[env]);
client.connect().catch(console.error); // v4 需要明確 connect()

// 連線事件監聽
client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis client error:', err);
});

module.exports = client