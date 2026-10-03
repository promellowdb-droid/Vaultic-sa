import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { decryptVaultKey } from "../crypto/vaultKey.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, unlock } = useVault();

  // Détection du mode Administrateur (logiciel Vaultic-Admin.exe ou paramètre ?admin=1)
  const isAdminApp =
    navigator.userAgent.includes("VaulticAdmin") ||
    location.search.includes("admin") ||
    location.pathname.includes("admin");

  const [username, setUsername] = useState(isAdminApp ? "CSAVETY1" : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminApp && !username) {
      setUsername("CSAVETY1");
    }
  }, [isAdminApp, username]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await api.login(username, password);
      setSession(user);

      // Si connexion depuis le logiciel Admin ou avec le compte CSAVETY1/admin, redirection immédiate vers la console Admin
      if (isAdminApp || user.isAdmin || username.toUpperCase() === "CSAVETY1") {
        navigate("/admin");
        return;
      }

      // Pour les utilisateurs publics normaux : tente de déverrouiller directement le coffre
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
          : "Entrez vos identifiants pour ouvrir votre coffre-fort."}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Identifiant {isAdminApp && "(Super-Admin)"}
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Votre pseudo"
            autoFocus={!isAdminApp}
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
            autoFocus={isAdminApp}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading
            ? "Vérification…"
            : isAdminApp
            ? "Ouvrir la Console Admin"
            : "Ouvrir mon coffre"}
        </button>
      </form>

      {!isAdminApp && (
        <p className="auth-switch">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      )}
    </div>
  );
}