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
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60, // 1 小時
  }
});
