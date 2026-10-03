import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { decryptVaultKey } from "../crypto/vaultKey.js";

// Détecte si c'est l'application de bureau (pas un navigateur web)
function isDesktopApp() {
  return (
    navigator.userAgent.includes("VaulticDesktop") ||
    navigator.userAgent.includes("VaulticAdmin") ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, unlock } = useVault();

  // Détection du mode Administrateur (logiciel Vaultic-Admin.exe ou paramètre ?admin=1)
  const isAdminApp =
    navigator.userAgent.includes("VaulticAdmin") ||
    location.search.includes("admin") ||
    location.pathname.includes("admin");

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

      // Admin → console admin directement
      if (isAdminApp || user.isAdmin) {
        navigate("/admin");
        return;
      }

      // Sur navigateur web → proposer le téléchargement, pas le coffre
      if (!isDesktopApp()) {
        navigate("/download-app");
        return;
      }

      // Sur l'application de bureau → déverrouiller le coffre automatiquement si possible
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

      navigate("/unlock");
    } catch (err) {
      setError(err.message || "Identifiant ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>{isAdminApp ? "👑 Console d'Administration" : "Connexion à Vaultic"}</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        {isAdminApp
          ? "Accès réservé au Super-Administrateur de Vaultic."
          : "Entrez vos identifiants pour accéder à votre coffre."}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Identifiant {isAdminApp && "(Administrateur)"}
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
          {loading
            ? "Vérification…"
            : isAdminApp
            ? "Ouvrir la Console Admin"
            : "Se connecter"}
        </button>
      </form>

      <p className="auth-switch">
        Pas encore de compte ?{" "}
        <Link to="/register">
          {isAdminApp ? "Créer un compte Administrateur" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}