const prisma = require('../config/prisma');

async function listUsers(companyId) {
  return prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      email: true,
      companyId: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { id: 'asc' },
  });
}

module.exports = { listUsers };
