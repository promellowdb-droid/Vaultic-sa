import { useState } from "react";
import { Link } from "react-router-dom";
import { useVault } from "../state/VaultContext.jsx";

export default function Landing() {
  const { isAuthenticated, isUnlocked } = useVault();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const destinationVault = !isAuthenticated
    ? "/login"
    : isUnlocked
    ? "/dashboard"
    : "/unlock";

  const faqs = [
    {
      q: "Qu'est-ce que Vaultic (Vaultic / SA) ?",
      a: "Vaultic est un coffre-fort numérique de nouvelle génération conçu avec une architecture Zero-Knowledge intégrale. Vos mots de passe et données sensibles sont chiffrés directement sur votre machine avant tout transfert réseau.",
    },
    {
      q: "Le serveur peut-il voir ou lire mes mots de passe ?",
      a: "Non, jamais. Le serveur ne reçoit et ne stocke que des données préalablement chiffrées en AES-256-GCM avec des nonces aléatoires uniques. Votre mot de passe maître ou PIN ne quitte jamais votre appareil.",
    },
    {
      q: "Comment utiliser Vaultic comme un logiciel sur mon ordinateur ?",
      a: "Vous pouvez lancer Vaultic directement sans navigateur grâce au lanceur dédié 'lancer-logiciel-vaultic.bat' qui ouvre une fenêtre logicielle Windows indépendante, rapide et sans distraction.",
    },
    {
      q: "Comment avoir Vaultic sur mon téléphone (iPhone & Android) ?",
      a: "Ouvrez simplement le lien sur votre smartphone (sur le même réseau ou via le lien public HTTPS). Cliquez ensuite sur 'Partager' puis 'Sur l'écran d'accueil' : Vaultic s'installe directement comme une application mobile native sur votre écran !",
    },
    {
      q: "Puis-je personnaliser mon thème et mes couleurs ?",
      a: "Oui ! Une fois dans votre coffre, l'onglet Paramètres vous permet de choisir votre couleur d'accent néon préférée (Bleu/Violet Électrique, Cyan, Émeraude, Orange Sunset, etc.).",
    },
  ];

  return (
    <div className="theme-shop-wrapper">
      {/* 3D FLOATING SHAPES DU THEME (Formes décoratives avec accessibilité a11y) */}
      <div className="shapes-container" aria-hidden="true">
        <img src="https://i.ibb.co/hRQSLmLk/3d-0.webp" className="elegant-shape shape-1" alt="Forme géométrique 3D néon en apesanteur" loading="lazy" />
        <img src="https://i.ibb.co/M4JkzKd/3d-1.webp" className="elegant-shape shape-2" alt="Élément géométrique abstrait 3D" loading="lazy" />
        <img src="https://i.ibb.co/Xxt3c2nt/3d-2.webp" className="elegant-shape shape-3" alt="Objet 3D futuriste flottant" loading="lazy" />
        <img src="https://i.ibb.co/YBV0n1Xh/3d-3.webp" className="elegant-shape shape-4" alt="Capsule technologique 3D" loading="lazy" />
        <img src="https://i.ibb.co/hRQSLmLk/3d-0.webp" className="elegant-shape shape-5" alt="Forme néon d'arrière-plan 3D" loading="lazy" />
      </div>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="top-announcement">
        <span>⚡ VAULTIC // SA V2.4 — APPLICATION LOGICIEL WINDOWS & MOBILE DISPONIBLE</span>
      </div>

      {/* NAVBAR */}
      <header className="theme-navbar">
        <div className="nav-container">
          <Link to="/" className="theme-logo">
            <div className="logo-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="brand-titles-nav">
              <span className="logo-title">VAULTIC</span>
              <span className="logo-badge-sa">SA</span>
            </div>
          </Link>

          <nav className="nav-menu">
            <a href="#features">Fonctionnalités</a>
            <a href="#security">Sécurité</a>
            <a href="#download">Télécharger</a>
            <a href="#faq">FAQ</a>
            {isAuthenticated && <Link to="/admin" className="nav-admin-link">⚙ Admin</Link>}
          </nav>

          <div className="nav-cta-group">
            <Link to={destinationVault} className="btn-nav-vault">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{isAuthenticated ? "Accéder au Coffre" : "Ouvrir le Coffre"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="theme-hero">
        <div className="gradient-bg"></div>
        <div className="hero-container">
          {/* BADGE CAPSULE */}
          <div className="theme-hero-badge">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>VAULTIC // SA • SÉCURITÉ ZERO-KNOWLEDGE</span>
          </div>

          <h1 className="hero-headline">
            Le coffre-fort numérique <br />
            <span className="gradient-text">hors du commun.</span>
          </h1>

          <p className="hero-subtext">
            Chiffrez vos mots de passe personnels avec un chiffrement militaire AES-256-GCM
            directement sur votre appareil. Zéro compromis, zéro tracking, vos secrets
            restent exclusivement vôtres.
          </p>

          <div className="hero-cta-buttons">
            <a href="#download" className="theme-btn-primary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>Version Logiciel Windows (.exe)</span>
            </a>

            <Link to={destinationVault} className="theme-btn-secondary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span>Accéder au Coffre en ligne</span>
            </Link>
          </div>

          {/* STATS ITEMS */}
          <div className="hero-stats-row">
            <div className="stat-box">
              <div className="stat-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">100%</div>
                <div className="stat-desc">Client-Side Chiffré</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">AES-256</div>
                <div className="stat-desc">Standard Militaire GCM</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">Multi-Plateforme</div>
                <div className="stat-desc">PC, Mobile & Web</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FEATURES */}
      <section id="features" className="theme-features-section">
        <div className="section-container">
          <div className="section-header">
            <div className="theme-hero-badge small">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <span>FONCTIONNALITÉS VAULTIC</span>
            </div>
            <h2>Une protection digne d'une agence de sécurité</h2>
            <p>Construit sur des fondations cryptographiques irréprochables pour sécuriser tous vos accès.</p>
          </div>

          <div className="features-grid-3">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>Zero-Knowledge Total</h3>
              <p>Votre mot de passe maître n'est jamais transmis au serveur. Vous seul détenez la clé mathématique pour déchiffrer votre coffre.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Chiffrement AES-256-GCM</h3>
              <p>Chaque entrée est chiffrée avec un nonce aléatoire unique généré par l'API Web Crypto native du système.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Déverrouillage Rapide par PIN</h3>
              <p>Clavier visuel anti-keylogger ou mot de passe maître classique : déverrouillez votre coffre en une fraction de seconde.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <h3>Générateur Blindé ⚡</h3>
              <p>Créez d'un clic des mots de passe ultra-résistants et visualisez la jauge de solidité en temps réel.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3>Logiciel Windows Dédié</h3>
              <p>Lancez Vaultic en tant que logiciel autonome Windows sans avoir besoin d'ouvrir votre navigateur.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>Panneau d'Administration Intégré</h3>
              <p>Surveillez les comptes enregistrés, gérez les IP suspectes et contrôlez les inscriptions en temps réel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TÉLÉCHARGEMENT WINDOWS */}
      <section id="download" className="theme-download-section">
        <div className="download-card-banner">
          <div className="download-badge">LOGICIEL INSTALLABLE PC & MOBILE</div>
          <h2>Obtenez Vaultic sur votre ordinateur et téléphone</h2>
          <p>
            Profitez de toute la puissance du coffre-fort numérique directement
            sur votre machine avec un lancement ultra-rapide.
          </p>
          <div className="download-actions">
            <a href="/lancer-logiciel-vaultic.bat" download className="theme-btn-primary large">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>Lancer en mode Logiciel Windows (.exe)</span>
            </a>
            <Link to={destinationVault} className="theme-btn-secondary">
              <span>Tester la version en ligne</span>
            </Link>
          </div>
          <span className="download-compat">Compatible Windows 10 & 11 • Version Mobile PWA pour iPhone et Android</span>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section id="faq" className="theme-faq-section">
        <div className="section-container">
          <div className="section-header">
            <div className="theme-hero-badge small">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>EXPLICATIONS & RÉPONSES</span>
            </div>
            <h2>Vous avez des questions ?</h2>
            <p>Voici tout ce que vous devez savoir sur le fonctionnement, l'installation et la sécurité de Vaultic.</p>
          </div>

          <div className="faq-accordion">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? "open" : ""}`} onClick={() => toggleFaq(index)}>
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <div className="faq-toggle-icon">{isOpen ? "−" : "+"}</div>
                  </div>
                  {isOpen && <div className="faq-answer"><p>{faq.a}</p></div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="theme-footer">
        <div className="footer-container">
          <div className="footer-brand-side">
            <div className="theme-logo">
              <div className="logo-icon-box small">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="logo-title">VAULTIC</span>
            </div>
            <p className="footer-tagline">
              Le coffre-fort numérique moderne conçu pour préserver votre vie privée et sécuriser vos identifiants.
            </p>
          </div>

          <div className="footer-links-side">
            <div className="footer-col">
              <h4>Navigation</h4>
              <a href="#features">Fonctionnalités</a>
              <a href="#download">Télécharger</a>
              <a href="#faq">Questions fréquentes</a>
            </div>
            <div className="footer-col">
              <h4>Légal & Sécurité</h4>
              <Link to="/privacy">Confidentialité (RGPD)</Link>
              <Link to="/terms">Conditions (CGU)</Link>
              <Link to="/cookies">Traceurs & Cookies</Link>
              <Link to="/legal">Mentions Légales</Link>
            </div>
            <div className="footer-col">
              <h4>Accès</h4>
              <Link to="/login">Connexion</Link>
              <Link to="/register">Créer un compte</Link>
              <Link to="/dashboard">Mon Coffre</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vaultic (Vaultic / SA). Tous droits réservés.</span>
          <div className="footer-legal-links">
            <Link to="/privacy">Données personnelles</Link>
            <span>•</span>
            <Link to="/cookies">Cookies</Link>
            <span>•</span>
            <Link to="/legal">Mentions légales</Link>
          </div>
          <span className="footer-security-note">Chiffrement AES-256-GCM certifié Zero-Knowledge.</span>
        </div>
      </footer>
    </div>
  );
}
