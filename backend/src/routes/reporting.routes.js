const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { requireTenant } = require('../middleware/tenant.middleware');
const asyncHandler = require('../utils/asyncHandler');
const reportingController = require('../controllers/reporting.controller');

const router = Router();

router.use(requireAuth, requireTenant, requireRole('admin'));

router.get('/', asyncHandler(reportingController.getReports));
router.get('/export/:reportType', asyncHandler(reportingController.exportReportCsv));

module.exports = router;
