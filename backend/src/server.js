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

app.use(cors({ origin: true, credentials: true }));
app.use(checkBannedIp);
app.use(express.json());
app.use(sessionMiddleware);

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