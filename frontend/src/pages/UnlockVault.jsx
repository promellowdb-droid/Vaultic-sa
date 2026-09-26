import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { decryptVaultKey } from "../crypto/vaultKey.js";
import PinPad from "../components/PinPad.jsx";
import { PIN_MIN_LENGTH } from "../constants/pin.js";

export default function UnlockVault() {
  const navigate = useNavigate();
  const { masterKeySalt, unlock } = useVault();

  const [unlockType, setUnlockType] = useState(null); // null = statut en cours de chargement
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getVaultStatus()
      .then((status) => {
        if (cancelled) return;
        if (!status.configured) {
          navigate("/setup-master", { replace: true });
          return;
        }
        setUnlockType(status.unlockType);
      })
      .catch((err) => setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function attemptUnlock(secret) {
    setError(null);
    setLoading(true);
    try {
      const masterKey = await deriveMasterKey(secret, masterKeySalt);
      const { encryptedVaultKey, nonce } = await api.getVaultKey();
      const vaultKey = await decryptVaultKey(encryptedVaultKey, nonce, masterKey);
      unlock(vaultKey);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    attemptUnlock(password);
  }

  if (unlockType === null) {
    return (
      <div className="auth-page">
        <p>Chargement…</p>
      </div>
    );
  }

  if (unlockType === "pin") {
    return (
      <div className="auth-page">
        <h1>Déverrouiller le coffre</h1>
        <PinPad minLength={PIN_MIN_LENGTH} onSubmit={attemptUnlock} disabled={loading} />
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h1>Déverrouiller le coffre</h1>
      <form onSubmit={handlePasswordSubmit}>
        <label>
          Mot de passe maître
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Déverrouillage…" : "Déverrouiller"}
        </button>
      </form>
    </div>
  );
}