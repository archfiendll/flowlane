const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');
async function register({ email, password, companyName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        slug: companyName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + crypto.randomBytes(3).toString('hex'),
        legalAddress: '',
        city: '',
        country: '',
        legalRepName: '',
        legalRepTitle: '',
      },
    });

    const user = await tx.user.create({
      data: {
        email,
        password: hashed,
        role: 'admin',
        companyId: company.id,
      },
      select: { id: true, email: true, role: true, companyId: true, createdAt: true },
    });


    return { user, company };
  });

  return result;
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, companyId: true, password: true, },
  });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, companyId: user.companyId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const rawRefreshToken = crypto.randomBytes(64).toString('hex');
  const hashedRefreshToken = await bcrypt.hash(rawRefreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return {
    token: accessToken,
    refreshToken: rawRefreshToken,
    user: { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
  };
}

async function refresh(rawRefreshToken) {
  if (!rawRefreshToken) {
    const err = new Error('Refresh token required');
    err.status = 401;
    throw err;
  }

  const users = await prisma.user.findMany({
    where: { refreshToken: { not: null } },
    select: { id: true, email: true, role: true, refreshToken: true },
  });

  // Check all users in parallel instead of a loop
  const results = await Promise.all(
    users.map(async (u) => {
      const match = await bcrypt.compare(rawRefreshToken, u.refreshToken);
      return match ? u : null;
    })
  );
  const matchedUser = results.find((u) => u !== null);

  if (!matchedUser) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { sub: matchedUser.id, role: matchedUser.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
  const newHashedRefreshToken = await bcrypt.hash(newRawRefreshToken, 10);

  await prisma.user.update({
    where: { id: matchedUser.id },
    data: { refreshToken: newHashedRefreshToken },
  });

  return { token: accessToken, refreshToken: newRawRefreshToken };
}

async function logout(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

module.exports = { register, login, refresh, logout };