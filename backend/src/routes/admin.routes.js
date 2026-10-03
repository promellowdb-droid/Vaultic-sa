import { Router } from "express";
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
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

// Middleware de vérification des droits Administrateur
function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: "Accès refusé : réservé à l'administrateur de Vaultic." });
  }
  next();
}

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

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
