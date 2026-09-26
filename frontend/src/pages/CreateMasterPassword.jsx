import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { generateVaultKey, encryptVaultKey } from "../crypto/vaultKey.js";

export default function CreateMasterPassword() {
  const navigate = useNavigate();
  const { masterKeySalt, unlock } = useVault();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe maître doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    try {
      const masterKey = await deriveMasterKey(password, masterKeySalt);
      const vaultKey = await generateVaultKey();
      const { encryptedVaultKey, nonce } = await encryptVaultKey(vaultKey, masterKey);

      await api.storeVaultKey(encryptedVaultKey, nonce, "password");

      unlock(vaultKey);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Créer votre mot de passe maître</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoFocus />
        </label>
        <label>
          Confirmer le mot de passe
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Création…" : "Créer le mot de passe maître"}
        </button>
      </form>
    </div>
  );
}