import session from "express-session";
import { env } from "../config/env.js";

export const sessionMiddleware = session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.isProduction,   // cookie envoyé en HTTPS uniquement en production
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 4, // 4 heures
  },
});