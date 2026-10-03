import { db } from "../db/connection.js";
import argon2 from "argon2";

export function getAdminStats(req, res) {
  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const entriesCount = db.prepare("SELECT COUNT(*) as count FROM vault_entries").get().count;
  const bannedCount = db.prepare("SELECT COUNT(*) as count FROM banned_ips").get().count;
  const tempBannedCount = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE temp_ban_until IS NOT NULL AND datetime(temp_ban_until) > datetime('now')")
    .get().count;
  const deactivatedCount = db
    .prepare("SELECT COUNT(*) as count FROM users WHERE is_deactivated = 1")
    .get().count;

  const regSetting = db
    .prepare("SELECT value FROM app_settings WHERE key = 'registrations_enabled'")
    .get();

  res.json({
    usersCount,
    entriesCount,
    bannedCount,
    tempBannedCount,
    deactivatedCount,
    registrationsEnabled: regSetting ? regSetting.value === "true" : true,
  });
}

export function listUsers(req, res) {
  const users = db
    .prepare(`
      SELECT 
        u.id, 
        u.username, 
        u.created_at, 
        u.last_login, 
        u.last_ip, 
        u.is_admin,
        u.is_banned,
        u.temp_ban_until,
        u.max_passwords,
        u.is_deactivated,
        u.deactivated_at,
        COUNT(e.id) as entries_count
      FROM users u
      LEFT JOIN vault_entries e ON u.id = e.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)
    .all();

  res.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.created_at,
      lastLogin: u.last_login || "Jamais",
      lastIp: u.last_ip || "Inconnue",
      isAdmin: !!u.is_admin,
      isBanned: !!u.is_banned,
      tempBanUntil: u.temp_ban_until,
      maxPasswords: u.max_passwords !== null && u.max_passwords !== undefined ? u.max_passwords : null,
      isDeactivated: !!u.is_deactivated,
      deactivatedAt: u.deactivated_at,
      entriesCount: u.entries_count || 0,
    }))
  );
}

// Bannissement définitif d'un compte utilisateur (et de son IP si demandée)
export function banUser(req, res) {
  const { userId, banIpAddress, reason } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Identifiant utilisateur requis." });
  }

  const user = db.prepare("SELECT id, username, last_ip FROM users WHERE id = ?").get(userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable." });
  }

  if (user.id === req.session.userId || user.is_admin) {
    return res.status(403).json({ error: "Impossible de bannir un compte Administrateur." });
  }

  db.prepare("UPDATE users SET is_banned = 1 WHERE id = ?").run(userId);

  // Bannit aussi son adresse IP dans la liste noire
  if (banIpAddress && user.last_ip && user.last_ip !== "127.0.0.1") {
    db.prepare(
      "INSERT OR REPLACE INTO banned_ips (ip, reason, created_at) VALUES (?, ?, datetime('now'))"
    ).run(user.last_ip, reason || `Compte ${user.username} banni`);
  }

  res.json({ status: "ok", message: `L'utilisateur ${user.username} a été banni définitivement.` });
}

// Débannissement d'un utilisateur
export function unbanUser(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Identifiant utilisateur requis." });

  db.prepare("UPDATE users SET is_banned = 0, temp_ban_until = NULL WHERE id = ?").run(userId);
  res.json({ status: "ok", message: "L'utilisateur a été débanni." });
}

// Exclusion temporaire (Timeout : 1h, 2h, 24h, 72h, etc.) — 0h = lever l'exclusion
export function tempBanUser(req, res) {
  const { userId, hours } = req.body;

  if (!userId || hours === undefined || hours === null || isNaN(hours)) {
    return res.status(400).json({ error: "Durée d'exclusion invalide (en heures)." });
  }

  const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  if (user.id === req.session.userId || user.is_admin) {
    return res.status(403).json({ error: "Impossible d'exclure un compte Administrateur." });
  }

  // Si hours = 0, on lève l'exclusion immédiatement
  if (Number(hours) <= 0) {
    db.prepare("UPDATE users SET temp_ban_until = NULL WHERE id = ?").run(userId);
    return res.json({
      status: "ok",
      message: `L'exclusion temporaire de ${user.username} a été levée.`,
    });
  }

  db.prepare(
    "UPDATE users SET temp_ban_until = datetime('now', '+' || ? || ' hours') WHERE id = ?"
  ).run(Number(hours), userId);

  res.json({
    status: "ok",
    message: `L'utilisateur ${user.username} est exclu temporairement pour une durée de ${hours} heure(s).`,
  });
}

// Définir le quota / limite de mots de passe
export function setUserPasswordLimit(req, res) {
  const { userId, maxPasswords } = req.body;

  if (!userId) return res.status(400).json({ error: "Identifiant utilisateur requis." });

  const limitVal = maxPasswords === null || maxPasswords === "" || isNaN(maxPasswords)
    ? null
    : Math.max(0, parseInt(maxPasswords, 10));

  db.prepare("UPDATE users SET max_passwords = ? WHERE id = ?").run(limitVal, userId);

  res.json({
    status: "ok",
    message: limitVal === null
      ? "Quota supprimé (mots de passe illimités)."
      : `Limite fixée à ${limitVal} mot(s) de passe.`,
    maxPasswords: limitVal,
  });
}

// Désactiver un compte (programmation suppression sous 10 jours)
export function deactivateUser(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Identifiant utilisateur requis." });

  const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  if (user.id === req.session.userId || user.is_admin) {
    return res.status(403).json({ error: "Impossible de désactiver un compte Administrateur." });
  }

  db.prepare("UPDATE users SET is_deactivated = 1, deactivated_at = datetime('now') WHERE id = ?").run(userId);

  res.json({
    status: "ok",
    message: `Le compte ${user.username} a été désactivé. Il sera purgé définitivement après 10 jours.`,
  });
}

// Réactiver un compte
export function reactivateUser(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Identifiant utilisateur requis." });

  db.prepare("UPDATE users SET is_deactivated = 0, deactivated_at = NULL WHERE id = ?").run(userId);
  res.json({ status: "ok", message: "Le compte a été réactivé avec succès." });
}

// Démolir le compte définitivement (suppression immédiate de l'utilisateur et de tout son coffre)
export function deleteUserPermanently(req, res) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Identifiant utilisateur requis." });

  const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  if (user.id === req.session.userId || user.is_admin) {
    return res.status(403).json({ error: "Impossible de supprimer un compte Administrateur." });
  }

  // Suppression en cascade
  db.prepare("DELETE FROM vault_entries WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM vault_keys WHERE user_id = ?").run(userId);
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);

  res.json({
    status: "ok",
    message: `Le compte ${user.username} et l'intégralité de ses données ont été définitivement démolis.`,
  });
}

// Gestion des IP bannies
export function listBannedIps(req, res) {
  const bans = db
    .prepare("SELECT ip, reason, created_at FROM banned_ips ORDER BY created_at DESC")
    .all();

  res.json(bans);
}

export function banIp(req, res) {
  const { ip, reason } = req.body;

  if (!ip || typeof ip !== "string") {
    return res.status(400).json({ error: "Adresse IP requise." });
  }

  db.prepare(
    "INSERT OR REPLACE INTO banned_ips (ip, reason, created_at) VALUES (?, ?, datetime('now'))"
  ).run(ip.trim(), reason?.trim() || "Banni par l'administrateur");

  res.json({ status: "ok", message: `L'adresse IP ${ip} a été bannie définitivement.` });
}

export function unbanIp(req, res) {
  const { ip } = req.body;

  if (!ip) {
    return res.status(400).json({ error: "Adresse IP requise." });
  }

  db.prepare("DELETE FROM banned_ips WHERE ip = ?").run(ip.trim());
  res.json({ status: "ok", message: `L'adresse IP ${ip} a été débannie.` });
}

export function toggleRegistrations(req, res) {
  const { enabled } = req.body;
  const val = enabled ? "true" : "false";

  db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('registrations_enabled', ?)").run(val);

  res.json({ registrationsEnabled: enabled });
}

// Statut du code PIN Admin (style iPhone)
export function getAdminPinStatus(req, res) {
  const pinSetting = db.prepare("SELECT value FROM app_settings WHERE key = 'admin_pin'").get();
  res.json({
    hasPin: !!(pinSetting && pinSetting.value),
    isUnlocked: !!req.session.adminPinUnlocked,
  });
}

// Configuration initiale du code PIN Admin (une seule fois)
export async function setupAdminPin(req, res) {
  const { pin } = req.body;
  const pinSetting = db.prepare("SELECT value FROM app_settings WHERE key = 'admin_pin'").get();

  if (pinSetting && pinSetting.value) {
    return res.status(400).json({ error: "Un code de sécurité Administrateur est déjà configuré." });
  }

  if (!pin || pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin)) {
    return res.status(400).json({ error: "Le code doit comporter entre 4 et 8 chiffres." });
  }

  const hash = await argon2.hash(pin, { type: argon2.argon2id });
  db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('admin_pin', ?)").run(hash);
  req.session.adminPinUnlocked = true;

  res.json({ status: "ok", message: "Code de sécurité configuré avec succès !" });
}

// Vérification du code PIN Admin (style iPhone)
export async function verifyAdminPin(req, res) {
  const { pin } = req.body;
  const pinSetting = db.prepare("SELECT value FROM app_settings WHERE key = 'admin_pin'").get();

  if (!pinSetting || !pinSetting.value) {
    req.session.adminPinUnlocked = true;
    return res.json({ status: "ok", message: "Aucun code configuré." });
  }

  if (!pin) {
    return res.status(400).json({ error: "Code requis." });
  }

  const valid = await argon2.verify(pinSetting.value, pin);
  if (!valid) {
    return res.status(401).json({ error: "Code d'accès incorrect." });
  }

  req.session.adminPinUnlocked = true;
  res.json({ status: "ok", message: "Console déverrouillée." });
}
