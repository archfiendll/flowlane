const prisma = require('../config/prisma');

const DAY_MS = 24 * 60 * 60 * 1000;
const CONTRACT_EXPIRY_WINDOW_DAYS = 90;

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
  super_admin: 'Super admin',
  unassigned: 'Unassigned',
};

const VACATION_TYPE_LABELS = {
  ANNUAL: 'Annual',
  MEDICAL: 'Medical',
  PARENTAL: 'Parental',
  UNPAID: 'Unpaid',
};

const REPORT_EXPORTS = {
  headcount: {
    filenamePrefix: 'headcount_report',
    columns: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'department', label: 'Department' },
      { key: 'position', label: 'Position' },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start Date' },
    ],
  },
  leave: {
    filenamePrefix: 'leave_report',
    columns: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'department', label: 'Department' },
      { key: 'leaveType', label: 'Leave Type' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'status', label: 'Status' },
      { key: 'daysCount', label: 'Days Count' },
    ],
  },
  onboarding: {
    filenamePrefix: 'onboarding_report',
    columns: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'position', label: 'Position' },
      { key: 'inviteDate', label: 'Invite Date' },
      { key: 'inviteStatus', label: 'Invite Status' },
      { key: 'departments', label: 'Departments' },
    ],
  },
  'contract-expiry': {
    filenamePrefix: 'contract_expiry_report',
    columns: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'department', label: 'Department' },
      { key: 'contractStart', label: 'Contract Start' },
      { key: 'contractEnd', label: 'Contract End' },
      { key: 'daysUntilExpiry', label: 'Days Until Expiry' },
    ],
  },
};

function normalizeRoleFilter(role) {
  if (!role || role === 'all') return 'all';
  if (['admin', 'manager', 'employee', 'super_admin', 'unassigned'].includes(role)) {
    return role;
  }
  return 'all';
}

function parseDepartmentFilter(departmentId) {
  if (departmentId === undefined || departmentId === null || departmentId === '') {
    return null;
  }

  const parsed = Number.parseInt(departmentId, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseDateFilter(value) {
  if (!value) return null;

  const parts = String(value).split('-').map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatLocalDate(date) {
  if (!date) return '—';

  const next = new Date(date);
  if (Number.isNaN(next.getTime())) return '—';

  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildFilename(prefix) {
  return `${prefix}_${formatLocalDate(new Date())}.csv`;
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');

  if (/[,"\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

function buildCsv(columns, rows) {
  const header = columns.map((column) => escapeCsv(column.label)).join(',');
  const body = rows
    .map((row) => columns.map((column) => escapeCsv(row[column.key])).join(','))
    .join('\n');

  return `\ufeff${[header, body].filter(Boolean).join('\n')}`;
}

function formatFullName(employee) {
  return [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim() || '—';
}

function getRemainingVacationDays(employee) {
  return (employee.vacationDaysPerYear || 0)
    + (employee.vacationCarryOver || 0)
    - (employee.vacationDaysUsed || 0);
}

function resolveEmployeeRole(employee) {
  return employee.user?.role || 'unassigned';
}

function matchesRoleFilter(employeeRole, filterRole) {
  if (filterRole === 'all') return true;
  if (filterRole === 'unassigned') return employeeRole === 'unassigned';
  return employeeRole === filterRole;
}

function matchesDepartmentFilter(employee, departmentId) {
  if (!departmentId) return true;
  return employee.department?.id === departmentId;
}

function matchesDateFilter(dateValue, from, to) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  if (from && date < startOfDay(from)) return false;
  if (to && date > endOfDay(to)) return false;
  return true;
}

function formatVacationStatus(status) {
  if (!status) return 'pending';
  return String(status).toLowerCase();
}

function formatInviteStatus(invitation) {
  if (invitation.status === 'PENDING' && invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
    return 'expired';
  }

  if (invitation.status === 'PENDING') return 'pending';
  if (invitation.status === 'ACCEPTED') return 'accepted';
  if (invitation.status === 'EXPIRED') return 'expired';

  return String(invitation.status || '').toLowerCase();
}

function getContractExpiryWindow(from, to) {
  const now = startOfDay(new Date());
  const maxWindow = endOfDay(addDays(now, CONTRACT_EXPIRY_WINDOW_DAYS));

  const requestedFrom = from ? startOfDay(from) : now;
  const requestedTo = to ? endOfDay(to) : maxWindow;
  const rangeFrom = requestedFrom > now ? requestedFrom : now;
  const rangeTo = requestedTo < maxWindow ? requestedTo : maxWindow;

  if (rangeFrom > rangeTo) {
    return null;
  }

  return { from: rangeFrom, to: rangeTo };
}

async function loadReportingContext(companyId) {
  const [departments, employees, invitations, vacationRequests] = await Promise.all([
    prisma.department.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        grossSalary: true,
        currency: true,
        status: true,
        startDate: true,
        contractDate: true,
        contractEndDate: true,
        vacationDaysPerYear: true,
        vacationDaysUsed: true,
        vacationCarryOver: true,
        personalEmail: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            role: true,
            email: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    }),
    prisma.invitation.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        acceptedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vacationRequest.findMany({
      where: { companyId },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        days: true,
        status: true,
        approvedBy: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            personalEmail: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            user: {
              select: {
                role: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    departments,
    employees,
    invitations,
    vacationRequests,
  };
}

function buildHeadcountRows(employees, { departmentId, role, from, to }) {
  return employees
    .filter((employee) => matchesDepartmentFilter(employee, departmentId))
    .filter((employee) => matchesRoleFilter(resolveEmployeeRole(employee), role))
    .filter((employee) => matchesDateFilter(employee.startDate, from, to))
    .map((employee) => ({
      id: employee.id,
      employeeName: formatFullName(employee),
      department: employee.department?.name || 'Unassigned',
      position: employee.jobTitle || '—',
      status: employee.status === 'ACTIVE' ? 'active' : 'inactive',
      startDate: formatLocalDate(employee.startDate),
      role: resolveEmployeeRole(employee),
      roleLabel: ROLE_LABELS[resolveEmployeeRole(employee)] || 'Unassigned',
      grossSalary: employee.grossSalary,
      currency: employee.currency,
      remainingVacationDays: getRemainingVacationDays(employee),
      vacationDaysPerYear: employee.vacationDaysPerYear || 0,
      vacationDaysUsed: employee.vacationDaysUsed || 0,
      vacationCarryOver: employee.vacationCarryOver || 0,
      contractStart: formatLocalDate(employee.startDate),
      contractDate: formatLocalDate(employee.contractDate),
      contractEnd: formatLocalDate(employee.contractEndDate),
      contractEndDate: employee.contractEndDate || null,
    }));
}

function buildLeaveRows(vacationRequests, { departmentId, role, from, to }) {
  return vacationRequests
    .filter((request) => request.employee)
    .filter((request) => matchesDepartmentFilter(request.employee, departmentId))
    .filter((request) => matchesRoleFilter(resolveEmployeeRole(request.employee), role))
    .filter((request) => matchesDateFilter(request.startDate, from, to))
    .map((request) => ({
      id: request.id,
      employeeName: formatFullName(request.employee),
      department: request.employee.department?.name || 'Unassigned',
      leaveType: VACATION_TYPE_LABELS[request.type] || request.type,
      startDate: formatLocalDate(request.startDate),
      endDate: formatLocalDate(request.endDate),
      status: formatVacationStatus(request.status),
      daysCount: request.days,
      role: resolveEmployeeRole(request.employee),
      roleLabel: ROLE_LABELS[resolveEmployeeRole(request.employee)] || 'Unassigned',
    }));
}

function buildOnboardingRows(employees, invitations, { departmentId, role, from, to }) {
  const employeeByEmail = employees.reduce((acc, employee) => {
    const emails = [employee.personalEmail, employee.user?.email].filter(Boolean);
    emails.forEach((email) => {
      acc.set(email.trim().toLowerCase(), employee);
    });
    return acc;
  }, new Map());

  const latestInvitationByEmail = invitations.reduce((acc, invitation) => {
    const key = invitation.email.trim().toLowerCase();
    if (!acc.has(key)) {
      acc.set(key, invitation);
    }
    return acc;
  }, new Map());

  return Array.from(latestInvitationByEmail.values())
    .map((invitation) => {
      const matchedEmployee = employeeByEmail.get(invitation.email.trim().toLowerCase()) || null;
      const roleValue = matchedEmployee?.user?.role || invitation.role || 'unassigned';

      return {
        id: invitation.id,
        employeeName: matchedEmployee ? formatFullName(matchedEmployee) : invitation.email,
        position: matchedEmployee?.jobTitle || '—',
        inviteDate: formatLocalDate(invitation.createdAt),
        inviteCreatedAt: invitation.createdAt,
        inviteStatus: formatInviteStatus(invitation),
        departments: matchedEmployee?.department?.name || 'Unassigned',
        matchedEmployee,
        role: roleValue,
      };
    })
    .filter((row) => matchesRoleFilter(row.role, role))
    .filter((row) => (departmentId ? row.matchedEmployee?.department?.id === departmentId : true))
    .filter((row) => matchesDateFilter(row.inviteCreatedAt, from, to))
    .map((row) => ({
      id: row.id,
      employeeName: row.employeeName,
      position: row.position,
      inviteDate: row.inviteDate,
      inviteStatus: row.inviteStatus,
      departments: row.departments,
      role: row.role,
      roleLabel: ROLE_LABELS[row.role] || 'Unassigned',
    }));
}

function buildContractExpiryRows(employees, { departmentId, role, from, to }) {
  const windowRange = getContractExpiryWindow(from, to);
  if (!windowRange) return [];

  return employees
    .filter((employee) => employee.contractEndDate)
    .filter((employee) => matchesDepartmentFilter(employee, departmentId))
    .filter((employee) => matchesRoleFilter(resolveEmployeeRole(employee), role))
    .filter((employee) => matchesDateFilter(employee.contractEndDate, windowRange.from, windowRange.to))
    .map((employee) => {
      const today = startOfDay(new Date());
      const expiry = startOfDay(employee.contractEndDate);
      const daysUntilExpiry = Math.max(0, Math.floor((expiry.getTime() - today.getTime()) / DAY_MS));

      return {
        id: employee.id,
        employeeName: formatFullName(employee),
        department: employee.department?.name || 'Unassigned',
        contractStart: formatLocalDate(employee.startDate),
        contractEnd: formatLocalDate(employee.contractEndDate),
        daysUntilExpiry,
        role: resolveEmployeeRole(employee),
        roleLabel: ROLE_LABELS[resolveEmployeeRole(employee)] || 'Unassigned',
      };
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

function buildSummary(headcountRows, leaveRows, onboardingRows, contractExpiryRows) {
  const payrollTotalsByCurrency = headcountRows.reduce((acc, row) => {
    const current = acc.get(row.currency) || 0;
    acc.set(row.currency, current + Number(row.grossSalary || 0));
    return acc;
  }, new Map());

  return {
    employeeCount: headcountRows.length,
    headcountCount: headcountRows.length,
    activeEmployeeCount: headcountRows.filter((row) => row.status === 'active').length,
    inactiveEmployeeCount: headcountRows.filter((row) => row.status === 'inactive').length,
    leaveRequestCount: leaveRows.length,
    pendingVacationRequests: leaveRows.filter((row) => row.status === 'pending').length,
    approvedVacationRequests: leaveRows.filter((row) => row.status === 'approved').length,
    rejectedVacationRequests: leaveRows.filter((row) => row.status === 'rejected').length,
    onboardingCount: onboardingRows.length,
    pendingInviteCount: onboardingRows.filter((row) => row.inviteStatus === 'pending').length,
    acceptedInviteCount: onboardingRows.filter((row) => row.inviteStatus === 'accepted').length,
    expiredInviteCount: onboardingRows.filter((row) => row.inviteStatus === 'expired').length,
    contractExpiryCount: contractExpiryRows.length,
    remainingVacationDays: headcountRows.reduce((total, row) => total + Number(row.remainingVacationDays || 0), 0),
    payrollTotalsByCurrency: Array.from(payrollTotalsByCurrency.entries()).map(([currency, totalGrossSalary]) => ({
      currency,
      totalGrossSalary,
    })),
  };
}

function buildRoleBreakdown(headcountRows) {
  const roleBreakdown = headcountRows.reduce((acc, row) => {
    const existing = acc.get(row.role) || {
      role: row.role,
      label: row.roleLabel,
      count: 0,
    };

    existing.count += 1;
    acc.set(row.role, existing);
    return acc;
  }, new Map());

  return Array.from(roleBreakdown.values()).sort((a, b) => a.label.localeCompare(b.label));
}

async function getReports(companyId, { departmentId = null, role = 'all', from = null, to = null } = {}) {
  const normalizedDepartmentId = parseDepartmentFilter(departmentId);
  const normalizedRole = normalizeRoleFilter(role);
  const fromDate = parseDateFilter(from);
  const toDate = parseDateFilter(to);

  if (fromDate && toDate && fromDate > toDate) {
    const err = new Error('The from date must be before the to date');
    err.status = 400;
    throw err;
  }

  const { departments, employees, invitations, vacationRequests } = await loadReportingContext(companyId);

  const filters = {
    departmentId: normalizedDepartmentId,
    role: normalizedRole,
    from: fromDate,
    to: toDate,
  };

  const headcountRows = buildHeadcountRows(employees, filters);
  const leaveRows = buildLeaveRows(vacationRequests, filters);
  const onboardingRows = buildOnboardingRows(employees, invitations, filters);
  const contractExpiryRows = buildContractExpiryRows(employees, filters);

  const summary = buildSummary(headcountRows, leaveRows, onboardingRows, contractExpiryRows);

  return {
    filters: {
      departmentId: normalizedDepartmentId,
      role: normalizedRole,
      from: from || null,
      to: to || null,
    },
    departments,
    rows: headcountRows,
    headcountRows,
    leaveRows,
    onboardingRows,
    contractExpiryRows,
    summary: {
      ...summary,
      departmentCount: departments.length,
    },
    roleBreakdown: buildRoleBreakdown(headcountRows),
    reports: {
      headcount: headcountRows,
      leave: leaveRows,
      onboarding: onboardingRows,
      contractExpiry: contractExpiryRows,
    },
  };
}

async function exportReportCsv(companyId, reportType, filters = {}) {
  const config = REPORT_EXPORTS[reportType];
  if (!config) {
    const err = new Error('Unsupported report type');
    err.status = 400;
    throw err;
  }

  const reportData = await getReports(companyId, filters);
  const rows = reportData.reports?.[reportType] || [];
  const csv = buildCsv(config.columns, rows);

  return {
    filename: buildFilename(config.filenamePrefix),
    csv,
  };
}

module.exports = {
  getReports,
  exportReportCsv,
};
