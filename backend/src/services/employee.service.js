'use strict';

const prisma = require('../config/prisma');

async function listEmployees(
  companyId,
  {
    page = 1,
    limit = 20,
    status,
    departmentId,
    archived = 'active',
    q,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {},
) {
  const archivedWhere =
    archived === 'all' ? {} : archived === 'archived' ? { deletedAt: { not: null } } : { deletedAt: null };

  const search = q?.trim();
  const where = {
    companyId,
    ...archivedWhere,
    ...(status ? { status } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { jobTitle: { contains: search, mode: 'insensitive' } },
            { personalEmail: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const sortMap = {
    createdAt: { createdAt: sortOrder },
    startDate: { startDate: sortOrder },
    name: [{ firstName: sortOrder }, { lastName: sortOrder }],
  };
  const orderBy = sortMap[sortBy] || sortMap.createdAt;

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
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
        deletedAt: true,
      },
    }),
    prisma.employee.count({ where }),
  ]);

  const emails = employees
    .map((employee) => employee.personalEmail?.trim().toLowerCase())
    .filter(Boolean);

  let latestInvitationByEmail = new Map();

  if (emails.length > 0) {
    const invitations = await prisma.invitation.findMany({
      where: {
        companyId,
        email: { in: emails },
      },
      select: {
        email: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    latestInvitationByEmail = invitations.reduce((acc, invitation) => {
      const key = invitation.email.trim().toLowerCase();
      if (!acc.has(key)) {
        const isExpired = invitation.status === 'PENDING' && new Date(invitation.expiresAt) < new Date();
        acc.set(key, {
          ...invitation,
          status: isExpired ? 'EXPIRED' : invitation.status,
        });
      }
      return acc;
    }, new Map());
  }

  const enrichedEmployees = employees.map((employee) => ({
    ...employee,
    invitation: employee.personalEmail
      ? latestInvitationByEmail.get(employee.personalEmail.trim().toLowerCase()) || null
      : null,
  }));

  return {
    data: enrichedEmployees,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      filters: { status: status || null, archived, q: search || '', sortBy, sortOrder },
    },
  };
}

async function getEmployee(companyId, employeeId) {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
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

async function restoreEmployee(companyId, employeeId) {
  const existing = await prisma.employee.findFirst({
    where: { id: employeeId, companyId, deletedAt: { not: null } },
  });

  if (!existing) {
    const err = new Error('Archived employee not found');
    err.status = 404;
    throw err;
  }

  const restored = await prisma.employee.update({
    where: { id: employeeId },
    data: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, status: true, deletedAt: true, updatedAt: true },
  });

  return restored;
}

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  restoreEmployee,
};
