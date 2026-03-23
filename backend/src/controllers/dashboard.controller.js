'use strict';

const prisma = require('../config/prisma');
const { sendSuccess } = require('../utils/response');
const { isPendingAdminApproval, isPendingEmployeeConfirmation } = require('../utils/vacation-workflow');

async function getStats(req, res) {
  const { companyId, role, id: userId } = req.user;

  if (role === 'admin' || role === 'manager') {
    const [totalEmployees, totalDepartments, pendingVacationRequests] = await Promise.all([
      prisma.employee.count({
        where: { companyId, deletedAt: null, status: 'ACTIVE' },
      }),
      prisma.department.count({
        where: { companyId },
      }),
      prisma.vacationRequest.findMany({
        where: { companyId, status: 'PENDING' },
        select: { status: true, approvedBy: true },
      }),
    ]);

    const pendingVacations = pendingVacationRequests.filter(isPendingAdminApproval).length;
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

  const pendingVacationRequests = employee
    ? await prisma.vacationRequest.findMany({
        where: { companyId, status: 'PENDING', employee: { userId } },
        select: { status: true, approvedBy: true },
      })
    : [];
  const pendingVacations = pendingVacationRequests.filter(
    (request) => isPendingAdminApproval(request) || isPendingEmployeeConfirmation(request),
  ).length;

  return sendSuccess(res, { employee, pendingVacations });
}

module.exports = { getStats };
