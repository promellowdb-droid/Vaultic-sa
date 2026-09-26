import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 tentatives max par IP sur cette fenêtre
  message: { error: "Trop de tentatives de connexion. Réessaie plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});