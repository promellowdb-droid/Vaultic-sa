import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVault } from "../state/VaultContext.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import ReviewsSection from "../components/ReviewsSection.jsx";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isUnlocked } = useVault();
  const { t, lang } = useLanguage();

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const faqs = lang === "en" ? [
    {
      q: "What is Vaultic?",
      a: "Vaultic is a modern, confidential password manager. It allows you to store, generate, and retrieve all your credentials in one click across desktop and mobile devices.",
    },
    {
      q: "Are my passwords truly protected?",
      a: "Yes, completely. Your data is protected by mathematical end-to-end security. Nobody else has access to your credentials.",
    },
    {
      q: "How do I install Vaultic on Windows?",
      a: "You can download and run Vaultic directly as a standalone Windows application without needing to open your web browser.",
    },
    {
      q: "How do I install Vaultic on my phone (iPhone & Android)?",
      a: "Open vaultic-sa.fr on your phone, tap 'Share' (Safari) or menu options (Chrome), then tap 'Add to Home Screen'. The app will launch directly into your vault!",
    },
    {
      q: "Can I customize the vault appearance?",
      a: "Yes! In your vault settings, you can pick your favorite neon accent color and dark mode theme.",
    },
  ] : [
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
      {/* 3D FLOATING SHAPES DU THEME */}
      <div className="shapes-container" aria-hidden="true">
        <img src="https://i.ibb.co/hRQSLmLk/3d-0.webp" className="elegant-shape shape-1" alt="" loading="lazy" />
        <img src="https://i.ibb.co/M4JkzKd/3d-1.webp" className="elegant-shape shape-2" alt="" loading="lazy" />
        <img src="https://i.ibb.co/Xxt3c2nt/3d-2.webp" className="elegant-shape shape-3" alt="" loading="lazy" />
        <img src="https://i.ibb.co/YBV0n1Xh/3d-3.webp" className="elegant-shape shape-4" alt="" loading="lazy" />
        <img src="https://i.ibb.co/hRQSLmLk/3d-0.webp" className="elegant-shape shape-5" alt="" loading="lazy" />
      </div>

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="top-announcement">
        <span>{t("topAnnouncement")}</span>
      </div>

      {/* NAVBAR */}
      <header className="theme-navbar">
        <div className="nav-container">
          <Link to="/" className="theme-logo" aria-label="Accueil Vaultic">
            <div className="logo-icon-box">
              <img src="/logo.png" alt="Vaultic logo" style={{width:'34px',height:'34px',objectFit:'contain'}} />
            </div>
            <div className="brand-titles-nav">
              <span className="logo-title">VAULTIC</span>
              <span className="logo-badge-sa">SA</span>
            </div>
          </Link>

          <nav className="nav-menu" aria-label="Navigation principale">
            <a href="#features">{t("navFeatures")}</a>
            <a href="#pricing">{t("navPricing")}</a>
            <a href="#download">{t("navDownload")}</a>
            <a href="#avis">Avis</a>
            <a href="#faq">{t("navFaq")}</a>
            {isAuthenticated && <Link to="/admin" className="nav-admin-link">{t("navAdmin")}</Link>}
          </nav>

          <div className="nav-cta-group">
            {/* SÉLECTEUR DE LANGUE (FR / EN) */}
            <LanguageSwitcher />

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-nav-login">
                  {t("navLogin")}
                </Link>
                <Link to="/register" className="btn-nav-register">
                  Créer un compte
                </Link>
              </>
            ) : (
              <>
                <a href="/download/windows" className="btn-nav-download" title="Télécharger le logiciel Windows">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
                  </svg>
                  <span>{t("navDownloadExe")}</span>
                </a>
                <Link to="/dashboard" className="btn-nav-vault">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>{t("navMyVault")}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="theme-hero">
        <div className="gradient-bg"></div>
        <div className="hero-container">
          <div className="theme-hero-badge">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>{t("heroBadge")}</span>
          </div>

          <h1 className="hero-headline">
            {t("heroTitleLine1")} <br />
            <span className="gradient-text">{t("heroTitleLine2")}</span>
          </h1>

          <p className="hero-subtext">
            {t("heroSubtext")}
          </p>

          <div className="hero-cta-buttons">
            <a href="/download/windows" className="theme-btn-primary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>{t("heroBtnDownloadExe")}</span>
            </a>

            <Link to={destinationVault} className="theme-btn-secondary">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{t("heroBtnWeb")}</span>
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
                <div className="stat-number">{t("stat1Number")}</div>
                <div className="stat-desc">{t("stat1Desc")}</div>
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
                <div className="stat-number">{t("stat2Number")}</div>
                <div className="stat-desc">{t("stat2Desc")}</div>
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
                <div className="stat-number">{t("stat3Number")}</div>
                <div className="stat-desc">{t("stat3Desc")}</div>
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
              <span>{t("featuresBadge")}</span>
            </div>
            <h2>{t("featuresTitle")}</h2>
            <p>{t("featuresSub")}</p>
          </div>

          <div className="features-grid-3">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3>{t("feature1Title")}</h3>
              <p>{t("feature1Desc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>{t("feature2Title")}</h3>
              <p>{t("feature2Desc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>{t("feature3Title")}</h3>
              <p>{t("feature3Desc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <h3>{t("feature4Title")}</h3>
              <p>{t("feature4Desc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3>{t("feature5Title")}</h3>
              <p>{t("feature5Desc")}</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>{t("feature6Title")}</h3>
              <p>{t("feature6Desc")}</p>
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
              <span>{t("pricingBadge")}</span>
            </div>
            <h2>{t("pricingTitle")}</h2>
            <p>{t("pricingSub")}</p>
          </div>

          <div className="pricing-grid-3">
            {/* OFFRE PERSONNELLE */}
            <div className="pricing-card">
              <div className="pricing-header">
                <span className="pricing-pill">{t("planPersonalTarget")}</span>
                <h3>{t("planPersonalTitle")}</h3>
                <p className="pricing-desc">{t("planPersonalDesc")}</p>
                <div className="pricing-price-box">
                  <span className="price-amount">{t("planPersonalPrice")}</span>
                  <span className="price-period">{t("planPersonalPeriod")}</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> {t("planPersonalF1")}</li>
                <li><span className="check-icon">✓</span> {t("planPersonalF2")}</li>
                <li><span className="check-icon">✓</span> {t("planPersonalF3")}</li>
                <li><span className="check-icon">✓</span> {t("planPersonalF4")}</li>
                <li><span className="check-icon">✓</span> {t("planPersonalF5")}</li>
                <li><span className="check-icon">✓</span> {t("planPersonalF6")}</li>
              </ul>

              <button
                type="button"
                onClick={() => setSelectedPlan(t("planPersonalTitle"))}
                className="btn-pricing-secondary"
              >
                {t("planPersonalBtn")}
              </button>
            </div>

            {/* OFFRE MICRO-ENTREPRISE */}
            <div className="pricing-card featured">
              <div className="pricing-badge-popular">{t("planMicroBadge")}</div>
              <div className="pricing-header">
                <span className="pricing-pill">{t("planMicroTarget")}</span>
                <h3>{t("planMicroTitle")}</h3>
                <p className="pricing-desc">{t("planMicroDesc")}</p>
                <div className="pricing-price-box">
                  <span className="price-amount">{t("planMicroPrice")}</span>
                  <span className="price-period">{t("planMicroPeriod")}</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> {t("planMicroF1")}</li>
                <li><span className="check-icon">✓</span> {t("planMicroF2")}</li>
                <li><span className="check-icon">✓</span> {t("planMicroF3")}</li>
                <li><span className="check-icon">✓</span> {t("planMicroF4")}</li>
                <li><span className="check-icon">✓</span> {t("planMicroF5")}</li>
              </ul>

              <button
                type="button"
                onClick={() => setSelectedPlan(t("planMicroTitle"))}
                className="btn-pricing-primary"
              >
                {t("planMicroBtn")}
              </button>
            </div>

            {/* OFFRE ENTREPRISE */}
            <div className="pricing-card">
              <div className="pricing-badge-limited">{t("planEnterpriseBadge")}</div>
              <div className="pricing-header">
                <span className="pricing-pill">{t("planEnterpriseTarget")}</span>
                <h3>{t("planEnterpriseTitle")}</h3>
                <p className="pricing-desc">{t("planEnterpriseDesc")}</p>
                <div className="pricing-price-box">
                  <span className="price-amount">{t("planEnterprisePrice")}</span>
                  <span className="price-period">{t("planEnterprisePeriod")}</span>
                </div>
              </div>

              <ul className="pricing-features">
                <li><span className="check-icon">✓</span> {t("planEnterpriseF1")}</li>
                <li><span className="check-icon">✓</span> {t("planEnterpriseF2")}</li>
                <li><span className="check-icon">✓</span> {t("planEnterpriseF3")}</li>
                <li><span className="check-icon">✓</span> {t("planEnterpriseF4")}</li>
                <li><span className="check-icon">✓</span> {t("planEnterpriseF5")}</li>
              </ul>

              <button
                type="button"
                onClick={() => setSelectedPlan(t("planEnterpriseTitle"))}
                className="btn-pricing-secondary"
              >
                {t("planEnterpriseBtn")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODALE DE CHOIX D'EXPÉRIENCE (LOGICIEL .EXE VS VERSION WEB) */}
      {selectedPlan && (
        <div className="choice-modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="choice-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="choice-modal-close" onClick={() => setSelectedPlan(null)} aria-label="Fermer la fenêtre">✕</button>

            <div className="choice-modal-header">
              <span className="pricing-pill">
                {t("modalSelectedPrefix")} {selectedPlan} {t("modalSelectedSuffix")}
              </span>
              <h2>{t("modalHeaderTitle")}</h2>
              <p>{t("modalHeaderSub")}</p>
            </div>

            <div className="choice-options-grid">
              {/* OPTION 1 : LOGICIEL WINDOWS .EXE (RECOMMANDÉ) */}
              <div className="choice-card-item highlight">
                <div className="choice-badge-tag">{t("modalOption1Badge")}</div>
                <div className="choice-icon-wrap">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" aria-hidden="true">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
                  </svg>
                </div>
                <h3>{t("modalOption1Title")}</h3>
                <p>{t("modalOption1Desc")}</p>
                <a
                  href="/download/windows"
                  className="btn-modal-action-primary"
                  onClick={() => setSelectedPlan(null)}
                >
                  {t("modalOption1Btn")}
                </a>
              </div>

              {/* OPTION 2 : VERSION WEB */}
              <div className="choice-card-item">
                <div className="choice-icon-wrap">
                  <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h3>{t("modalOption2Title")}</h3>
                <p>{t("modalOption2Desc")}</p>
                <Link
                  to="/register"
                  className="btn-modal-action-secondary"
                  onClick={() => setSelectedPlan(null)}
                >
                  {t("modalOption2Btn")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION TÉLÉCHARGEMENT */}
      <section id="download" className="theme-download-section">
        <div className="download-card-banner">
          <div className="download-badge">{t("downloadBadge")}</div>
          <h2>{t("downloadTitle")}</h2>
          <p>{t("downloadDesc")}</p>
          <div className="download-actions">
            <a href="/download/windows" className="theme-btn-primary large">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
              <span>{t("downloadBtnExe")}</span>
            </a>
            <Link to={destinationVault} className="theme-btn-secondary">
              <span>{t("downloadBtnWeb")}</span>
            </Link>
          </div>
          <span className="download-compat">{t("downloadCompat")}</span>
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
              <span>{t("faqBadge")}</span>
            </div>
            <h2>{t("faqTitle")}</h2>
            <p>{t("faqSub")}</p>
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

      {/* SECTION AVIS UTILISATEURS */}
      <ReviewsSection />

      {/* FOOTER */}
      <footer className="theme-footer">
        <div className="footer-container">
          <div className="footer-brand-side">
          <div className="theme-logo">
              <div className="logo-icon-box small">
                <img src="/logo.png" alt="Vaultic logo" style={{width:'28px',height:'28px',objectFit:'contain'}} />
              </div>
              <span className="logo-title">VAULTIC</span>
            </div>
            <p className="footer-tagline">
              {t("footerTagline")}
            </p>
          </div>

          <div className="footer-links-side">
            <div className="footer-col">
              <h4>{t("footerNavTitle")}</h4>
              <a href="#features">{t("navFeatures")}</a>
              <a href="#pricing">{t("navPricing")}</a>
              <a href="#download">{t("navDownload")}</a>
              <a href="#faq">{t("navFaq")}</a>
            </div>
            <div className="footer-col">
              <h4>{t("footerLegalTitle")}</h4>
              <Link to="/privacy">{t("footerPrivacy")}</Link>
              <Link to="/terms">{t("footerTerms")}</Link>
              <Link to="/cookies">{t("footerCookies")}</Link>
              <Link to="/legal">{t("footerLegal")}</Link>
            </div>
            <div className="footer-col">
              <h4>{t("footerAccessTitle")}</h4>
              <Link to="/login">{t("navLogin")}</Link>
              <Link to="/register">{t("footerCreateAccount")}</Link>
              <Link to="/dashboard">{t("navMyVault")}</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vaultic. {t("footerRights")}</span>
          <div className="footer-legal-links">
            <Link to="/privacy">{t("footerPrivacy")}</Link>
            <span>•</span>
            <Link to="/cookies">{t("footerCookies")}</Link>
            <span>•</span>
            <Link to="/legal">{t("footerLegal")}</Link>
          </div>
          <span className="footer-security-note">{t("footerSecurityNote")}</span>
        </div>
      </footer>
    </div>
  );
}
