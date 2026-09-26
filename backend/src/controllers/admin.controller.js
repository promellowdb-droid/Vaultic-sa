import { db } from "../db/connection.js";

export function getAdminStats(req, res) {
  const usersCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const entriesCount = db.prepare("SELECT COUNT(*) as count FROM vault_entries").get().count;
  const bannedCount = db.prepare("SELECT COUNT(*) as count FROM banned_ips").get().count;

  const regSetting = db
    .prepare("SELECT value FROM app_settings WHERE key = 'registrations_enabled'")
    .get();

  res.json({
    usersCount,
    entriesCount,
    bannedCount,
    registrationsEnabled: regSetting ? regSetting.value === "true" : true,
  });
}

export function listUsers(req, res) {
  const users = db
    .prepare("SELECT id, username, created_at, last_ip, is_admin FROM users ORDER BY created_at DESC")
    .all();

  res.json(
    users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.created_at,
      lastIp: u.last_ip || "Inconnue",
      isAdmin: !!u.is_admin,
    }))
  );
}

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
