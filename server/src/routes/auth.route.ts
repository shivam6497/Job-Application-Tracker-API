import { Router } from "express";
import { register, login, logout, refreshToken } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import rateLimiter from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post(
  "/register",
  rateLimiter({ maxRequests: 10, windowMs: 60}),
  validate(registerSchema),
  register,
);
router.post(
  "/login",
  rateLimiter({ maxRequests: 10, windowMs: 60 }),
  validate(loginSchema),
  login,
);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);

export default router;
