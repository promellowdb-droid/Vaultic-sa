// Chiffrement/déchiffrement d'une entrée du coffre (nom, identifiant, mot de passe, URL)
// avec la clé du coffre, via AES-256-GCM.

async function importAesKey(rawKeyBytes) {
  return crypto.subtle.importKey(
    "raw",
    rawKeyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Chiffre une entrée du coffre.
 *
 * @param {{ name: string, username: string, password: string, url: string }} entry
 * @param {Uint8Array} vaultKeyBytes
 * @returns {Promise<{ encryptedData: string, nonce: string }>} prêt à envoyer au serveur
 */
export async function encryptEntry(entry, vaultKeyBytes) {
  const aesKey = await importAesKey(vaultKeyBytes);
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  const plaintext = new TextEncoder().encode(JSON.stringify(entry));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    plaintext
  );

  return {
    encryptedData: bytesToBase64(new Uint8Array(ciphertext)),
    nonce: bytesToBase64(nonce),
  };
}

/**
 * Déchiffre une entrée du coffre récupérée du serveur.
 *
 * @param {string} encryptedDataBase64
 * @param {string} nonceBase64
 * @param {Uint8Array} vaultKeyBytes
 * @returns {Promise<{ name: string, username: string, password: string, url: string }>}
 */
export async function decryptEntry(encryptedDataBase64, nonceBase64, vaultKeyBytes) {
  const aesKey = await importAesKey(vaultKeyBytes);
  const nonce = base64ToBytes(nonceBase64);
  const ciphertext = base64ToBytes(encryptedDataBase64);

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      ciphertext
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    throw new Error("Impossible de déchiffrer cette entrée.");
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