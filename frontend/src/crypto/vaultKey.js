// Chiffrement/déchiffrement de la clé du coffre avec la clé maître,
// via l'API Web Crypto native du navigateur (AES-256-GCM).

/**
 * Génère une nouvelle clé de coffre aléatoire (256 bits).
 * Utilisée une seule fois, à la création du compte.
 */
export async function generateVaultKey() {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Importe la clé maître (bytes bruts) comme clé AES-GCM utilisable par Web Crypto.
 */
async function importAesKey(rawKeyBytes) {
  return crypto.subtle.importKey(
    "raw",
    rawKeyBytes,
    { name: "AES-GCM" },
    false, // non-exportable, reste en mémoire uniquement
    ["encrypt", "decrypt"]
  );
}

/**
 * Chiffre la clé du coffre avec la clé maître.
 * Résultat destiné à être envoyé au serveur (le serveur ne peut pas le déchiffrer).
 *
 * @param {Uint8Array} vaultKeyBytes
 * @param {Uint8Array} masterKeyBytes
 * @returns {Promise<{ encryptedVaultKey: string, nonce: string }>} valeurs en base64
 */
export async function encryptVaultKey(vaultKeyBytes, masterKeyBytes) {
  const aesKey = await importAesKey(masterKeyBytes);
  const nonce = crypto.getRandomValues(new Uint8Array(12)); // nonce unique, 96 bits, standard pour AES-GCM

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    vaultKeyBytes
  );

  return {
    encryptedVaultKey: bytesToBase64(new Uint8Array(ciphertext)),
    nonce: bytesToBase64(nonce),
  };
}

/**
 * Déchiffre la clé du coffre récupérée du serveur, avec la clé maître.
 *
 * @param {string} encryptedVaultKeyBase64
 * @param {string} nonceBase64
 * @param {Uint8Array} masterKeyBytes
 * @returns {Promise<Uint8Array>} clé du coffre en clair, 32 octets
 */
export async function decryptVaultKey(encryptedVaultKeyBase64, nonceBase64, masterKeyBytes) {
  const aesKey = await importAesKey(masterKeyBytes);
  const nonce = base64ToBytes(nonceBase64);
  const ciphertext = base64ToBytes(encryptedVaultKeyBase64);

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      ciphertext
    );
    return new Uint8Array(plaintext);
  } catch {
    // AES-GCM échoue si la clé est fausse (mauvais mot de passe maître) ou si les
    // données ont été altérées — les deux cas remontent la même erreur volontairement.
    throw new Error("Impossible de déchiffrer le coffre. Mot de passe maître incorrect ?");
  }
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}