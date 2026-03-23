export const VACATION_WORKFLOW_STATUS = {
  PENDING_ADMIN_APPROVAL: "PENDING_ADMIN_APPROVAL",
  PENDING_EMPLOYEE_CONFIRMATION: "PENDING_EMPLOYEE_CONFIRMATION",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export function getVacationStatusMeta(status) {
  if (status === VACATION_WORKFLOW_STATUS.APPROVED) {
    return { tone: "success", label: "Approved" };
  }
  if (status === VACATION_WORKFLOW_STATUS.REJECTED) {
    return { tone: "danger", label: "Rejected" };
  }
  if (status === VACATION_WORKFLOW_STATUS.PENDING_EMPLOYEE_CONFIRMATION) {
    return { tone: "warning", label: "Waiting employee" };
  }

  return { tone: "warning", label: "Waiting admin" };
}

export function isPendingAdminApproval(status) {
  return status === VACATION_WORKFLOW_STATUS.PENDING_ADMIN_APPROVAL;
}

export function isPendingEmployeeConfirmation(status) {
  return status === VACATION_WORKFLOW_STATUS.PENDING_EMPLOYEE_CONFIRMATION;
}

export function calculateVacationDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  return Math.floor((new Date(endDate) - new Date(startDate)) / 86400000) + 1;
}

export function formatVacationDate(value) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

