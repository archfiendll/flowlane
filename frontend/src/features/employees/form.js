export const STEPS = ["Personal", "Address", "Employment", "Vacation"];

export const EMPTY_EMPLOYEE_FORM = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  nationality: "",
  citizenship: "",
  studies: "",
  phone: "",
  personalEmail: "",
  address: "",
  city: "",
  region: "",
  country: "",
  postalCode: "",
  departmentId: "",
  jobTitle: "",
  workLocation: "",
  startDate: "",
  contractType: "PERMANENT",
  contractEndDate: "",
  contractNumber: "",
  contractDate: "",
  workingHours: "FULL",
  partialHours: "",
  probationDays: "",
  grossSalary: "",
  currency: "RON",
  vacationDaysPerYear: 20,
};

export const STEP_FIELDS = {
  0: ["firstName", "lastName", "personalEmail"],
  1: [],
  2: ["jobTitle", "startDate", "contractNumber", "contractDate", "grossSalary"],
  3: ["vacationDaysPerYear"],
};

export function toInputDate(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function mapEmployeeToForm(employee) {
  return {
    firstName: employee.firstName ?? "",
    lastName: employee.lastName ?? "",
    dateOfBirth: toInputDate(employee.dateOfBirth),
    placeOfBirth: employee.placeOfBirth ?? "",
    nationality: employee.nationality ?? "",
    citizenship: employee.citizenship ?? "",
    studies: employee.studies ?? "",
    phone: employee.phone ?? "",
    personalEmail: employee.personalEmail ?? "",
    address: employee.address ?? "",
    city: employee.city ?? "",
    region: employee.region ?? "",
    country: employee.country ?? "",
    postalCode: employee.postalCode ?? "",
    departmentId: employee.departmentId ? String(employee.departmentId) : "",
    jobTitle: employee.jobTitle ?? "",
    workLocation: employee.workLocation ?? "",
    startDate: toInputDate(employee.startDate),
    contractType: employee.contractType ?? "PERMANENT",
    contractEndDate: toInputDate(employee.contractEndDate),
    contractNumber: employee.contractNumber ?? "",
    contractDate: toInputDate(employee.contractDate),
    workingHours: employee.workingHours ?? "FULL",
    partialHours: employee.partialHours ?? "",
    probationDays: employee.probationDays ?? "",
    grossSalary: employee.grossSalary ?? "",
    currency: employee.currency ?? "RON",
    vacationDaysPerYear: employee.vacationDaysPerYear ?? 20,
  };
}

export function buildEmployeePayload(form) {
  const toDate = (value) => (value ? new Date(value).toISOString() : null);

  return {
    ...form,
    departmentId: form.departmentId ? parseInt(form.departmentId, 10) : null,
    dateOfBirth: toDate(form.dateOfBirth),
    startDate: toDate(form.startDate),
    contractDate: toDate(form.contractDate),
    contractEndDate: toDate(form.contractEndDate),
    probationDays: form.probationDays ? parseInt(form.probationDays, 10) : null,
    grossSalary: parseFloat(form.grossSalary),
    vacationDaysPerYear: parseInt(form.vacationDaysPerYear, 10),
    partialHours: form.partialHours ? parseFloat(form.partialHours) : null,
  };
}

export function validateEmployeeForm(form) {
  const errors = {};

  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim()) errors.lastName = "Last name is required.";
  if (form.personalEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail)) {
    errors.personalEmail = "Enter a valid email address.";
  }
  if (!form.jobTitle.trim()) errors.jobTitle = "Job title is required.";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.contractNumber.trim()) errors.contractNumber = "Contract number is required.";
  if (!form.contractDate) errors.contractDate = "Contract date is required.";
  if (!form.grossSalary || Number(form.grossSalary) <= 0) {
    errors.grossSalary = "Gross salary must be greater than 0.";
  }
  if (!form.vacationDaysPerYear || Number(form.vacationDaysPerYear) <= 0) {
    errors.vacationDaysPerYear = "Vacation days must be greater than 0.";
  }
  if (form.contractType === "FIXED_TERM" && !form.contractEndDate) {
    errors.contractEndDate = "Contract end date is required for fixed-term contracts.";
  }
  if (form.workingHours === "PARTIAL" && (!form.partialHours || Number(form.partialHours) <= 0)) {
    errors.partialHours = "Partial hours must be greater than 0.";
  }

  return errors;
}

