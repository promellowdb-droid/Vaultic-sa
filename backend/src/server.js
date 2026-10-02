import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import "./db/connection.js";
import { checkBannedIp } from "./middleware/checkBannedIp.middleware.js";
import { sessionMiddleware } from "./middleware/session.middleware.js";
import { requireAuth } from "./middleware/requireAuth.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { vaultRouter } from "./routes/vault.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.join(__dirname, "../../frontend/dist");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// En-têtes de sécurité (OWASP, HSTS, élimination des fausses alertes antivirus)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(checkBannedIp);
app.use(express.json());
app.use(sessionMiddleware);

// Route de téléchargement direct du logiciel Windows (.exe)
app.get("/download/windows", (req, res) => {
  res.redirect(
    302,
    "https://github.com/promellowdb-droid/Vaultic-sa/releases/download/v1.0.0/Vaultic.exe"
  );
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Vaultic", ip: req.clientIp });
});
app.use("/api/auth", authRouter);
app.use("/api/vault", vaultRouter);
app.use("/api/admin", adminRouter);
app.get("/api/whoami", requireAuth, (req, res) => {
  res.json({ userId: req.session.userId, isAdmin: !!req.session.isAdmin });
});

// Sert le frontend buildé (React) pour tout le reste
app.use(express.static(FRONTEND_DIST));
app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"));
});

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Vaultic démarré sur http://localhost:${env.port}`);
});