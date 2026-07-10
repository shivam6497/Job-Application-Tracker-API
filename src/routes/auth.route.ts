import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import rateLimiter from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/register", rateLimiter, validate(registerSchema), register);
router.post("/login", rateLimiter, validate(loginSchema), login);
router.post("/logout", authMiddleware, logout);

export default router;