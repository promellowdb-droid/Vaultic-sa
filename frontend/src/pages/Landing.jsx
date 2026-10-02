import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVault } from "../state/VaultContext.jsx";

export default function Landing() {
  const navigate = useNavigate();
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

  // Si l'utilisateur ouvre l'application depuis son écran d'accueil mobile (PWA),
  // on l'envoie directement sur la page de connexion / coffre sans afficher la vitrine web.
  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (isStandalone) {
      navigate(destinationVault, { replace: true });
    }
  }, [navigate, destinationVault]);

  const faqs = [
    {
      q: "Qu'est-ce que Vaultic ?",
      a: "Vaultic est un gestionnaire de mots de passe moderne et confidentiel. Il vous permet de stocker, générer et retrouver tous vos identifiants en un clic sur votre ordinateur et votre smartphone.",
    },
    {
      q: "Mes mots de passe sont-ils vraiment protégés ?",
      a: "Oui, totalement. Vos données sont protégées par une technologie de confidentialité absolue. Personne d'autre que vous n'a accès à vos identifiants.",
    },
    {
      q: "Comment installer Vaultic sur mon ordinateur (Windows) ?",
      a: "Vous pouvez lancer Vaultic directement comme une application Windows autonome sans ouvrir votre navigateur grâce au logiciel dédié disponible sur PC.",
    },
    {
      q: "Comment installer Vaultic sur mon téléphone (iPhone & Android) ?",
      a: "Ouvrez vaultic-sa.fr sur votre téléphone, appuyez sur 'Partager' (Safari) ou sur les options (Chrome), puis sélectionnez 'Ajouter à l'écran d'accueil'. L'application s'ouvre alors directement sans passer par le web !",
    },
    {
      q: "Puis-je personnaliser l'apparence de mon coffre ?",
      a: "Oui ! Depuis votre coffre, l'onglet Paramètres vous permet de choisir votre ambiance et votre couleur préférée.",
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
        <span>⚡ VAULTIC — VOTRE GESTIONNAIRE DE MOTS DE PASSE PERSONNEL</span>
      </div>

      {/* NAVBAR */}
      <header className="theme-navbar">
        <div className="nav-container">
          <Link to="/" className="theme-logo" aria-label="Accueil Vaultic">
            <div className="logo-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="brand-titles-nav">
              <span className="logo-title">VAULTIC</span>
              <span className="logo-badge-sa">PRO</span>
            </div>
          </Link>

          <nav className="nav-menu" aria-label="Navigation principale">
            <a href="#features">Fonctionnalités</a>
            <a href="#pricing">Offres & Tarifs</a>
            <a href="#download">Télécharger</a>
            <a href="#faq">FAQ</a>
            {isAuthenticated && <Link to="/admin" className="nav-admin-link">⚙ Admin</Link>}
          </nav>

          <div className="nav-cta-group">
            <a href="/download/windows" className="btn-nav-download" title="Télécharger le logiciel Windows">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>Logiciel .exe</span>
            </a>
            <Link to={destinationVault} className="btn-nav-vault">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{isAuthenticated ? "Mon Coffre" : "Se connecter"}</span>
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
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>CONFIDENTIALITÉ & SÉCURITÉ GARANTIES</span>
          </div>

          <h1 className="hero-headline">
            Tous vos mots de passe. <br />
            <span className="gradient-text">En toute sécurité, partout.</span>
          </h1>

          <p className="hero-subtext">
            Vaultic protège vos identifiants, codes et données sensibles sur tous vos appareils.
            Simple, rapide et 100% confidentiel.
          </p>

          <div className="hero-cta-buttons">
            <a href="/download/windows" className="theme-btn-primary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>Télécharger pour Windows (.exe)</span>
            </a>

            <Link to={destinationVault} className="theme-btn-secondary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Ouvrir dans le navigateur</span>
            </Link>
          </div>

          {/* STATS ITEMS */}
          <div className="hero-stats-row">
            <div className="stat-box">
              <div className="stat-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">100%</div>
                <div className="stat-desc">Confidentialité Totale</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">Protection</div>
                <div className="stat-desc">Données Inviolables</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-circle">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">Multi-Écrans</div>
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
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <span>FONCTIONNALITÉS ESSENTIELLES</span>
            </div>
            <h2>Une protection simple pour tous vos comptes</h2>
            <p>Tout ce dont vous avez besoin pour naviguer l'esprit serein au quotidien.</p>
          </div>

          <div className="features-grid-3">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>Confidentialité Absolue</h3>
              <p>Vos mots de passe restent strictement confidentiels. Vous seul détenez l'accès à vos données personnelles.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Sécurité de Pointe</h3>
              <p>Protection moderne et robuste garantissant l'intégrité de vos informations sensibles contre toute tentative d'intrusion.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Déverrouillage Rapide</h3>
              <p>Accédez à votre coffre en un instant avec votre mot de passe ou votre code personnalisé.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <h3>Générateur Intelligent</h3>
              <p>Générez en un clic des mots de passe robustes et uniques pour chacun de vos services web.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3>Disponible en Logiciel</h3>
              <p>Installez Vaultic comme un véritable logiciel indépendant sur votre ordinateur Windows.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>Synchronisation Directe</h3>
              <p>Retrouvez vos comptes à jour en temps réel sur tous vos écrans en toute fluidité.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION OFFRES & TARIFS (STYLE APPLE MODERNE) */}
      <section id="pricing" className="theme-pricing-section">
        <div className="section-container">
          <div className="section-header">
            <div className="theme-hero-badge small">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>NOS OFFRES & TARIFS</span>
            </div>
            <h2>Une formule claire pour chaque besoin</h2>
            <p>Profitez d'une protection de haut niveau pour vos accès personnels et professionnels.</p>
          </div>

          <div className="pricing-grid-3">
            {/* OFFRE PERSONNELLE */}
            <div className="pricing-card">
              <div className="pricing-header">
                <span className="pricing-pill">Pour 1 personne</span>
                <h3>Personnelle</h3>
                <p className="pricing-desc">Pour sécuriser tous vos comptes et appareils personnels au quotidien.</p>
                <div className="pricing-price-box">
                  <span className="price-amount">0 €</span>
                  <span className="price-period">/ toujours gratuit</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> Mots de passe illimités</li>
                <li><span className="check-icon">✓</span> 1 utilisateur individuel</li>
                <li><span className="check-icon">✓</span> Synchronisation PC, Mobile & Web</li>
                <li><span className="check-icon">✓</span> Générateur de mots de passe forts</li>
                <li><span className="check-icon">✓</span> Déverrouillage rapide par code</li>
                <li><span className="check-icon">✓</span> Confidentialité totale garantie</li>
              </ul>

              <Link to="/register" className="btn-pricing-secondary">
                Démarrer gratuitement
              </Link>
            </div>

            {/* OFFRE MICRO-ENTREPRISE */}
            <div className="pricing-card featured">
              <div className="pricing-badge-popular">Offre de lancement</div>
              <div className="pricing-header">
                <span className="pricing-pill">Freelances & Indépendants</span>
                <h3>Micro-Entreprise</h3>
                <p className="pricing-desc">Idéal pour les indépendants et professionnels ayant besoin d'une sécurité renforcée.</p>
                <div className="pricing-price-box">
                  <span className="price-amount">0 €</span>
                  <span className="price-period">/ Gratuit avant le 10 novembre</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> Tout ce qui est inclus dans Personnelle</li>
                <li><span className="check-icon">✓</span> Compartimentation Pro & Personnel</li>
                <li><span className="check-icon">✓</span> Journal d'accès sécurisé</li>
                <li><span className="check-icon">✓</span> Support prioritaire par courriel</li>
                <li><span className="check-icon">✓</span> Accès anticipé aux nouveautés</li>
              </ul>

              <Link to="/register" className="btn-pricing-primary">
                Profiter de l'offre
              </Link>
            </div>

            {/* OFFRE ENTREPRISE */}
            <div className="pricing-card">
              <div className="pricing-badge-limited">Accès Anticipé</div>
              <div className="pricing-header">
                <span className="pricing-pill">Équipes & Sociétés</span>
                <h3>Entreprise</h3>
                <p className="pricing-desc">Gestion centralisée et supervision avancée pour toute votre structure.</p>
                <div className="pricing-price-box">
                  <span className="price-amount">0 €</span>
                  <span className="price-period">/ Gratuit jusqu'au 10 décembre</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> Tout ce qui est inclus dans Micro-Entreprise</li>
                <li><span className="check-icon">✓</span> Gestion centralisée multi-utilisateurs</li>
                <li><span className="check-icon">✓</span> Console d'administration dédiée</li>
                <li><span className="check-icon">✓</span> Filtrage et contrôle d'adresses IP</li>
                <li><span className="check-icon">✓</span> Assistance et onboarding prioritaire</li>
              </ul>

              <Link to="/register" className="btn-pricing-secondary">
                Rejoindre l'accès anticipé
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION TÉLÉCHARGEMENT */}
      <section id="download" className="theme-download-section">
        <div className="download-card-banner">
          <div className="download-badge">APPLICATION INSTALLABLE PC & MOBILE</div>
          <h2>Téléchargez Vaultic sur tous vos appareils</h2>
          <p>
            Installez notre application Windows officielle ou ajoutez Vaultic à votre smartphone
            en un instant pour un accès rapide sans ouvrir votre navigateur.
          </p>
          <div className="download-actions">
            <a href="/download/windows" className="theme-btn-primary large">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>Télécharger pour Windows (.exe)</span>
            </a>
            <Link to={destinationVault} className="theme-btn-secondary">
              <span>Utiliser la version Web</span>
            </Link>
          </div>
          <span className="download-compat">Compatible Windows 10 & 11 • Version Mobile pour iPhone et Android</span>
        </div>
      </section>

      {/* SECTION FAQ */}
      <section id="faq" className="theme-faq-section">
        <div className="section-container">
          <div className="section-header">
            <div className="theme-hero-badge small">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>QUESTIONS FRÉQUENTES</span>
            </div>
            <h2>Foire Aux Questions</h2>
            <p>Tout ce que vous devez savoir pour démarrer simplement avec Vaultic.</p>
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="logo-title">VAULTIC</span>
            </div>
            <p className="footer-tagline">
              La solution simple et sécurisée pour gérer tous vos mots de passe au quotidien.
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
              <Link to="/privacy">Confidentialité</Link>
              <Link to="/terms">Conditions d'utilisation</Link>
              <Link to="/cookies">Cookies</Link>
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
          <span>© {new Date().getFullYear()} Vaultic. Tous droits réservés.</span>
          <div className="footer-legal-links">
            <Link to="/privacy">Données personnelles</Link>
            <span>•</span>
            <Link to="/cookies">Cookies</Link>
            <span>•</span>
            <Link to="/legal">Mentions légales</Link>
          </div>
          <span className="footer-security-note">Confidentialité et sécurité garanties.</span>
        </div>
      </footer>
    </div>
  );
}
