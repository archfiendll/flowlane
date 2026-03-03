const { JWT_SECRET, JWT_EXPIRES_IN = '7d' } = process.env;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in .env');
}



module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
