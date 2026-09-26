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
`);

console.log("Base de données initialisée avec support Admin & IP :", dbPath);