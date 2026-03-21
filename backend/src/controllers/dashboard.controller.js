'use strict';

const prisma = require('../config/prisma');
const { sendSuccess } = require('../utils/response');

async function getStats(req, res) {
  const { companyId, role, id: userId } = req.user;

  if (role === 'admin' || role === 'manager') {
    const [totalEmployees, totalDepartments, pendingVacations] = await Promise.all([
      prisma.employee.count({
        where: { companyId, deletedAt: null, status: 'ACTIVE' },
      }),
      prisma.department.count({
        where: { companyId },
      }),
      prisma.vacationRequest.count({
        where: { companyId, status: 'PENDING', approvedBy: null },
      }),
    ]);

    return sendSuccess(res, { totalEmployees, totalDepartments, pendingVacations });
  }

  // Employee — show their own data
  const employee = await prisma.employee.findFirst({
    where: { userId, companyId, deletedAt: null },
    select: {
      firstName: true,
      lastName: true,
      jobTitle: true,
      startDate: true,
      contractType: true,
      grossSalary: true,
      currency: true,
      vacationDaysPerYear: true,
      vacationDaysUsed: true,
      vacationCarryOver: true,
      department: { select: { name: true } },
    },
  });

  const pendingVacations = employee ? await prisma.vacationRequest.count({
    where: { companyId, status: 'PENDING', employee: { userId } },
  }) : 0;

  return sendSuccess(res, { employee, pendingVacations });
}

module.exports = { getStats };
