import { randomBytes } from "node:crypto";

// Génère un sel aléatoire cryptographiquement sûr, encodé en base64
export function generateSalt(byteLength = 16) {
  return randomBytes(byteLength).toString("base64");
}