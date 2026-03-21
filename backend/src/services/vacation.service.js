'use strict';

const prisma = require('../config/prisma');

function normalizeVacationStatus(status) {
  if (status === 'PENDING') return 'PENDING_ADMIN_APPROVAL';
  if (status === 'PENDING_ADMIN_APPROVAL') return 'PENDING_ADMIN_APPROVAL';
  if (status === 'PENDING_EMPLOYEE_CONFIRMATION') return 'PENDING_EMPLOYEE_CONFIRMATION';
  return status;
}

function getWorkflowStatus(request) {
  if (request.status === 'PENDING' && request.approvedBy) {
    return 'PENDING_EMPLOYEE_CONFIRMATION';
  }

  return normalizeVacationStatus(request.status);
}

function calculateDays(startDate, endDate) {
  const ms = new Date(endDate).setHours(0, 0, 0, 0) - new Date(startDate).setHours(0, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

async function getEmployeeForUser(companyId, userId) {
  const employee = await prisma.employee.findFirst({
    where: { companyId, userId, deletedAt: null },
    select: {
      id: true,
      userId: true,
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

async function getEmployeeForAdmin(companyId, employeeId) {
  const employee = await prisma.employee.findFirst({
    where: { companyId, id: employeeId, deletedAt: null },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      vacationDaysPerYear: true,
      vacationDaysUsed: true,
      vacationCarryOver: true,
    },
  });

  if (!employee) {
    const err = new Error('Employee not found');
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

  const requests = await prisma.vacationRequest.findMany({
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
      updatedAt: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userId: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  return requests.map((request) => ({
    ...request,
    status: getWorkflowStatus(request),
  }));
}

async function createVacationRequest({ companyId, userId, role, employeeId, type, startDate, endDate, note }) {
  if (new Date(startDate) > new Date(endDate)) {
    const err = new Error('End date must be after start date');
    err.status = 400;
    throw err;
  }

  const employee =
    role === 'admin' || role === 'manager'
      ? employeeId
        ? await getEmployeeForAdmin(companyId, employeeId)
        : await getEmployeeForUser(companyId, userId)
      : await getEmployeeForUser(companyId, userId);

  if ((role === 'admin' || role === 'manager') && employeeId && employee.userId === userId) {
    const err = new Error('Use the normal self-service flow for your own vacation request');
    err.status = 400;
    throw err;
  }

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
      approvedBy:
        role === 'admin' || role === 'manager'
          ? employeeId
            ? userId
            : null
          : null,
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

  const currentStatus = getWorkflowStatus(request);

  if (currentStatus !== 'PENDING_ADMIN_APPROVAL' && currentStatus !== 'PENDING_EMPLOYEE_CONFIRMATION') {
    const err = new Error('Only pending vacation requests can be updated');
    err.status = 409;
    throw err;
  }

  if (status === 'APPROVED' && currentStatus !== 'PENDING_ADMIN_APPROVAL') {
    const err = new Error('Only requests waiting for admin approval can be approved from this action');
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

async function confirmVacationRequest({ companyId, requestId, userId }) {
  const request = await prisma.vacationRequest.findFirst({
    where: { id: requestId, companyId },
    include: { employee: true },
  });

  if (!request) {
    const err = new Error('Vacation request not found');
    err.status = 404;
    throw err;
  }

  if (request.employee.userId !== userId) {
    const err = new Error('You can only confirm your own vacation requests');
    err.status = 403;
    throw err;
  }

  if (getWorkflowStatus(request) !== 'PENDING_EMPLOYEE_CONFIRMATION') {
    const err = new Error('This vacation request is not waiting for employee confirmation');
    err.status = 409;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.vacationRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
      select: {
        id: true,
        status: true,
        approvedBy: true,
        updatedAt: true,
      },
    });

    if (request.type === 'ANNUAL') {
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
  confirmVacationRequest,
};
