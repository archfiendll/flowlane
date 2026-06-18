#!/usr/bin/env node

const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const prisma = require('../src/config/prisma');

dotenv.config({ path: path.join(__dirname, '../.env') });

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const entry = process.argv.slice(2).find((value) => value.startsWith(prefix));
  if (!entry) return fallback;
  return entry.slice(prefix.length) || fallback;
}

function toDate(dateString) {
  return new Date(dateString);
}

function buildContractNumber(deptCode, index) {
  return `FLOW-${deptCode}-${String(index + 1).padStart(3, '0')}`;
}

function buildEmail(deptCode, firstName, lastName) {
  return `${deptCode}.${firstName}.${lastName}@demo.flowlane.local`.toLowerCase();
}

function getDemoDepartments() {
  return [
    {
      name: 'Human Resources',
      code: 'hr',
      managerTitle: 'HR Manager',
      employees: [
        { firstName: 'Ana', lastName: 'Ionescu', title: 'HR Manager', role: 'manager', salary: 9200 },
        { firstName: 'Bogdan', lastName: 'Radu', title: 'HR Specialist', role: 'employee', salary: 6900 },
        { firstName: 'Carla', lastName: 'Marin', title: 'Recruiter', role: 'employee', salary: 6600 },
        { firstName: 'Daniel', lastName: 'Stan', title: 'Payroll Specialist', role: 'employee', salary: 7100 },
        { firstName: 'Elena', lastName: 'Popa', title: 'HR Generalist', role: 'employee', salary: 6800 },
      ],
    },
    {
      name: 'Engineering',
      code: 'eng',
      managerTitle: 'Engineering Manager',
      employees: [
        { firstName: 'Mihai', lastName: 'Georgescu', title: 'Engineering Manager', role: 'manager', salary: 12000 },
        { firstName: 'Andreea', lastName: 'Dumitrescu', title: 'Backend Developer', role: 'employee', salary: 11000 },
        { firstName: 'Vlad', lastName: 'Petrescu', title: 'Frontend Developer', role: 'employee', salary: 10800 },
        { firstName: 'Irina', lastName: 'Matei', title: 'QA Engineer', role: 'employee', salary: 8500 },
        { firstName: 'Rares', lastName: 'Pavel', title: 'DevOps Engineer', role: 'employee', salary: 11800 },
      ],
    },
    {
      name: 'Sales',
      code: 'sales',
      managerTitle: 'Sales Manager',
      employees: [
        { firstName: 'Sonia', lastName: 'Tudor', title: 'Sales Manager', role: 'manager', salary: 9800 },
        { firstName: 'Filip', lastName: 'Dobrescu', title: 'Account Executive', role: 'employee', salary: 7600 },
        { firstName: 'Gabriela', lastName: 'Nistor', title: 'Business Development', role: 'employee', salary: 7300 },
        { firstName: 'Oana', lastName: 'Dobre', title: 'Sales Specialist', role: 'employee', salary: 7100 },
        { firstName: 'Marius', lastName: 'Ene', title: 'Customer Success', role: 'employee', salary: 7000 },
      ],
    },
    {
      name: 'Operations',
      code: 'ops',
      managerTitle: 'Operations Manager',
      employees: [
        { firstName: 'Alina', lastName: 'Popescu', title: 'Operations Manager', role: 'manager', salary: 9500 },
        { firstName: 'Cosmin', lastName: 'Iancu', title: 'Operations Specialist', role: 'employee', salary: 6800 },
        { firstName: 'Bianca', lastName: 'Serban', title: 'Office Coordinator', role: 'employee', salary: 6200 },
        { firstName: 'Teodor', lastName: 'Matei', title: 'Procurement Specialist', role: 'employee', salary: 7400 },
        { firstName: 'Mara', lastName: 'Stoica', title: 'Logistics Specialist', role: 'employee', salary: 7100 },
      ],
    },
  ];
}

async function main() {
  const companySlug = getArg('companySlug');
  const companyIdArg = getArg('companyId');
  const password = getArg('password', 'Password123!');
  const companyId = companyIdArg ? Number.parseInt(companyIdArg, 10) : null;

  const company = companyId
    ? await prisma.company.findUnique({ where: { id: companyId } })
    : companySlug
      ? await prisma.company.findUnique({ where: { slug: companySlug } })
      : await prisma.company.findFirst({ orderBy: { createdAt: 'asc' } });

  if (!company) {
    throw new Error('No company found. Create a company first or pass --companyId / --companySlug.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const departments = getDemoDepartments();
  const results = [];

  for (const departmentSeed of departments) {
    const department = await prisma.department.upsert({
      where: {
        companyId_name: {
          companyId: company.id,
          name: departmentSeed.name,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        name: departmentSeed.name,
      },
    });

    let managerEmployeeId = null;

    for (let index = 0; index < departmentSeed.employees.length; index += 1) {
      const person = departmentSeed.employees[index];
      const email = buildEmail(departmentSeed.code, person.firstName, person.lastName);
      const contractNumber = buildContractNumber(departmentSeed.code, index);
      const user = await prisma.user.findUnique({ where: { email } });
      const nextUser = user
        ? await prisma.user.update({
          where: { email },
          data: {
            password: passwordHash,
            role: person.role,
            companyId: company.id,
          },
        })
        : await prisma.user.create({
          data: {
            email,
            password: passwordHash,
            role: person.role,
            companyId: company.id,
          },
        });

      const existingEmployee = await prisma.employee.findUnique({
        where: {
          companyId_contractNumber: {
            companyId: company.id,
            contractNumber,
          },
        },
      });

      const employeePayload = {
        userId: nextUser.id,
        departmentId: department.id,
        firstName: person.firstName,
        lastName: person.lastName,
        personalEmail: email,
        jobTitle: person.title,
        startDate: toDate(`2025-${String(index + 1).padStart(2, '0')}-01`),
        contractType: 'PERMANENT',
        contractNumber,
        contractDate: toDate(`2025-${String(index + 1).padStart(2, '0')}-01`),
        workingHours: 'FULL',
        grossSalary: person.salary,
        currency: 'RON',
        vacationDaysPerYear: person.role === 'manager' ? 25 : 21,
        vacationDaysUsed: 0,
        vacationCarryOver: 0,
        status: 'ACTIVE',
        deletedAt: null,
      };

      const employee = existingEmployee
        ? await prisma.employee.update({
          where: { id: existingEmployee.id },
          data: employeePayload,
        })
        : await prisma.employee.create({
          data: {
            companyId: company.id,
            ...employeePayload,
          },
        });

      if (person.role === 'manager' && !managerEmployeeId) {
        managerEmployeeId = employee.id;
      }

      results.push({
        department: department.name,
        name: `${person.firstName} ${person.lastName}`,
        email,
        role: person.role,
      });
    }

    if (managerEmployeeId) {
      await prisma.department.update({
        where: { id: department.id },
        data: { managerId: managerEmployeeId },
      });
    }
  }

  console.log(`Seeded ${results.length} employees across ${departments.length} departments for company "${company.name}".`);
  console.log(`Temporary login password for all seeded users: ${password}`);
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
