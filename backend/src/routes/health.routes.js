const router = require('express').Router();
const prisma = require('../config/prisma');

// Liveness: app is up (no DB)
router.get('/live', (req, res) => {
  res.json({ ok: true, service: 'flowlane-backend' });
});

// Readiness: DB is reachable
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'disconnected', error: err.message });
  }
});

module.exports = router;
