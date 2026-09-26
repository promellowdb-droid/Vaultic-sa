import { randomUUID } from "node:crypto";
import { db } from "../db/connection.js";

export function storeVaultKey(req, res) {
  const { encryptedVaultKey, nonce, unlockType } = req.body;
  const userId = req.session.userId;

  if (typeof encryptedVaultKey !== "string" || typeof nonce !== "string") {
    return res.status(400).json({ error: "Données de clé du coffre invalides." });
  }
  if (unlockType !== "pin" && unlockType !== "password") {
    return res.status(400).json({ error: "Type de déverrouillage invalide." });
  }

  const existing = db
    .prepare("SELECT user_id FROM vault_keys WHERE user_id = ?")
    .get(userId);

  if (existing) {
    return res.status(409).json({ error: "Une clé de coffre existe déjà pour ce compte." });
  }

  db.prepare(
    `INSERT INTO vault_keys (user_id, encrypted_vault_key, vault_key_nonce, unlock_type)
     VALUES (?, ?, ?, ?)`
  ).run(userId, encryptedVaultKey, nonce, unlockType);

  res.status(201).json({ status: "ok" });
}

export function getVaultKey(req, res) {
  const userId = req.session.userId;

  const row = db
    .prepare("SELECT encrypted_vault_key, vault_key_nonce FROM vault_keys WHERE user_id = ?")
    .get(userId);

  if (!row) {
    return res.status(404).json({ error: "Aucune clé de coffre trouvée pour ce compte." });
  }

  res.json({
    encryptedVaultKey: row.encrypted_vault_key,
    nonce: row.vault_key_nonce,
  });
}

export function getVaultStatus(req, res) {
  const userId = req.session.userId;

  const row = db
    .prepare("SELECT unlock_type FROM vault_keys WHERE user_id = ?")
    .get(userId);

  if (!row) {
    return res.json({ configured: false, unlockType: null });
  }

  res.json({ configured: true, unlockType: row.unlock_type });
}

export function createEntry(req, res) {
  const { encryptedData, nonce } = req.body;
  const userId = req.session.userId;

  if (typeof encryptedData !== "string" || typeof nonce !== "string") {
    return res.status(400).json({ error: "Données d'entrée invalides." });
  }

  const entryId = randomUUID();

  db.prepare(
    `INSERT INTO vault_entries (id, user_id, encrypted_data, entry_nonce)
     VALUES (?, ?, ?, ?)`
  ).run(entryId, userId, encryptedData, nonce);

  res.status(201).json({ id: entryId });
}

export function listEntries(req, res) {
  const userId = req.session.userId;

  const rows = db
    .prepare(
      `SELECT id, encrypted_data, entry_nonce, created_at, updated_at
       FROM vault_entries WHERE user_id = ? ORDER BY updated_at DESC`
    )
    .all(userId);

  res.json(
    rows.map((row) => ({
      id: row.id,
      encryptedData: row.encrypted_data,
      nonce: row.entry_nonce,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  );
}

export function updateEntry(req, res) {
  const { encryptedData, nonce } = req.body;
  const userId = req.session.userId;
  const entryId = req.params.id;

  if (typeof encryptedData !== "string" || typeof nonce !== "string") {
    return res.status(400).json({ error: "Données d'entrée invalides." });
  }

  const result = db
    .prepare(
      `UPDATE vault_entries
       SET encrypted_data = ?, entry_nonce = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    )
    .run(encryptedData, nonce, entryId, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Entrée introuvable." });
  }

  res.json({ status: "ok" });
}

export function deleteEntry(req, res) {
  const userId = req.session.userId;
  const entryId = req.params.id;

  const result = db
    .prepare("DELETE FROM vault_entries WHERE id = ? AND user_id = ?")
    .run(entryId, userId);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Entrée introuvable." });
  }

  res.json({ status: "ok" });
}