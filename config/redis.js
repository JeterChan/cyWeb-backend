const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
});

client.connect().catch(console.error); // v4 需要明確 connect()

// 連線事件監聽
client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis client error:', err);
});

module.exports = client