const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/register', (req, res, next) => authController.register(req, res).catch(next));

router.post('/login', (req, res, next) => authController.login(req, res).catch(next));

router.get('/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

module.exports = router;
