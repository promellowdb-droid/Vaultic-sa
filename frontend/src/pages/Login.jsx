import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setSession } = useVault();

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
      navigate("/unlock");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Connexion à Secure Agent</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Identifiant
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="auth-switch">
        Pas encore de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}