import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { loginLimiter } from "../middleware/rateLimit.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", loginLimiter, login);
authRouter.post("/logout", logout);