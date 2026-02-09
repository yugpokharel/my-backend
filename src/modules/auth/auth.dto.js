import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6),
  fullName: z.string().trim().optional(),
  username: z.string().trim().min(3).optional(),
  phoneNumber: z.string().trim().min(7).optional()
});

const loginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(6)
});

export { registerSchema, loginSchema };
