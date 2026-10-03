import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";

export default function Admin() {
  const { user } = useVault();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filtre / recherche utilisateur
  const [searchQuery, setSearchQuery] = useState("");

  // Modales d'action
  const [tempBanModalUser, setTempBanModalUser] = useState(null);
  const [tempBanHours, setTempBanHours] = useState(24);

  const [limitModalUser, setLimitModalUser] = useState(null);
  const [limitValue, setLimitValue] = useState("");

  // Formulaire pour bannir manuellement une IP
  const [manualIp, setManualIp] = useState("");
  const [manualReason, setManualReason] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setError(null);
    try {
      const [s, u, b] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getBannedIps(),
      ]);
      setStats(s);
      setUsers(u);
      setBannedIps(b);
    } catch (err) {
      setError(err.message || "Erreur d'accès au panneau d'administration.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function notify(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  async function handleToggleRegistrations() {
    if (!stats) return;
    try {
      const res = await api.toggleRegistrations(!stats.registrationsEnabled);
      setStats((prev) => ({ ...prev, registrationsEnabled: res.registrationsEnabled }));
      notify(res.registrationsEnabled ? "Inscriptions publiques OUVERTES." : "Inscriptions publiques FERMÉES.");
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // BANNIR DÉFINITIVEMENT
  async function handleBanUser(targetUser) {
    const banIpToo = window.confirm(
      `Voulez-vous aussi bannir définitivement l'adresse IP (${targetUser.lastIp}) de ${targetUser.username} ?\n\nCliquez sur "OK" pour bannir le compte ET l'IP.\nCliquez sur "Annuler" pour bannir uniquement le compte.`
    );

    try {
      const res = await api.banUser(targetUser.id, banIpToo, `Banni par admin (compte ${targetUser.username})`);
      notify(res.message);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // DÉBANNIR
  async function handleUnbanUser(userId) {
    try {
      const res = await api.unbanUser(userId);
      notify(res.message);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // EXCLURE TEMPORAIREMENT (TIMEOUT)
  async function submitTempBan(e) {
    e.preventDefault();
    if (!tempBanModalUser) return;
    try {
      const res = await api.tempBanUser(tempBanModalUser.id, Number(tempBanHours));
      notify(res.message);
      setTempBanModalUser(null);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // LIMITER LES MOTS DE PASSE
  async function submitLimit(e) {
    e.preventDefault();
    if (!limitModalUser) return;
    try {
      const limit = limitValue.trim() === "" ? null : parseInt(limitValue, 10);
      const res = await api.setUserPasswordLimit(limitModalUser.id, limit);
      notify(res.message);
      setLimitModalUser(null);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // DÉSACTIVER (10 JOURS)
  async function handleDeactivate(targetUser) {
    const ok = window.confirm(
      `Désactiver le compte de ${targetUser.username} ?\nL'utilisateur ne pourra plus se connecter. Le compte sera programmé pour suppression définitive dans 10 jours.`
    );
    if (!ok) return;

    try {
      const res = await api.deactivateUser(targetUser.id);
      notify(res.message);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // RÉACTIVER
  async function handleReactivate(targetUser) {
    try {
      const res = await api.reactivateUser(targetUser.id);
      notify(res.message);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // DÉMOLIR LE COMPTE DÉFINITIVEMENT
  async function handleDeletePermanently(targetUser) {
    const ok = window.confirm(
      `⚠️ ACTION IRRÉVERSIBLE !\n\nDémolir définitivement le compte de ${targetUser.username} ?\nToutes ses clés et tous ses mots de passe seront immédiatement détruits du serveur.`
    );
    if (!ok) return;

    try {
      const res = await api.deleteUserPermanently(targetUser.id);
      notify(res.message);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  // BANNER UNE IP MANUELLEMENT
  async function handleManualBanIp(e) {
    e.preventDefault();
    if (!manualIp.trim()) return;
    try {
      await api.banIp(manualIp.trim(), manualReason.trim() || "Banni par l'administrateur");
      notify(`IP ${manualIp} bannie.`);
      setManualIp("");
      setManualReason("");
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  async function handleUnbanIp(ip) {
    try {
      await api.unbanIp(ip);
      notify(`IP ${ip} retirée de la liste noire.`);
      loadAdminData();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastIp.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page-wrapper">
      {/* NAVBAR ADMIN */}
      <header className="theme-navbar">
        <div className="nav-container">
          <Link to="/" className="theme-logo">
            <div className="logo-icon-box admin-glow">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="brand-titles-nav">
              <span className="logo-title">VAULTIC</span>
              <span className="logo-badge-admin">CONSOLE ADMIN</span>
            </div>
          </Link>

          <div className="nav-cta-group">
            <span className="admin-user-pill">
              👑 Connecté : <strong>{user?.username || "CSAVETY1"}</strong>
            </span>
            <button
              onClick={handleToggleRegistrations}
              className={`btn-admin-toggle ${stats?.registrationsEnabled ? "active" : "disabled"}`}
            >
              Inscriptions : {stats?.registrationsEnabled ? "OUVERTES" : "FERMÉES"}
            </button>
            <Link to="/dashboard" className="btn-nav-vault">
              <span>Mon Coffre</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-container">
        {/* BANNIÈRE DE NOTIFICATION */}
        {successMsg && <div className="admin-toast-success">{successMsg}</div>}
        {error && <div className="admin-toast-error">{error}</div>}

        <div className="admin-header-row">
          <div>
            <h1>Supervision & Contrôle des Comptes</h1>
            <p className="admin-subtext">
              Gérez les accès, appliquez des exclusions temporaires, définissez des quotas et surveillez l'activité des utilisateurs en direct.
            </p>
          </div>
          <button onClick={loadAdminData} className="btn-refresh-admin">
            🔄 Rafraîchir
          </button>
        </div>

        {/* CARTES STATISTIQUES */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="stat-label">Comptes Inscrits</div>
              <div className="stat-val">{stats.usersCount}</div>
              <div className="stat-note">Utilisateurs enregistrés</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">Mots de passe stockés</div>
              <div className="stat-val">{stats.entriesCount}</div>
              <div className="stat-note">Chiffrés côté client</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">Exclusions temporaires</div>
              <div className="stat-val alert">{stats.tempBannedCount || 0}</div>
              <div className="stat-note">Comptes suspendus (timeout)</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">En attente de purge (10j)</div>
              <div className="stat-val warn">{stats.deactivatedCount || 0}</div>
              <div className="stat-note">Comptes désactivés</div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-label">IP Bloquées</div>
              <div className="stat-val red">{stats.bannedCount}</div>
              <div className="stat-note">Liste noire pare-feu</div>
            </div>
          </div>
        )}

        {/* SECTION 1 : UTILISATEURS */}
        <div className="admin-section-box">
          <div className="section-head-bar">
            <div>
              <h2>Tous les Utilisateurs ({filteredUsers.length})</h2>
              <p>Historique des connexions, adresses IP et contrôle direct des permissions.</p>
            </div>
            <input
              type="text"
              placeholder="Rechercher par pseudo ou IP…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Dernière IP</th>
                  <th>Dernière Connexion</th>
                  <th>Quota Mots de Passe</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Actions Administrateur</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isCSAVETY = u.username.toUpperCase() === "CSAVETY1";
                  const isTempBanned = u.tempBanUntil && new Date(u.tempBanUntil) > new Date();

                  return (
                    <tr key={u.id} className={u.isBanned ? "row-banned" : isTempBanned ? "row-tempbanned" : ""}>
                      <td>
                        <div className="user-name-cell">
                          <strong>{u.username}</strong>
                          {u.isAdmin && <span className="badge-admin-tag">👑 Admin</span>}
                        </div>
                        <span className="user-date-hint">Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}</span>
                      </td>

                      <td>
                        <code className="ip-badge">{u.lastIp}</code>
                      </td>

                      <td>
                        <span className="login-date-text">
                          {u.lastLogin && u.lastLogin !== "Jamais"
                            ? new Date(u.lastLogin).toLocaleString("fr-FR")
                            : "Jamais"}
                        </span>
                      </td>

                      <td>
                        <div className="quota-cell">
                          <span>
                            {u.entriesCount} / {u.maxPasswords === null ? "Illimité" : u.maxPasswords}
                          </span>
                          {!isCSAVETY && (
                            <button
                              onClick={() => {
                                setLimitModalUser(u);
                                setLimitValue(u.maxPasswords === null ? "" : String(u.maxPasswords));
                              }}
                              className="btn-pill-small"
                              title="Modifier la limite"
                            >
                              ⚙️ Limite
                            </button>
                          )}
                        </div>
                      </td>

                      <td>
                        {u.isBanned ? (
                          <span className="status-pill banned">Banni Définitif</span>
                        ) : isTempBanned ? (
                          <span className="status-pill tempbanned" title={`Jusqu'au ${new Date(u.tempBanUntil).toLocaleString("fr-FR")}`}>
                            Exclu (Timeout)
                          </span>
                        ) : u.isDeactivated ? (
                          <span className="status-pill deactivated">Désactivé (Purge 10j)</span>
                        ) : (
                          <span className="status-pill active">Actif</span>
                        )}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {!isCSAVETY ? (
                          <div className="action-buttons-group">
                            {/* EXCLURE TEMPORAIREMENT */}
                            <button
                              onClick={() => setTempBanModalUser(u)}
                              className="btn-action-warning"
                              title="Exclure temporairement (1h, 24h, 72h)"
                            >
                              ⏱️ Exclure
                            </button>

                            {/* BANNIR OU DEBANNIR */}
                            {u.isBanned || isTempBanned ? (
                              <button
                                onClick={() => handleUnbanUser(u.id)}
                                className="btn-action-unban"
                              >
                                Débannir
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBanUser(u)}
                                className="btn-action-danger"
                              >
                                🚫 Bannir
                              </button>
                            )}

                            {/* DÉSACTIVER OU RÉACTIVER */}
                            {u.isDeactivated ? (
                              <button
                                onClick={() => handleReactivate(u)}
                                className="btn-action-unban"
                              >
                                Réactiver
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeactivate(u)}
                                className="btn-action-mute"
                                title="Désactiver le compte (suppression auto sous 10j)"
                              >
                                ⏸️ Désactiver
                              </button>
                            )}

                            {/* DÉMOLIR DÉFINITIVEMENT */}
                            <button
                              onClick={() => handleDeletePermanently(u)}
                              className="btn-action-demolish"
                              title="Démolir le compte et toutes ses données immédiatement"
                            >
                              💥 Démolir
                            </button>
                          </div>
                        ) : (
                          <span className="master-admin-badge">Compte Principal Protégé</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2 : LISTE NOIRE IP */}
        <div className="admin-section-box">
          <h2>Liste Noire des Adresses IP Bannies ({bannedIps.length})</h2>
          <p className="admin-subtext">Ces adresses IP sont bloquées au niveau du pare-feu et ne peuvent accéder à aucune page.</p>

          <form onSubmit={handleManualBanIp} className="ban-ip-form">
            <input
              type="text"
              placeholder="Ex: 176.165.95.218"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Raison du bannissement (ex: Force brute)"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
            />
            <button type="submit" className="btn-submit-ban">
              Bloquer cette IP
            </button>
          </form>

          {bannedIps.length === 0 ? (
            <p className="empty-hint">Aucune adresse IP bloquée pour le moment.</p>
          ) : (
            <div className="banned-ips-list">
              {bannedIps.map((b) => (
                <div key={b.ip} className="banned-ip-card">
                  <div>
                    <code>{b.ip}</code>
                    <span className="ban-reason">{b.reason}</span>
                    <span className="ban-date">{new Date(b.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <button onClick={() => handleUnbanIp(b.ip)} className="btn-unban-ip">
                    Débloquer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODALE EXCLUSION TEMPORAIRE (TIMEOUT) */}
      {tempBanModalUser && (
        <div className="admin-modal-overlay" onClick={() => setTempBanModalUser(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="choice-modal-close" onClick={() => setTempBanModalUser(null)}>✕</button>
            <h3>⏱️ Exclure temporairement {tempBanModalUser.username}</h3>
            <p>L'utilisateur ne pourra pas se connecter à son compte pendant cette période.</p>

            <form onSubmit={submitTempBan}>
              <label className="admin-field-label">
                Sélectionnez la durée de suspension :
                <select
                  value={tempBanHours}
                  onChange={(e) => setTempBanHours(e.target.value)}
                  className="admin-select"
                >
                  <option value={1}>1 heure</option>
                  <option value={2}>2 heures</option>
                  <option value={6}>6 heures</option>
                  <option value={12}>12 heures</option>
                  <option value={24}>1 jour (24 heures)</option>
                  <option value={48}>2 jours (48 heures)</option>
                  <option value={72}>3 jours (72 heures)</option>
                  <option value={168}>1 semaine (7 jours)</option>
                  <option value={720}>1 mois (30 jours)</option>
                </select>
              </label>

              <div className="modal-buttons-row">
                <button type="button" onClick={() => setTempBanModalUser(null)} className="btn-cancel">
                  Annuler
                </button>
                <button type="submit" className="btn-confirm-action">
                  Appliquer l'exclusion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE LIMITER LE NOMBRE DE MOTS DE PASSE */}
      {limitModalUser && (
        <div className="admin-modal-overlay" onClick={() => setLimitModalUser(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="choice-modal-close" onClick={() => setLimitModalUser(null)}>✕</button>
            <h3>🔢 Définir le quota pour {limitModalUser.username}</h3>
            <p>Fixez le nombre maximum d'entrées / mots de passe que cet utilisateur peut enregistrer.</p>

            <form onSubmit={submitLimit}>
              <label className="admin-field-label">
                Nombre maximum de mots de passe :
                <input
                  type="number"
                  min="0"
                  max="10000"
                  placeholder="Laissez vide pour Illimité"
                  value={limitValue}
                  onChange={(e) => setLimitValue(e.target.value)}
                  className="admin-number-input"
                />
              </label>
              <div className="quota-quick-buttons">
                <button type="button" onClick={() => setLimitValue("1")}>1</button>
                <button type="button" onClick={() => setLimitValue("2")}>2</button>
                <button type="button" onClick={() => setLimitValue("5")}>5</button>
                <button type="button" onClick={() => setLimitValue("10")}>10</button>
                <button type="button" onClick={() => setLimitValue("")}>Illimité</button>
              </div>

              <div className="modal-buttons-row">
                <button type="button" onClick={() => setLimitModalUser(null)} className="btn-cancel">
                  Annuler
                </button>
                <button type="submit" className="btn-confirm-action">
                  Sauvegarder la limite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
