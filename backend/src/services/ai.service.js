const prisma = require('../config/prisma');

function formatDate(value) {
  if (!value) return 'unknown';
  return new Date(value).toLocaleDateString('en-GB');
}

function buildEmployeeContext(employee, company, user) {
  const remainingVacation =
    (employee.vacationDaysPerYear || 0)
    + (employee.vacationCarryOver || 0)
    - (employee.vacationDaysUsed || 0);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    company: {
      id: company.id,
      name: company.name,
      city: company.city,
      country: company.country,
    },
    employee: {
      id: employee.id,
      fullName: `${employee.firstName} ${employee.lastName}`,
      jobTitle: employee.jobTitle,
      department: employee.department?.name || null,
      contractType: employee.contractType,
      contractNumber: employee.contractNumber,
      contractDate: formatDate(employee.contractDate),
      startDate: formatDate(employee.startDate),
      workLocation: employee.workLocation || null,
      workingHours: employee.workingHours,
      partialHours: employee.partialHours || null,
      grossSalary: employee.grossSalary,
      currency: employee.currency,
      vacationDaysPerYear: employee.vacationDaysPerYear,
      vacationDaysUsed: employee.vacationDaysUsed,
      vacationCarryOver: employee.vacationCarryOver,
      remainingVacation,
      status: employee.status,
    },
  };
}

function buildAdminContext(company, user, summary) {
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    company: {
      id: company.id,
      name: company.name,
      city: company.city,
      country: company.country,
      legalAddress: company.legalAddress || null,
      legalRepresentative: company.legalRepName || null,
      companyEmail: company.email || null,
      cui: company.profileRO?.cui || null,
      caenCode: company.profileRO?.caenCode || null,
      county: company.profileRO?.county || null,
      tradeRegister: company.profileRO?.tradeRegister || null,
    },
    summary: {
      activeEmployees: summary.activeEmployees,
      archivedEmployees: summary.archivedEmployees,
      departments: summary.departments,
      pendingInvitations: summary.pendingInvitations,
    },
    note:
      'This user does not have a linked employee profile. Answer from company-level context only unless more employee-specific context is provided later.',
  };
}

function buildPrompt(question, context) {
  return [
    'You are a practical HR support assistant inside an employee platform.',
    'Answer only from the provided context.',
    'If data is missing, say so clearly.',
    'Do not invent company policy.',
    'Do not provide legal advice.',
    'Keep answers concise and operational.',
    '',
    'Context:',
    JSON.stringify(context, null, 2),
    '',
    `Question: ${question}`,
  ].join('\n');
}

async function callAnthropic(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 500,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error(`Anthropic request failed: ${text}`);
    err.status = 502;
    throw err;
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() || 'No answer returned.';
}

async function answerEmployeeQuestion({ companyId, userId, question }) {
  const user = await prisma.user.findFirst({
    where: { id: userId, companyId },
    select: {
      id: true,
      email: true,
      role: true,
      company: {
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          legalAddress: true,
          legalRepName: true,
          email: true,
          profileRO: {
            select: {
              cui: true,
              caenCode: true,
              county: true,
              tradeRegister: true,
            },
          },
        },
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          jobTitle: true,
          contractType: true,
          contractNumber: true,
          contractDate: true,
          startDate: true,
          workLocation: true,
          workingHours: true,
          partialHours: true,
          grossSalary: true,
          currency: true,
          vacationDaysPerYear: true,
          vacationDaysUsed: true,
          vacationCarryOver: true,
          status: true,
          department: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!user || !user.company) {
    const err = new Error('AI context not found');
    err.status = 404;
    throw err;
  }

  let context;

  if (user.employee) {
    context = buildEmployeeContext(user.employee, user.company, user);
  } else {
    const [activeEmployees, archivedEmployees, departments, pendingInvitations] = await Promise.all([
      prisma.employee.count({
        where: {
          companyId,
          deletedAt: null,
        },
      }),
      prisma.employee.count({
        where: {
          companyId,
          deletedAt: { not: null },
        },
      }),
      prisma.department.count({
        where: { companyId },
      }),
      prisma.invitation.count({
        where: {
          companyId,
          status: 'PENDING',
        },
      }),
    ]);

    context = buildAdminContext(user.company, user, {
      activeEmployees,
      archivedEmployees,
      departments,
      pendingInvitations,
    });
  }

  const prompt = buildPrompt(question, context);
  const answer = await callAnthropic(prompt);

  return { answer, context };
}

module.exports = { answerEmployeeQuestion };
