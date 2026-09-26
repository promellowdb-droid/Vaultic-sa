import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useVault } from "../state/VaultContext.jsx";
import { api } from "../api/client.js";
import { encryptEntry, decryptEntry } from "../crypto/encryptEntry.js";

// Générateur de mot de passe fort intégré
function generateStrongPassword(length = 18) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }
  return password;
}

// Calcul de solidité
function getPasswordStrength(pwd) {
  if (!pwd) return { label: "Vide", score: 0, color: "var(--text-dim)" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { label: "Faible", score: 1, color: "#f87171" };
  if (score <= 4) return { label: "Moyen", score: 2, color: "#fbbf24" };
  if (score <= 5) return { label: "Fort", score: 3, color: "#34d399" };
  return { label: "Blindé", score: 4, color: "#38bdf8" };
}

const THEME_PRESETS = [
  { name: "Neon Blurple", color: "#6571FF" },
  { name: "Electric Cyan", color: "#38bdf8" },
  { name: "Cyber Emerald", color: "#10b981" },
  { name: "Sunset Amber", color: "#f59e0b" },
  { name: "Ruby Rose", color: "#f43f5e" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { username, vaultKey, lock, clearSession } = useVault();

  // Entrées déchiffrées
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modale d'ajout ou modification
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    url: "",
  });
  const [formShowPassword, setFormShowPassword] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Modale de Paramètres (Thèmes, Sécurité, Support)
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeThemeColor, setActiveThemeColor] = useState(
    localStorage.getItem("vaultic_theme_color") || "#6571FF"
  );

  // Mots de passe révélés et presse-papier
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  // Applique la couleur de thème personnalisée
  function changeThemeColor(color) {
    setActiveThemeColor(color);
    document.documentElement.style.setProperty("--theme-color", color);
    document.documentElement.style.setProperty("--theme-glow", `${color}55`);
    localStorage.setItem("vaultic_theme_color", color);
  }

  useEffect(() => {
    const saved = localStorage.getItem("vaultic_theme_color");
    if (saved) {
      document.documentElement.style.setProperty("--theme-color", saved);
      document.documentElement.style.setProperty("--theme-glow", `${saved}55`);
    }
  }, []);

  // Chargement et déchiffrement des entrées
  useEffect(() => {
    let cancelled = false;

    async function loadAndDecryptEntries() {
      if (!vaultKey) return;
      setLoading(true);
      setError(null);

      try {
        const rawEntries = await api.getEntries();
        if (cancelled) return;

        const decryptedList = [];
        for (const raw of rawEntries) {
          try {
            const data = await decryptEntry(raw.encryptedData, raw.nonce, vaultKey);
            decryptedList.push({
              id: raw.id,
              name: data.name || "Sans titre",
              username: data.username || "",
              password: data.password || "",
              url: data.url || "",
              createdAt: raw.createdAt,
              updatedAt: raw.updatedAt,
            });
          } catch (decErr) {
            console.error("Échec déchiffrement", raw.id, decErr);
          }
        }

        if (!cancelled) {
          setEntries(decryptedList);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erreur de chargement du coffre.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAndDecryptEntries();

    return () => {
      cancelled = true;
    };
  }, [vaultKey]);

  function handleLock() {
    lock();
    navigate("/unlock");
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Erreur déconnexion", e);
    }
    clearSession();
    navigate("/login");
  }

  function openAddModal() {
    setEditingEntry(null);
    setFormData({ name: "", username: "", password: "", url: "" });
    setFormShowPassword(false);
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(entry) {
    setEditingEntry(entry);
    setFormData({
      name: entry.name,
      username: entry.username,
      password: entry.password,
      url: entry.url,
    });
    setFormShowPassword(false);
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEntry(null);
    setFormError(null);
  }

  function handleGeneratePassword() {
    const newPwd = generateStrongPassword(18);
    setFormData((prev) => ({ ...prev, password: newPwd }));
    setFormShowPassword(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Veuillez indiquer le nom du service.");
      return;
    }
    if (!formData.password) {
      setFormError("Veuillez indiquer un mot de passe.");
      return;
    }
    if (!vaultKey) {
      setFormError("Clé de coffre absente. Veuillez reverrouiller.");
      return;
    }

    setFormSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password,
        url: formData.url.trim(),
      };

      const { encryptedData, nonce } = await encryptEntry(payload, vaultKey);

      if (editingEntry) {
        await api.updateEntry(editingEntry.id, encryptedData, nonce);
        setEntries((prev) =>
          prev.map((item) =>
            item.id === editingEntry.id
              ? { ...item, ...payload, updatedAt: new Date().toISOString() }
              : item
          )
        );
      } else {
        const res = await api.createEntry(encryptedData, nonce);
        const newEntry = {
          id: res.id,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setEntries((prev) => [newEntry, ...prev]);
      }

      closeModal();
    } catch (err) {
      setFormError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDeleteEntry(entry) {
    const confirmDelete = window.confirm(`Supprimer définitivement "${entry.name}" ?`);
    if (!confirmDelete) return;

    try {
      await api.deleteEntry(entry.id);
      setEntries((prev) => prev.filter((item) => item.id !== entry.id));
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  function toggleReveal(id) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function copyToClipboard(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch (err) {
      console.warn("Échec copie", err);
    }
  }

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.username.toLowerCase().includes(term) ||
        e.url.toLowerCase().includes(term)
    );
  }, [entries, searchTerm]);

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="vault-app">
      {/* NAVBAR VAULTIC */}
      <header className="vault-navbar">
        <div className="nav-brand">
          <Link to="/" className="brand-shield" title="Page d'accueil Vaultic">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </Link>
          <div className="brand-meta">
            <div className="brand-title-row">
              <span className="brand-name">VAULTIC</span>
              <span className="brand-slash">//</span>
              <span className="brand-sub">SA</span>
            </div>
            <span className="brand-version">ZERO-KNOWLEDGE • AES-256</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="vault-health-pill">
            <span className="pulse-indicator"></span>
            <span className="health-label">Coffre chiffré actif</span>
          </div>
        </div>

        <div className="nav-actions">
          <div className="user-profile">
            <div className="user-avatar-circle">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="user-login-text">{username}</span>
          </div>

          {/* BOUTON PARAMÈTRES */}
          <button
            className="btn-action-settings"
            onClick={() => setSettingsOpen(true)}
            title="Paramètres & Personnalisation du thème"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Paramètres</span>
          </button>

          <button className="btn-action-lock" onClick={handleLock} title="Verrouiller le coffre">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Verrouiller</span>
          </button>

          <button className="btn-action-exit" onClick={handleLogout} title="Déconnexion">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="vault-body">
        {/* BANDEAU STATISTIQUES */}
        <section className="stats-banner">
          <div className="stat-card">
            <div className="stat-icon-wrapper cyan">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="stat-data">
              <span className="stat-value">{entries.length}</span>
              <span className="stat-label">Comptes enregistrés</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper emerald">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="stat-data">
              <span className="stat-value">100%</span>
              <span className="stat-label">Chiffrement Client-Side</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper violet">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <div className="stat-data">
              <span className="stat-value">Actif</span>
              <span className="stat-label">Clé mémoire éphémère</span>
            </div>
          </div>
        </section>

        {/* BARRE DE COMMANDE */}
        <div className="main-command-bar">
          <div className="search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un service, identifiant, site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="btn-clear-search" onClick={() => setSearchTerm("")}>
                ✕
              </button>
            )}
          </div>

          <button className="btn-glow-primary" onClick={openAddModal}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Ajouter un mot de passe</span>
          </button>
        </div>

        {error && <div className="cyber-alert error">{error}</div>}

        {loading ? (
          <div className="cyber-loading">
            <div className="cyber-spinner"></div>
            <span>Déchiffrement sécurisé du coffre...</span>
          </div>
        ) : (
          <>
            {filteredEntries.length === 0 ? (
              <div className="cyber-empty">
                <div className="empty-ring">
                  <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3>{searchTerm ? "Aucun résultat trouvé" : "Votre coffre est vide"}</h3>
                <p>
                  {searchTerm
                    ? `Aucun compte ne correspond à "${searchTerm}".`
                    : "Enregistrez votre premier mot de passe pour le protéger en AES-256."}
                </p>
                {!searchTerm && (
                  <button className="btn-glow-primary" onClick={openAddModal}>
                    <span>Créer ma première entrée</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="cards-grid">
                {filteredEntries.map((entry) => {
                  const isRevealed = revealedIds.has(entry.id);
                  const isPwdCopied = copiedId === `pwd-${entry.id}`;
                  const isUserCopied = copiedId === `user-${entry.id}`;

                  return (
                    <article key={entry.id} className="cyber-card">
                      <div className="card-top">
                        <div className="card-badge-avatar">
                          {entry.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="card-meta">
                          <h3 className="card-name" title={entry.name}>
                            {entry.name}
                          </h3>
                          {entry.url && (
                            <a
                              href={entry.url.startsWith("http") ? entry.url : `https://${entry.url}`}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="card-link"
                              title={entry.url}
                            >
                              <span>{entry.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}</span>
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="card-details">
                        {entry.username && (
                          <div className="detail-row">
                            <span className="detail-tag">IDENTIFIANT</span>
                            <div className="detail-data">
                              <span className="detail-text" title={entry.username}>
                                {entry.username}
                              </span>
                              <button
                                className="btn-micro-action"
                                onClick={() => copyToClipboard(entry.username, `user-${entry.id}`)}
                                title="Copier l'identifiant"
                              >
                                {isUserCopied ? (
                                  <span className="text-copied">Copié !</span>
                                ) : (
                                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="detail-row">
                          <span className="detail-tag">MOT DE PASSE</span>
                          <div className="detail-data">
                            <span className={isRevealed ? "detail-password revealed" : "detail-password masked"}>
                              {isRevealed ? entry.password : "••••••••••••••"}
                            </span>
                            <div className="micro-actions-group">
                              <button
                                className="btn-micro-action"
                                onClick={() => toggleReveal(entry.id)}
                                title={isRevealed ? "Masquer" : "Afficher"}
                              >
                                {isRevealed ? (
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                )}
                              </button>

                              <button
                                className="btn-micro-action"
                                onClick={() => copyToClipboard(entry.password, `pwd-${entry.id}`)}
                                title="Copier le mot de passe"
                              >
                                {isPwdCopied ? (
                                  <span className="text-copied">Copié !</span>
                                ) : (
                                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer-bar">
                        <button className="btn-card-edit" onClick={() => openEditModal(entry)}>
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          <span>Modifier</span>
                        </button>

                        <button className="btn-card-trash" onClick={() => handleDeleteEntry(entry)}>
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODALE DE PARAMÈTRES (Thème, Sécurité, Support) */}
      {settingsOpen && (
        <div className="cyber-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="cyber-modal-box settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-title-wrap">
                <span className="modal-eyebrow">VAULTIC // PARAMÈTRES</span>
                <h2>Préférences & Configuration</h2>
              </div>
              <button className="btn-modal-close" onClick={() => setSettingsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="settings-content">
              {/* SECTION THÈMES */}
              <div className="settings-section">
                <h4>Personnaliser le thème néon</h4>
                <p className="settings-sub">Choisissez la couleur d'accentuation de votre interface Vaultic :</p>
                <div className="theme-color-picker">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      className={`theme-color-btn ${activeThemeColor === preset.color ? "active" : ""}`}
                      style={{ backgroundColor: preset.color }}
                      onClick={() => changeThemeColor(preset.color)}
                      title={preset.name}
                    >
                      {activeThemeColor === preset.color && "✓"}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION ACCÈS ADMIN */}
              <div className="settings-section">
                <h4>Administration du système</h4>
                <p className="settings-sub">Gérez les créations de compte, les IP et les utilisateurs :</p>
                <Link to="/admin" className="theme-btn-secondary full-width" onClick={() => setSettingsOpen(false)}>
                  <span>Accéder au Panneau Admin Vaultic</span>
                </Link>
              </div>

              {/* SECTION SUPPORT */}
              <div className="settings-section">
                <h4>Support & Contact</h4>
                <p className="settings-sub">Besoin d'aide ou d'une question sur le coffre ?</p>
                <div className="support-links-row">
                  <a href="https://discord.gg" target="_blank" rel="noreferrer" className="btn-support-pill">
                    Discord : sql.zeke
                  </a>
                  <a href="mailto:contact@vaultic.io" className="btn-support-pill">
                    Email Support
                  </a>
                </div>
              </div>
            </div>

            <div className="modal-footer-simple">
              <button className="theme-btn-primary" onClick={() => setSettingsOpen(false)}>
                Fermer les paramètres
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE D'AJOUT / MODIFICATION D'UNE ENTRÉE */}
      {modalOpen && (
        <div className="cyber-modal-overlay" onClick={closeModal}>
          <div className="cyber-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-title-wrap">
                <span className="modal-eyebrow">VAULTIC // SA SAFE</span>
                <h2>{editingEntry ? "Modifier le mot de passe" : "Nouveau secret chiffré"}</h2>
              </div>
              <button className="btn-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="cyber-modal-form">
              {formError && <div className="cyber-alert error">{formError}</div>}

              <div className="field-group">
                <label htmlFor="service-name">
                  Nom du service <span className="req">*</span>
                </label>
                <input
                  id="service-name"
                  type="text"
                  placeholder="Ex : Netflix, GitHub, ProtonMail, Binance..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="field-group">
                <label htmlFor="service-url">Adresse web (URL)</label>
                <input
                  id="service-url"
                  type="text"
                  placeholder="Ex : https://accounts.google.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label htmlFor="service-username">Identifiant / E-mail</label>
                <input
                  id="service-username"
                  type="text"
                  placeholder="Ex : zak@vaultic.io"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="field-group">
                <div className="label-with-generator">
                  <label htmlFor="service-password">
                    Mot de passe <span className="req">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn-generate-inline"
                    onClick={handleGeneratePassword}
                  >
                    ⚡ Générer un mot de passe
                  </button>
                </div>

                <div className="password-cyber-wrapper">
                  <input
                    id="service-password"
                    type={formShowPassword ? "text" : "password"}
                    placeholder="Saisissez ou générez un mot de passe"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="btn-eye-trigger"
                    onClick={() => setFormShowPassword(!formShowPassword)}
                    tabIndex={-1}
                  >
                    {formShowPassword ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {formData.password && (
                  <div className="pwd-strength-container">
                    <div className="pwd-strength-bars">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className="strength-bar"
                          style={{
                            backgroundColor: step <= strength.score ? strength.color : "rgba(255,255,255,0.1)",
                          }}
                        ></span>
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                      Sécurité : {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-buttons-row">
                <button type="button" className="btn-ghost" onClick={closeModal} disabled={formSaving}>
                  Annuler
                </button>
                <button type="submit" className="theme-btn-primary" disabled={formSaving}>
                  <span>{formSaving ? "Chiffrement AES-256..." : editingEntry ? "Enregistrer" : "Chiffrer et enregistrer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}