import { Link } from "react-router-dom";
import { useVault } from "../state/VaultContext.jsx";

export default function DownloadApp() {
  const { user, logout } = useVault();

  async function handleLogout() {
    try {
      await logout?.();
    } catch {}
    window.location.href = "/";
  }

  return (
    <div className="download-app-page">
      <div className="download-app-card">

        {/* Icône bouclier avec check */}
        <div className="dapp-icon">
          <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Message de bienvenue */}
        <div className="dapp-welcome">
          <h1>Compte créé avec succès ! 🎉</h1>
          {user?.username && (
            <p className="dapp-username">Bienvenue, <strong>{user.username}</strong></p>
          )}
        </div>

        <p className="dapp-desc">
          Votre compte Vaultic est prêt. Pour accéder à votre coffre de mots de passe,
          téléchargez l'application Windows — votre coffre est uniquement accessible
          depuis l'application, pour garantir la sécurité maximale de vos données.
        </p>

        {/* Bouton principal téléchargement */}
        <a href="/download/windows" className="btn-dapp-download">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger Vaultic pour Windows
          <span className="dapp-badge-free">Gratuit</span>
        </a>

        <p className="dapp-hint">
          Une fois le logiciel installé, connectez-vous avec vos identifiants pour accéder à votre coffre.
        </p>

        {/* Sur téléphone → PWA */}
        <div className="dapp-mobile-hint">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>
            Sur iPhone ou Android ? Appuyez sur <strong>Partager</strong> puis{" "}
            <strong>Ajouter à l'écran d'accueil</strong> pour installer l'app mobile.
          </span>
        </div>

        {/* Liens secondaires */}
        <div className="dapp-footer-links">
          <Link to="/" className="dapp-link">← Retour à l'accueil</Link>
          <button onClick={handleLogout} className="dapp-link dapp-link-btn">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
