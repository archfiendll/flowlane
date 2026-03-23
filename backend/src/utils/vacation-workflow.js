'use strict';

function getVacationWorkflowStatus(request) {
  if (request.status === 'PENDING' && request.approvedBy) {
    return 'PENDING_EMPLOYEE_CONFIRMATION';
  }

  if (request.status === 'PENDING') {
    return 'PENDING_ADMIN_APPROVAL';
  }

  return request.status;
}

function isPendingAdminApproval(request) {
  return getVacationWorkflowStatus(request) === 'PENDING_ADMIN_APPROVAL';
}

function isPendingEmployeeConfirmation(request) {
  return getVacationWorkflowStatus(request) === 'PENDING_EMPLOYEE_CONFIRMATION';
}

module.exports = {
  getVacationWorkflowStatus,
  isPendingAdminApproval,
  isPendingEmployeeConfirmation,
};
