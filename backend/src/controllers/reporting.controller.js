const reportingService = require('../services/reporting.service');
const { sendSuccess } = require('../utils/response');

async function getReports(req, res) {
  const reports = await reportingService.getReports(req.companyId, {
    departmentId: req.query.departmentId,
    role: req.query.role,
    from: req.query.from,
    to: req.query.to,
  });

  return sendSuccess(res, reports);
}

async function exportReportCsv(req, res) {
  const { reportType } = req.params;
  const { departmentId, role, from, to } = req.query;

  const { filename, csv } = await reportingService.exportReportCsv(req.companyId, reportType, {
    departmentId,
    role,
    from,
    to,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(csv);
}

module.exports = { getReports, exportReportCsv };
