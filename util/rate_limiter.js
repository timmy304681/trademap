// 此演算法的限流非常精確，但會浪費過多記憶體
const redis = require('./redis');
const moment = require('moment');
const reqLimitPerWindowTime = 500; // times
const windowTime = 1; // seconds

const slidingWindowLogs = async (req, res, next) => {
  if (!redis.ready) {
    // Redis is not connected
    return next();
  }
  const userIp = req.ip;
  const currentTime = moment().valueOf();
  const lessThanTime = moment().subtract(windowTime, 'second').valueOf();
  const key = `SWL:IP:${userIp}`;

  const luaScript = `
    local key = KEYS[1]
    local currentTime = tonumber(ARGV[1])
    local lessThanTime = tonumber(ARGV[2])
    local reqLimitPerWindowTime = tonumber(ARGV[3])
    local windowTime = tonumber(ARGV[4])
    local unique = tonumber(ARGV[5])
    local clearBefore = currentTime - lessThanTime
  
    redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
    local amount = redis.call('ZCARD', key)
    if amount <= reqLimitPerWindowTime then
    redis.call('ZADD', key, currentTime, unique)
    end
    redis.call('EXPIRE', key, windowTime)
    return reqLimitPerWindowTime - amount`;

  // sorted set 其中的member需要unique，因此借用random數字當作unique
  // eval只接受string參數！！！！！！
  const result = await redis.eval(luaScript, {
    keys: [key],
    arguments: [
      currentTime.toString(),
      lessThanTime.toString(),
      reqLimitPerWindowTime.toString(),
      windowTime.toString(),
      (Math.random() * 1000).toString(),
    ],
  });

  if (result <= 0) {
    return res.status(429).json({ error: 'Request too much' });
  }

  next();
};

module.exports = slidingWindowLogs;
