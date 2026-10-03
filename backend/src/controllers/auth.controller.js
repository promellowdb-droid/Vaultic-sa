import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { db } from "../db/connection.js";
import { generateSalt } from "../utils/crypto.js";

export async function register(req, res) {
  const { username, password } = req.body;
  const clientIp = req.clientIp || req.ip || "127.0.0.1";

  // Vérifie si les inscriptions sont ouvertes par l'admin
  const regSetting = db
    .prepare("SELECT value FROM app_settings WHERE key = 'registrations_enabled'")
    .get();

  if (regSetting && regSetting.value === "false") {
    return res.status(403).json({
      error: "Les créations de comptes sont actuellement suspendues par l'administrateur de Vaultic.",
    });
  }

  if (typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({ error: "Identifiant invalide (3 caractères minimum)." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Mot de passe trop court (8 caractères minimum)." });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);

  if (existing) {
    return res.status(409).json({ error: "Cet identifiant est déjà utilisé." });
  }

  // Si aucun compte administrateur n'existe, ou si l'inscription vient de l'application Admin, le compte devient Administrateur / Propriétaire !
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 1").get().count;
  const isFromAdminApp = req.headers["user-agent"]?.includes("VaulticAdmin");
  const isAdmin = (adminCount === 0 || isFromAdminApp) ? 1 : 0;

  const loginPasswordHash = await argon2.hash(password, { type: argon2.argon2id });
  const masterKeySalt = generateSalt();
  const userId = randomUUID();

  db.prepare(
    `INSERT INTO users (id, username, login_password_hash, master_key_salt, last_ip, is_admin, last_login)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(userId, username, loginPasswordHash, masterKeySalt, clientIp, isAdmin);

  req.session.userId = userId;
  req.session.isAdmin = !!isAdmin;

  res.status(201).json({
    id: userId,
    username,
    masterKeySalt,
    isAdmin: !!isAdmin,
  });
}

export async function login(req, res) {
  const { username, password } = req.body;
  const clientIp = req.clientIp || req.ip || "127.0.0.1";

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Identifiant et mot de passe requis." });
  }

  const user = db
    .prepare("SELECT id, username, login_password_hash, master_key_salt, is_admin, is_banned, temp_ban_until, is_deactivated, deactivated_at FROM users WHERE username = ?")
    .get(username);

  const genericError = { error: "Identifiant ou mot de passe incorrect." };

  if (!user) {
    return res.status(401).json(genericError);
  }

  const passwordValid = await argon2.verify(user.login_password_hash, password);
  if (!passwordValid) {
    return res.status(401).json(genericError);
  }

  // Vérification de bannissement définitif
  if (user.is_banned) {
    return res.status(403).json({ error: "Votre compte a été banni définitivement par l'administrateur." });
  }

  // Vérification d'exclusion temporaire
  if (user.temp_ban_until) {
    const untilDate = new Date(user.temp_ban_until);
    if (untilDate > new Date()) {
      return res.status(403).json({
        error: `Votre compte est temporairement suspendu jusqu'au ${untilDate.toLocaleString("fr-FR")}.`,
      });
    }
  }

  // Vérification de compte désactivé (purge 10 jours)
  if (user.is_deactivated) {
    return res.status(403).json({
      error: "Ce compte a été désactivé par l'administrateur. Il est programmé pour suppression définitive sous 10 jours.",
    });
  }

  // Droits admin
  const isAdmin = !!user.is_admin;

  // Mise à jour de la dernière IP et de l'heure de connexion
  try {
    db.prepare("UPDATE users SET last_ip = ?, last_login = datetime('now') WHERE id = ?")
      .run(clientIp, user.id);
  } catch {}

  req.session.userId = user.id;
  req.session.isAdmin = isAdmin;

  res.json({
    id: user.id,
    username: user.username,
    masterKeySalt: user.master_key_salt,
    isAdmin,
  });
}

export function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ status: "ok" });
  });
}