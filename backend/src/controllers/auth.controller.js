const { registerSchema, loginSchema } = require("../validators/auth.validators");
const authService = require("../services/auth.service");

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  const user = await authService.register(parsed.data);
  return res.status(201).json({ ok: true, user });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
  }

  const result = await authService.login(parsed.data);
  return res.json({ ok: true, ...result });
}

module.exports = { register, login };