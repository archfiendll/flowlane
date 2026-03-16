'use strict';

const prisma = require('../config/prisma');

function calculateDays(startDate, endDate) {
  const ms = new Date(endDate).setHours(0, 0, 0, 0) - new Date(startDate).setHours(0, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

async function getEmployeeForUser(companyId, userId) {
  const employee = await prisma.employee.findFirst({
    where: { companyId, userId, deletedAt: null },
    select: {
      id: true,
      vacationDaysPerYear: true,
      vacationDaysUsed: true,
      vacationCarryOver: true,
    },
  });

  if (!employee) {
    const err = new Error('No active employee profile found for this account');
    err.status = 404;
    throw err;
  }

  return employee;
}

async function listVacationRequests({ companyId, role, userId, departmentId }) {
  const where = role === 'employee'
    ? { companyId, employee: { userId } }
    : {
        companyId,
        ...(departmentId ? { employee: { departmentId } } : {}),
      };

  return prisma.vacationRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      days: true,
      status: true,
      note: true,
      approvedBy: true,
      createdAt: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: { select: { name: true } },
        },
      },
    },
  });
}

async function createVacationRequest({ companyId, userId, type, startDate, endDate, note }) {
  if (new Date(startDate) > new Date(endDate)) {
    const err = new Error('End date must be after start date');
    err.status = 400;
    throw err;
  }

  const employee = await getEmployeeForUser(companyId, userId);
  const days = calculateDays(startDate, endDate);
  const remainingDays = employee.vacationDaysPerYear + employee.vacationCarryOver - employee.vacationDaysUsed;

  if (type === 'ANNUAL' && days > remainingDays) {
    const err = new Error('Not enough remaining annual vacation days');
    err.status = 400;
    throw err;
  }

  return prisma.vacationRequest.create({
    data: {
      employeeId: employee.id,
      companyId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      status: 'PENDING',
      note: note?.trim() || null,
    },
    select: {
      id: true,
      type: true,
      startDate: true,
      endDate: true,
      days: true,
      status: true,
      note: true,
      createdAt: true,
    },
  });
}

async function updateVacationStatus({ companyId, requestId, status, approverId }) {
  const request = await prisma.vacationRequest.findFirst({
    where: { id: requestId, companyId },
    include: { employee: true },
  });

  if (!request) {
    const err = new Error('Vacation request not found');
    err.status = 404;
    throw err;
  }

  if (request.status !== 'PENDING') {
    const err = new Error('Only pending vacation requests can be updated');
    err.status = 409;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.vacationRequest.update({
      where: { id: requestId },
      data: { status, approvedBy: approverId },
      select: {
        id: true,
        status: true,
        approvedBy: true,
        updatedAt: true,
      },
    });

    if (status === 'APPROVED' && request.type === 'ANNUAL') {
      await tx.employee.update({
        where: { id: request.employeeId },
        data: { vacationDaysUsed: { increment: request.days } },
      });
    }

    return updated;
  });
}

module.exports = {
  listVacationRequests,
  createVacationRequest,
  updateVacationStatus,
};
