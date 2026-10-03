import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../secure-agent.db");
const schemaPath = path.join(__dirname, "schema.sql");

export const db = new DatabaseSync(dbPath);

// Applique le schéma de base
const schema = readFileSync(schemaPath, "utf-8");
db.exec(schema);

// Migrations automatiques pour les colonnes et tables Admin / IP
try {
  db.exec("ALTER TABLE users ADD COLUMN last_ip TEXT");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN last_login TEXT");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN temp_ban_until TEXT");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN max_passwords INTEGER DEFAULT NULL");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN is_deactivated INTEGER DEFAULT 0");
} catch {}

try {
  db.exec("ALTER TABLE users ADD COLUMN deactivated_at TEXT");
} catch {}

// S'assure que le compte spécial CSAVETY1 a toujours les droits Administrateur
try {
  db.exec("UPDATE users SET is_admin = 1 WHERE UPPER(username) = 'CSAVETY1'");
} catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS banned_ips (
    ip TEXT PRIMARY KEY,
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO app_settings (key, value) VALUES ('registrations_enabled', 'true');

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Suppression de l'avis de test demandé
try {
  db.exec("DELETE FROM reviews WHERE id = 1");
} catch {}

console.log("Base de données initialisée avec support Admin, IP et Avis :", dbPath);