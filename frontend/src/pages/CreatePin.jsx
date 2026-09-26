import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";
import { deriveMasterKey } from "../crypto/deriveKey.js";
import { generateVaultKey, encryptVaultKey } from "../crypto/vaultKey.js";
import PinPad from "../components/PinPad.jsx";
import { PIN_MIN_LENGTH, PIN_MAX_LENGTH } from "../constants/pin.js";

export default function CreatePin() {
  const navigate = useNavigate();
  const { masterKeySalt, unlock } = useVault();

  const [step, setStep] = useState("enter"); // "enter" | "confirm"
  const [firstPin, setFirstPin] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFirstSubmit(pin) {
    setFirstPin(pin);
    setStep("confirm");
    setError(null);
  }

  async function handleConfirmSubmit(pin) {
    if (pin !== firstPin) {
      setError("Les codes ne correspondent pas. Recommence.");
      setStep("enter");
      setFirstPin(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const masterKey = await deriveMasterKey(pin, masterKeySalt);
      const vaultKey = await generateVaultKey();
      const { encryptedVaultKey, nonce } = await encryptVaultKey(vaultKey, masterKey);

      await api.storeVaultKey(encryptedVaultKey, nonce, "pin");

      unlock(vaultKey);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      setStep("enter");
      setFirstPin(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Créer votre code maître</h1>
      {step === "enter" ? (
        <PinPad
          key="enter"
          minLength={PIN_MIN_LENGTH}
          maxLength={PIN_MAX_LENGTH}
          onSubmit={handleFirstSubmit}
          disabled={loading}
          label="Entrez votre code"
        />
      ) : (
        <PinPad
          key="confirm"
          minLength={PIN_MIN_LENGTH}
          maxLength={PIN_MAX_LENGTH}
          onSubmit={handleConfirmSubmit}
          disabled={loading}
          label="Confirmez votre code"
        />
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}