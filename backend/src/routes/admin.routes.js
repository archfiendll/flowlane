const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.get('/ping', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ ok: true, message: 'admin access granted', user: req.user });
});

module.exports = router;
