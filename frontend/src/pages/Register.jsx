import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { setSession } = useVault();

  const [username, setUsername] = useState("");
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

    setLoading(true);
    try {
      await api.register(username, password);
      const user = await api.login(username, password);
      setSession(user);
      navigate("/setup-master");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Créer un compte Secure Agent</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Identifiant
          <input value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </label>
        <label>
          Mot de passe de connexion
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        <label>
          Confirmer le mot de passe
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Création en cours…" : "Créer mon compte"}
        </button>
      </form>
      <p className="auth-switch">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}