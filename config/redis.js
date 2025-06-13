const redis = require('redis');

const redisUrl = process.env.REDIS_URL ||'redis://localhost:6379';

const config = {
  production: {
    url: redisUrl
  },
  
  development: {
    socket:{
      host: process.env.REDIS_HOST || 'redis',
      port: process.env.REDIS_PORT || 6379
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const client = redis.createClient(config[env]);

// 連線事件監聽
client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis client error:', err);
});

client.connect().catch(console.error);

module.exports = client