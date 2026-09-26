import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";

export default function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated } = useVault();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bannedIps, setBannedIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  async function handleToggleRegistrations() {
    if (!stats) return;
    try {
      const res = await api.toggleRegistrations(!stats.registrationsEnabled);
      setStats((prev) => ({ ...prev, registrationsEnabled: res.registrationsEnabled }));
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  async function handleBan(ip, reason = "Banni via panneau admin") {
    const confirmBan = window.confirm(`Bannir définitivement l'adresse IP ${ip} ?`);
    if (!confirmBan) return;

    try {
      await api.banIp(ip, reason);
      setManualIp("");
      setManualReason("");
      loadAdminData();
    } catch (err) {
      alert("Erreur lors du bannissement : " + err.message);
    }
  }

  async function handleUnban(ip) {
    try {
      await api.unbanIp(ip);
      loadAdminData();
    } catch (err) {
      alert("Erreur lors du débannissement : " + err.message);
    }
  }

  return (
    <div className="admin-page-wrapper">
      {/* NAVBAR ADMIN */}
      <header className="theme-navbar">
        <div className="nav-container">
          <Link to="/" className="theme-logo">
            <div className="logo-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="logo-title">VAULTIC // ADMIN</span>
          </Link>

          <div className="nav-cta-group">
            <Link to="/dashboard" className="btn-nav-vault">
              <span>Retour au Coffre</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-container">
        <div className="admin-header-row">
          <div>
            <h1>Panneau de Contrôle & Sécurité</h1>
            <p className="admin-sub">Surveillance des comptes, gestion des accès et bannissement d'adresses IP.</p>
          </div>
          <button className="theme-btn-secondary" onClick={loadAdminData}>
            ↻ Actualiser
          </button>
        </div>

        {error && <div className="cyber-alert error">{error}</div>}

        {loading ? (
          <div className="cyber-loading">
            <div className="cyber-spinner"></div>
            <span>Chargement des données admin...</span>
          </div>
        ) : (
          <>
            {/* STATS ADMIN */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="stat-label">UTILISATEURS ENREGISTRÉS</span>
                <span className="stat-number">{stats?.usersCount || 0}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">SECRETS CHIFFRÉS DANS LA BASE</span>
                <span className="stat-number">{stats?.entriesCount || 0}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">ADRESSES IP BANANIES</span>
                <span className="stat-number danger">{stats?.bannedCount || 0}</span>
              </div>
              <div className="admin-stat-card">
                <span className="stat-label">INSCRIPTIONS PUBLIQUES</span>
                <button
                  className={`btn-toggle-switch ${stats?.registrationsEnabled ? "active" : "inactive"}`}
                  onClick={handleToggleRegistrations}
                >
                  {stats?.registrationsEnabled ? "● Ouvertes (Actives)" : "○ Fermées (Bloquées)"}
                </button>
              </div>
            </div>

            {/* FORMULAIRE BANNISSEMENT MANUEL */}
            <div className="admin-section-box">
              <h3>Bannir une adresse IP manuellement</h3>
              <form
                className="manual-ban-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualIp) handleBan(manualIp, manualReason);
                }}
              >
                <input
                  type="text"
                  placeholder="Adresse IP (ex: 192.168.1.50 ou 82.64...)"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Motif du ban (ex: Comportement suspect, spam...)"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                />
                <button type="submit" className="btn-danger-ban">
                  Bannir cette IP
                </button>
              </form>
            </div>

            {/* LISTE DES UTILISATEURS ET LEURS IP */}
            <div className="admin-section-box">
              <h3>Comptes créés ({users.length})</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Identifiant</th>
                      <th>Rôle</th>
                      <th>Date d'inscription</th>
                      <th>Dernière IP connue</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span className="user-bold">{u.username}</span>
                        </td>
                        <td>
                          <span className={`role-pill ${u.isAdmin ? "admin" : "user"}`}>
                            {u.isAdmin ? "Administrateur" : "Utilisateur"}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleString()}</td>
                        <td>
                          <code className="ip-code">{u.lastIp}</code>
                        </td>
                        <td>
                          {!u.isAdmin && (
                            <button
                              className="btn-table-ban"
                              onClick={() => handleBan(u.lastIp, `Banni depuis l'utilisateur ${u.username}`)}
                            >
                              Bannir son IP
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LISTE DES IP BANNIES */}
            <div className="admin-section-box">
              <h3>Adresses IP Bannies ({bannedIps.length})</h3>
              {bannedIps.length === 0 ? (
                <p className="empty-muted">Aucune adresse IP bannie pour le moment.</p>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Adresse IP Bannie</th>
                        <th>Motif</th>
                        <th>Date du ban</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bannedIps.map((b) => (
                        <tr key={b.ip}>
                          <td>
                            <code className="ip-code danger">{b.ip}</code>
                          </td>
                          <td>{b.reason}</td>
                          <td>{new Date(b.created_at).toLocaleString()}</td>
                          <td>
                            <button className="btn-table-unban" onClick={() => handleUnban(b.ip)}>
                              Débannir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
