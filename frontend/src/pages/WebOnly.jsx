import { Link } from "react-router-dom";

export default function WebOnly() {
  return (
    <div className="webonly-page">
      <div className="webonly-card">
        {/* Icône cadenas */}
        <div className="webonly-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 className="webonly-title">Coffre réservé à l'application</h1>

        <p className="webonly-desc">
          Pour des raisons de sécurité, l'accès à votre coffre de mots de passe
          est uniquement disponible via l'application de bureau Vaultic.
        </p>

        <p className="webonly-sub">
          Téléchargez l'application gratuite et retrouvez tous vos identifiants
          en toute sécurité, directement sur votre ordinateur.
        </p>

        <a
          href="/download/windows"
          className="btn-download-webonly"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger Vaultic pour Windows
        </a>

        <div className="webonly-links">
          <Link to="/" className="webonly-back">← Retour à l'accueil</Link>
          <Link to="/login" className="webonly-back">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
