const session = require('express-session');
const {RedisStore} = require('connect-redis');
const client = require('../config/redis');  

module.exports = session({
  store: new RedisStore({ client, prefix: 'sess:' }),
  secret: 'cyWeb_secret',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'strict',
  },
  rolling: true,
});
