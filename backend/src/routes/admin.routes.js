import { Router } from "express";
import { db } from "../db/connection.js";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import {
  getAdminStats,
  listUsers,
  listBannedIps,
  banIp,
  unbanIp,
  toggleRegistrations,
  banUser,
  unbanUser,
  tempBanUser,
  setUserPasswordLimit,
  deactivateUser,
  reactivateUser,
  deleteUserPermanently,
  getAdminPinStatus,
  setupAdminPin,
  verifyAdminPin,
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

// Middleware 1 : Vérification des droits Administrateur
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Accès refusé : réservé à l'administrateur de Vaultic." });
  }
  next();
}

// Middleware 2 : Vérification du Code PIN Admin (style iPhone)
function requireAdminPin(req, res, next) {
  const pinSetting = db.prepare("SELECT value FROM app_settings WHERE key = 'admin_pin'").get();
  if (pinSetting && pinSetting.value && !req.session.adminPinUnlocked) {
    return res.status(401).json({ error: "Code de sécurité Admin requis." });
  }
  next();
}

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// Routes de contrôle du code PIN (accessibles avant déverrouillage du PIN)
adminRouter.get("/pin-status", getAdminPinStatus);
adminRouter.post("/setup-pin", setupAdminPin);
adminRouter.post("/verify-pin", verifyAdminPin);

// Toutes les autres routes requièrent le code PIN déverrouillé
adminRouter.use(requireAdminPin);

adminRouter.get("/stats", getAdminStats);
adminRouter.get("/users", listUsers);
adminRouter.get("/banned-ips", listBannedIps);
adminRouter.post("/ban-ip", banIp);
adminRouter.post("/unban-ip", unbanIp);
adminRouter.post("/toggle-registrations", toggleRegistrations);

// Nouvelles actions de gestion avancée des utilisateurs
adminRouter.post("/users/ban", banUser);
adminRouter.post("/users/unban", unbanUser);
adminRouter.post("/users/temp-ban", tempBanUser);
adminRouter.post("/users/limit-passwords", setUserPasswordLimit);
adminRouter.post("/users/deactivate", deactivateUser);
adminRouter.post("/users/reactivate", reactivateUser);
adminRouter.post("/users/delete", deleteUserPermanently);
