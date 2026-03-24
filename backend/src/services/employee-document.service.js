'use strict';

const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const prisma = require('../config/prisma');

const TEMPLATE_DIRECTORY = path.join(__dirname, '../../templates/documents');

const DOCUMENT_TEMPLATES = [
  {
    key: 'employment-contract',
    label: 'Employment Contract',
    filename: 'cim-template.docx',
  },
  {
    key: 'job-description-assistant-manager',
    label: 'Job Description - Assistant Manager',
    filename: 'job-description-assistant-manager-template.docx',
  },
  {
    key: 'information-minute',
    label: 'Information Minute',
    filename: 'information-minute-template.docx',
  },
  {
    key: 'employment-request',
    label: 'Employment Request',
    filename: 'employment-request-template.docx',
  },
  {
    key: 'gdpr-consent',
    label: 'GDPR Consent',
    filename: 'gdpr-consent-template.docx',
  },
  {
    key: 'health-insurance-declaration',
    label: 'Health Insurance Declaration',
    filename: 'health-insurance-declaration-template.docx',
  },
];

function getDocumentTemplates() {
  return DOCUMENT_TEMPLATES.map(({ key, label }) => ({ key, label }));
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatMoney(value, currency) {
  if (value === null || value === undefined || value === '') return '';
  return `${value} ${currency || ''}`.trim();
}

function buildFullAddress(employee) {
  return [
    employee.address,
    employee.city,
    employee.region,
    employee.country,
    employee.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
}

function buildCompanyFullAddress(company) {
  return [
    company.legalAddress,
    company.city,
    company.profileRO?.county,
    company.country,
  ]
    .filter(Boolean)
    .join(', ');
}

function getHoursPerWeek(employee) {
  if (employee.workingHours === 'PARTIAL') {
    return employee.partialHours ? String(employee.partialHours) : '';
  }

  return '40';
}

function getHoursPerDay(employee) {
  if (employee.workingHours === 'PARTIAL') {
    return employee.partialHours ? String(Number(employee.partialHours) / 5) : '';
  }

  return '8';
}

function getWorkScheduleSentencePrefix(employee) {
  if (employee.workingHours === 'PARTIAL') {
    return 'Programul de lucru cu timp partial este de';
  }

  return 'Programul de lucru este de';
}

function getPartTimeClause(employee) {
  if (employee.workingHours !== 'PARTIAL') return '';

  const weeklyHours = getHoursPerWeek(employee);
  const dailyHours = getHoursPerDay(employee);
  return `Contractul este cu timp partial, ${weeklyHours} ore pe saptamana, respectiv ${dailyHours} ore pe zi.`;
}

function sanitizeFilenamePart(value) {
  return String(value || 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildTemplateData(employee, company) {
  const profileRO = employee.profileRO || {};
  const companyProfileRO = company.profileRO || {};

  return {
    'CIM NUMBER': employee.contractNumber || '',
    'COMPANY ADDRESS': company.legalAddress || '',
    'COMPANY BANK': company.bankName || '',
    'COMPANY CAEN CODE': companyProfileRO.caenCode || '',
    'COMPANY CITY': company.city || '',
    'COMPANY COUNTRY': company.country || '',
    'COMPANY COUNTY': companyProfileRO.county || '',
    'COMPANY CUI': companyProfileRO.cui || '',
    'COMPANY EMAIL': company.email || '',
    'COMPANY FULL ADDRESS': buildCompanyFullAddress(company),
    'COMPANY IBAN': company.iban || '',
    'COMPANY LEGAL REPRESENTATIVE NAME': company.legalRepName || '',
    'COMPANY LEGAL REPRESENTATIVE TITLE': company.legalRepTitle || '',
    'COMPANY NAME': company.name || '',
    'COMPANY SLUG': company.slug || '',
    'COMPANY TRADE REGISTER': companyProfileRO.tradeRegister || '',
    'COMPANY VAT PAYER': companyProfileRO.vatPayer ? 'Da' : 'Nu',
    'CONTRACT DATE': formatDate(employee.contractDate),
    'EMPLOYEE COR CODE': profileRO.corCode || '',
    'EMPLOYEE CNP': profileRO.cnp || '',
    'EMPLOYEE FULL ADDRESS': buildFullAddress(employee),
    'EMPLOYEE FULL NAME': [employee.firstName, employee.lastName].filter(Boolean).join(' '),
    'EMPLOYEE GROSS SALARY': formatMoney(employee.grossSalary, employee.currency),
    'EMPLOYEE ID CARD CNP': profileRO.cnp || '',
    'EMPLOYEE ID CARD ISSUE DATE': formatDate(profileRO.ciIssuedAt),
    'EMPLOYEE ID CARD ISSUER': profileRO.ciIssuedBy || '',
    'EMPLOYEE ID CARD NUMBER': profileRO.ciNumber || '',
    'EMPLOYEE ID CARD SERIES': profileRO.ciSeries || '',
    'EMPLOYEE ID NUMBER': profileRO.ciNumber || '',
    'EMPLOYEE ID SERIES': profileRO.ciSeries || '',
    'EMPLOYEE JOB TITLE': employee.jobTitle || '',
    'EMPLOYEE WORKING HOURS/WEEK': getHoursPerWeek(employee),
    'EMPLOYEE WORKPLACE': employee.workLocation || '',
    'HOURS_PER_DAY': getHoursPerDay(employee),
    'PART_TIME_CLAUSE': getPartTimeClause(employee),
    'SIGN DATE': formatDate(new Date()),
    'START DATE': formatDate(employee.startDate),
    'WORK_SCHEDULE_SENTENCE_PREFIX': getWorkScheduleSentencePrefix(employee),
  };
}

async function generateEmployeeDocument(companyId, employeeId, templateKey) {
  const template = DOCUMENT_TEMPLATES.find((item) => item.key === templateKey);

  if (!template) {
    const err = new Error('Document template not found');
    err.status = 404;
    throw err;
  }

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
    include: {
      company: {
        include: {
          profileRO: true,
        },
      },
      profileRO: true,
    },
  });

  if (!employee) {
    const err = new Error('Employee not found');
    err.status = 404;
    throw err;
  }

  const templatePath = path.join(TEMPLATE_DIRECTORY, template.filename);
  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);

  const doc = new Docxtemplater(zip, {
    delimiters: { start: '{{', end: '}}' },
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(buildTemplateData(employee, employee.company));

  const buffer = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return {
    buffer,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filename: `${sanitizeFilenamePart(template.key)}-${sanitizeFilenamePart(employee.firstName)}-${sanitizeFilenamePart(employee.lastName)}.docx`,
  };
}

module.exports = {
  generateEmployeeDocument,
  getDocumentTemplates,
};
