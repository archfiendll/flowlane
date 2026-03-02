const { z } = require("zod");

const passwordPolicy = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(72, "Password must be at most 72 characters")
  .refine((v) => /[a-z]/.test(v), "Password must include at least 1 lowercase letter")
  .refine((v) => /[A-Z]/.test(v), "Password must include at least 1 uppercase letter")
  .refine((v) => /[0-9]/.test(v), "Password must include at least 1 number")
  .refine((v) => /[^A-Za-z0-9]/.test(v), "Password must include at least 1 special character");

const registerSchema = z.object({
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: passwordPolicy,
  role: z.string().min(2).max(50).optional(), // keep for now (later: lock to enum)
});

const loginSchema = z.object({
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };