'use strict';

const prisma = require('../config/prisma');

async function listEmployees(companyId, { page = 1, limit = 20, status } = {}) {
  const where = {
    companyId,
    deletedAt: null,
    ...(status ? { status } : {}),
  };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        status: true,
        contractType: true,
        startDate: true,
        grossSalary: true,
        currency: true,
        personalEmail: true,
        department: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        createdAt: true,
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    data: employees,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

async function getEmployee(companyId, employeeId) {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId, deletedAt: null },
    include: {
      department: true,
      user: { select: { id: true, email: true, role: true } },
      profileRO: true,
    },
  });

  if (!employee) {
    const err = new Error('Employee not found');
    err.status = 404;
    throw err;
  }

  return employee;
}

async function createEmployee(companyId, data) {
  const existing = await prisma.employee.findUnique({
    where: {
      companyId_contractNumber: {
        companyId,
        contractNumber: data.contractNumber,
      },
    },
  });

  if (existing) {
    const err = new Error('Contract number already exists in this company');
    err.status = 409;
    throw err;
  }

    const employee = await prisma.employee.create({
    data: { ...data, companyId, vacationDaysUsed: 0, vacationCarryOver: 0 },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      status: true,
      contractType: true,
      startDate: true,
      createdAt: true,
    },
  });

  return employee;
}

async function updateEmployee(companyId, employeeId, data) {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, companyId, deletedAt: null },
  });

  if (!existing) {
    const err = new Error('Employee not found');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      jobTitle: true,
      status: true,
      updatedAt: true,
    },
  });

  return updated;
}

async function deactivateEmployee(companyId, employeeId) {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, companyId, deletedAt: null },
  });

  if (!existing) {
    const err = new Error('Employee not found');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: { status: 'INACTIVE', deletedAt: new Date() },
    select: { id: true, status: true, deletedAt: true },
  });

  return updated;
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
};