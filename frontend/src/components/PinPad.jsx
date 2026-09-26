import { useEffect, useState, useCallback } from "react";

const DIGIT_CODE_PATTERN = /^(Digit|Numpad)([0-9])$/;

export default function PinPad({ minLength = 8, maxLength = 12, onSubmit, disabled = false, label }) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);

  const addDigit = useCallback((digit) => {
    setValue((prev) => (prev.length >= maxLength ? prev : prev + digit));
  }, [maxLength]);

  const removeDigit = useCallback(() => {
    setValue((prev) => prev.slice(0, -1));
  }, []);

  const trySubmit = useCallback(() => {
    if (value.length < minLength) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSubmit(value);
  }, [value, minLength, onSubmit]);

  useEffect(() => {
    if (disabled) return;

    function handleKeyDown(e) {
      // e.code identifie la touche physique : fonctionne pareil en AZERTY et QWERTY,
      // et couvre à la fois le pavé numérique et la rangée de chiffres du haut.
      const match = e.code.match(DIGIT_CODE_PATTERN);
      if (match) {
        e.preventDefault();
        addDigit(match[2]);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        removeDigit();
      } else if (e.key === "Enter") {
        e.preventDefault();
        trySubmit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addDigit, removeDigit, trySubmit, disabled]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className={`pin-pad ${shake ? "pin-pad-shake" : ""}`}>
      {label && <p className="pin-pad-label">{label}</p>}
      <div className="pin-dots">
        {Array.from({ length: Math.max(value.length, minLength) }).map((_, i) => (
          <span key={i} className={`pin-dot ${i < value.length ? "filled" : ""}`} />
        ))}
      </div>
      <p className="pin-pad-hint">Minimum {minLength} chiffres</p>
      <div className="pin-keypad">
        {keys.map((k, i) => {
          if (k === "") return <span key={i} />;
          if (k === "⌫") {
            return (
              <button type="button" key={i} onClick={removeDigit} disabled={disabled} className="pin-key pin-key-action">
                ⌫
              </button>
            );
          }
          return (
            <button type="button" key={i} onClick={() => addDigit(k)} disabled={disabled} className="pin-key">
              {k}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={trySubmit} disabled={disabled || value.length < minLength} className="pin-submit">
        Valider
      </button>
    </div>
  );
}