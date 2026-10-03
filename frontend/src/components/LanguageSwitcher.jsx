import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lang-switcher-wrap" ref={dropdownRef}>
      <button
        type="button"
        className="btn-lang-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Changer de langue / Change language"
      >
        <span className="lang-flag">{lang === "fr" ? "🇫🇷" : "🇬🇧"}</span>
        <span className="lang-code">{lang.toUpperCase()}</span>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" className={`lang-chevron ${open ? "rotated" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="lang-dropdown-menu">
          <button
            type="button"
            className={`lang-option-btn ${lang === "fr" ? "active" : ""}`}
            onClick={() => {
              setLang("fr");
              setOpen(false);
            }}
          >
            <span className="option-flag">🇫🇷</span>
            <span className="option-text">Français</span>
            {lang === "fr" && <span className="option-check">✓</span>}
          </button>

          <button
            type="button"
            className={`lang-option-btn ${lang === "en" ? "active" : ""}`}
            onClick={() => {
              setLang("en");
              setOpen(false);
            }}
          >
            <span className="option-flag">🇬🇧</span>
            <span className="option-text">English</span>
            {lang === "en" && <span className="option-check">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
