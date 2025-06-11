const session = require('express-session');
const {RedisStore} = require('connect-redis');
const client = require('../config/redis');  

module.exports = session({
  store: new RedisStore({ client, ttl: 60 * 60, logErrors:true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // 在生產環境中使用 HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60* 24, // 1 天
  }
});
