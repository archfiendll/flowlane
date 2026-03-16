'use strict';

const prisma = require('../config/prisma');

async function listDepartments(companyId) {
  return prisma.department.findMany({
    where: { companyId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { employees: { where: { deletedAt: null } } } },
    },
  });
}

async function createDepartment(companyId, { name }) {
  try {
    return await prisma.department.create({
      data: { companyId, name: name.trim() },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { employees: { where: { deletedAt: null } } } },
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Department name already exists in this company');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function updateDepartment(companyId, departmentId, { name }) {
  const existing = await prisma.department.findFirst({
    where: { id: departmentId, companyId },
  });

  if (!existing) {
    const err = new Error('Department not found');
    err.status = 404;
    throw err;
  }

  try {
    return await prisma.department.update({
      where: { id: departmentId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { employees: { where: { deletedAt: null } } } },
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      const err = new Error('Department name already exists in this company');
      err.status = 409;
      throw err;
    }
    throw error;
  }
}

async function deleteDepartment(companyId, departmentId) {
  const existing = await prisma.department.findFirst({
    where: { id: departmentId, companyId },
    select: {
      id: true,
      _count: { select: { employees: { where: { deletedAt: null } } } },
    },
  });

  if (!existing) {
    const err = new Error('Department not found');
    err.status = 404;
    throw err;
  }

  if (existing._count.employees > 0) {
    const err = new Error('Cannot delete a department with active employees assigned');
    err.status = 409;
    throw err;
  }

  await prisma.department.delete({ where: { id: departmentId } });
  return { id: departmentId };
}

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
