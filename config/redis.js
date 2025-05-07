const redis = require('redis');

const client = redis.createClient();

client.connect().catch(console.error); // v4 需要明確 connect()

module.exports = client