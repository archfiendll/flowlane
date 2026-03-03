const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN = '15m',
  JWT_REFRESH_EXPIRES_IN = '30d',
} = process.env;

if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');
if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is missing in .env');

module.exports = { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN };