import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { generateVaultKey, encryptVaultKey } from "../crypto/vaultKey.js";

function isDesktopApp() {
  return (
    navigator.userAgent.includes("VaulticDesktop") ||
    navigator.userAgent.includes("VaulticAdmin") ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { setSession, unlock } = useVault();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      // 1. Inscription
      await api.register(username, password);
      // 2. Connexion
      const user = await api.login(username, password);
      setSession(user);

      // 3. Initialisation transparente et immédiate du coffre
      const masterKey = await deriveMasterKey(password, user.masterKeySalt);
      const vaultKey = await generateVaultKey();
      const { encryptedVaultKey, nonce } = await encryptVaultKey(vaultKey, masterKey);
      await api.storeVaultKey(encryptedVaultKey, nonce, "password");

      // Sur navigateur web → proposer le téléchargement plutôt que le coffre
      if (!isDesktopApp()) {
        navigate("/download-app");
        return;
      }

      // Sur l'application de bureau → déverrouiller directement
      unlock(vaultKey);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Créer un compte Vaultic</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Choisissez un pseudo et un mot de passe sécurisé pour protéger votre compte.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Identifiant / Pseudo
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            placeholder="Ex: alexandre"
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
            minLength={8}
            placeholder="Minimum 8 caractères"
          />
        </label>
        <label>
          Confirmer le mot de passe
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            placeholder="Répétez le mot de passe"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Création du compte…" : "Créer mon compte"}
        </button>
      </form>
      <p className="auth-switch">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}