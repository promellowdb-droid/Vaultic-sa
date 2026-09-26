import { argon2id } from "hash-wasm";

// Paramètres validés à l'étape 1 — point de départ, ajustables après tests sur mobile
const ARGON2_PARAMS = {
  memorySize: 19456, // 19 Mo, en Ko
  iterations: 2,
  parallelism: 1,
  hashLength: 32,    // 256 bits, pour AES-256
};

/**
 * Dérive la clé maître à partir du mot de passe maître et du sel de l'utilisateur.
 * Ne quitte jamais le navigateur — aucun appel réseau ici.
 *
 * @param {string} masterPassword - saisi par l'utilisateur, jamais stocké
 * @param {string} saltBase64 - masterKeySalt renvoyé par le backend (register/login)
 * @returns {Promise<Uint8Array>} clé maître, 32 octets
 */
export async function deriveMasterKey(masterPassword, saltBase64) {
  if (!masterPassword || masterPassword.length < 8) {
    throw new Error("Le mot de passe maître doit contenir au moins 8 caractères.");
  }
  if (!saltBase64) {
    throw new Error("Sel de dérivation manquant.");
  }

  const salt = base64ToBytes(saltBase64);

  const hashHex = await argon2id({
    password: masterPassword,
    salt,
    memorySize: ARGON2_PARAMS.memorySize,
    iterations: ARGON2_PARAMS.iterations,
    parallelism: ARGON2_PARAMS.parallelism,
    hashLength: ARGON2_PARAMS.hashLength,
    outputType: "hex",
  });

  return hexToBytes(hashHex);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}