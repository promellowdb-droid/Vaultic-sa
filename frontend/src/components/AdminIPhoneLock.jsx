import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client.js";

const PIN_LENGTH = 6;

const KEYPAD = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "A B C" },
  { digit: "3", letters: "D E F" },
  { digit: "4", letters: "G H I" },
  { digit: "5", letters: "J K L" },
  { digit: "6", letters: "M N O" },
  { digit: "7", letters: "P Q R S" },
  { digit: "8", letters: "T U V" },
  { digit: "9", letters: "W X Y Z" },
  { digit: "", letters: "" },
  { digit: "0", letters: "" },
  { digit: "backspace", letters: "Effacer" },
];

export default function AdminIPhoneLock({ hasPin, onUnlocked }) {
  // Mode : "unlock" (saisie normale) ou "create_step1" (création) ou "create_step2" (confirmation)
  const [mode, setMode] = useState(hasPin ? "unlock" : "create_step1");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const triggerError = useCallback((msg) => {
    setErrorMsg(msg);
    setShake(true);
    setPin("");
    setTimeout(() => {
      setShake(false);
    }, 500);
  }, []);

  const handleComplete = useCallback(async (codeToProcess) => {
    if (loading) return;
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "unlock") {
        // Vérification du code existant
        await api.verifyAdminPin(codeToProcess);
        onUnlocked();
      } else if (mode === "create_step1") {
        // Enregistre le premier code et passe à la confirmation
        setFirstPin(codeToProcess);
        setPin("");
        setMode("create_step2");
        setLoading(false);
      } else if (mode === "create_step2") {
        // Vérifie que les deux codes correspondent
        if (codeToProcess !== firstPin) {
          triggerError("Les codes ne correspondent pas. Recommencez.");
          setMode("create_step1");
          setFirstPin("");
          setLoading(false);
          return;
        }

        // Enregistre le nouveau code PIN sur le serveur
        await api.setupAdminPin(codeToProcess);
        onUnlocked();
      }
    } catch (err) {
      triggerError(err.message || "Code incorrect.");
      setLoading(false);
    }
  }, [loading, mode, firstPin, onUnlocked, triggerError]);

  const addDigit = useCallback((d) => {
    if (loading) return;
    setPin((prev) => {
      if (prev.length >= PIN_LENGTH) return prev;
      const next = prev + d;
      if (next.length === PIN_LENGTH) {
        setTimeout(() => handleComplete(next), 80);
      }
      return next;
    });
  }, [loading, handleComplete]);

  const removeDigit = useCallback(() => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg("");
  }, [loading]);

  // Support clavier physique
  useEffect(() => {
    function handleKeyDown(e) {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        addDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        removeDigit();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addDigit, removeDigit]);

  return (
    <div className="ios-lock-backdrop">
      <div className={`ios-lock-container ${shake ? "ios-shake" : ""}`}>
        
        {/* Cadenas style iOS */}
        <div className="ios-lock-icon">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Titre & consigne */}
        <h2 className="ios-lock-title">
          {mode === "unlock" && "Saisissez le code"}
          {mode === "create_step1" && "Créer votre code Admin"}
          {mode === "create_step2" && "Confirmez le code"}
        </h2>

        <p className="ios-lock-sub">
          {mode === "unlock" && "Accès sécurisé à la Console Administrateur"}
          {mode === "create_step1" && "Choisissez un code à 6 chiffres pour protéger le panel"}
          {mode === "create_step2" && "Saisissez à nouveau votre code pour le mémoriser"}
        </p>

        {/* Points indicateurs iOS (● ● ● ● ● ●) */}
        <div className="ios-dots-row">
          {Array.from({ length: PIN_LENGTH }).map((_, idx) => (
            <div
              key={idx}
              className={`ios-dot ${idx < pin.length ? "filled" : ""} ${errorMsg ? "error" : ""}`}
            />
          ))}
        </div>

        {/* Message d'erreur */}
        {errorMsg && <p className="ios-error-text">{errorMsg}</p>}

        {/* Clavier numérique circulaire iOS */}
        <div className="ios-keypad">
          {KEYPAD.map((item, i) => {
            if (item.digit === "") {
              return <div key={i} className="ios-key-empty" />;
            }

            if (item.digit === "backspace") {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={removeDigit}
                  className="ios-key-text"
                  disabled={loading || pin.length === 0}
                  aria-label="Effacer"
                >
                  Effacer
                </button>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => addDigit(item.digit)}
                className="ios-key-btn"
                disabled={loading || pin.length >= PIN_LENGTH}
              >
                <span className="ios-key-num">{item.digit}</span>
                {item.letters && <span className="ios-key-sub">{item.letters}</span>}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
