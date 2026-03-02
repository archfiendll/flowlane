const router = require("express").Router();
const authController = require("../controllers/auth.controller");

// POST /auth/register
router.post("/register", (req, res, next) =>
  authController.register(req, res).catch(next)
);

// POST /auth/login
router.post("/login", (req, res, next) =>
  authController.login(req, res).catch(next)
);

module.exports = router;