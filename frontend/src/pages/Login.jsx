import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { decryptVaultKey } from "../crypto/vaultKey.js";

export default function Login() {
  const navigate = useNavigate();
  const { setSession, unlock } = useVault();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await api.login(username, password);
      setSession(user);

      // Tente de déverrouiller directement le coffre avec le mot de passe saisi
      try {
        const status = await api.getVaultStatus();
        if (status.configured && status.unlockType === "password") {
          const masterKey = await deriveMasterKey(password, user.masterKeySalt);
          const { encryptedVaultKey, nonce } = await api.getVaultKey();
          const vaultKey = await decryptVaultKey(encryptedVaultKey, nonce, masterKey);
          unlock(vaultKey);
          navigate("/dashboard");
          return;
        }
      } catch (unlockErr) {
        console.warn("Déchiffrement auto en attente ou type PIN :", unlockErr);
      }

      // Si configuré avec PIN ou autre, passe par l'écran de déverrouillage dédié
      navigate("/unlock");
    } catch (err) {
      setError(err.message || "Identifiant ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Connexion à Vaultic</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Entrez vos identifiants pour ouvrir votre coffre-fort.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Identifiant / Pseudo
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Votre pseudo"
            autoFocus
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Votre mot de passe"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Connexion & déverrouillage…" : "Ouvrir mon coffre"}
        </button>
      </form>
      <p className="auth-switch">
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}