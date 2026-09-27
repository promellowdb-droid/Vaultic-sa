import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Legal() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("privacy");

  useEffect(() => {
    if (location.pathname.includes("terms") || location.pathname.includes("cgu")) {
      setActiveTab("terms");
    } else if (location.pathname.includes("cookies")) {
      setActiveTab("cookies");
    } else if (location.pathname.includes("legal") || location.pathname.includes("mentions")) {
      setActiveTab("mentions");
    } else {
      setActiveTab("privacy");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="theme-shop-wrapper legal-page-wrapper">
      {/* NAVBAR */}
      <header className="theme-navbar">
        <div className="nav-container">
          <Link to="/" className="theme-logo" aria-label="Retour à l'accueil Vaultic">
            <div className="logo-icon-box">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div className="brand-titles-nav">
              <span className="logo-title">VAULTIC</span>
              <span className="logo-badge-sa">SA</span>
            </div>
          </Link>

          <nav className="nav-menu" aria-label="Navigation secondaire">
            <Link to="/">Accueil</Link>
            <Link to="/#features">Fonctionnalités</Link>
            <Link to="/#security">Sécurité</Link>
          </nav>

          <div className="nav-cta-group">
            <Link to="/login" className="btn-nav-vault">
              <span>Connexion</span>
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="legal-container">
        <div className="legal-header">
          <div className="theme-hero-badge">
            <span>⚖️ CONFORMITÉ LÉGALE & RGPD</span>
          </div>
          <h1>Transparence, Confidentialité & Mentions Légales</h1>
          <p className="legal-intro">
            Vaultic s'engage à respecter les lois françaises et européennes (RGPD, directives CNIL, loi LCEN 2004-575).
            Notre architecture Zero-Knowledge garantit que votre vie privée n'est pas seulement une promesse, mais une certitude mathématique.
          </p>

          <div className="legal-tabs" role="tablist" aria-label="Sections légales">
            <button
              role="tab"
              aria-selected={activeTab === "privacy"}
              className={`legal-tab-btn ${activeTab === "privacy" ? "active" : ""}`}
              onClick={() => setActiveTab("privacy")}
            >
              🔒 Confidentialité (RGPD)
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "terms"}
              className={`legal-tab-btn ${activeTab === "terms" ? "active" : ""}`}
              onClick={() => setActiveTab("terms")}
            >
              📜 Conditions (CGU)
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "cookies"}
              className={`legal-tab-btn ${activeTab === "cookies" ? "active" : ""}`}
              onClick={() => setActiveTab("cookies")}
            >
              🍪 Cookies (CNIL)
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "mentions"}
              className={`legal-tab-btn ${activeTab === "mentions" ? "active" : ""}`}
              onClick={() => setActiveTab("mentions")}
            >
              🏛️ Mentions Légales
            </button>
          </div>
        </div>

        <div className="legal-content-card">
          {/* TAB 1 : PRIVACY / RGPD */}
          {activeTab === "privacy" && (
            <article className="legal-article">
              <h2>Politique de Confidentialité (Conforme RGPD)</h2>
              <p className="legal-date">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

              <h3>1. Principe Fondamental : Le Chiffrement Zero-Knowledge</h3>
              <p>
                Vaultic est conçu selon le principe de <strong>minimisation absolue des données</strong> (Article 5.1.c du RGPD).
                Contrairement aux services cloud traditionnels, l'intégralité de vos identifiants, mots de passe et données de coffre
                sont chiffrés sur votre appareil (navigateur ou client logiciel) à l'aide d'un algorithme <strong>AES-256-GCM</strong>
                et d'une dérivation de clé <strong>Argon2id</strong>.
              </p>
              <div className="callout-box">
                <strong>Important :</strong> Nous ne possédons ni la clé de déchiffrement, ni votre mot de passe maître.
                Il est techniquement et mathématiquement impossible pour les administrateurs de Vaultic ou des tiers de consulter
                vos mots de passe enregistrés.
              </div>

              <h3>2. Données Strictement Collectées</h3>
              <p>Pour assurer le bon fonctionnement technique et sécuritaire du service, nous traitons uniquement :</p>
              <ul>
                <li><strong>Nom d'utilisateur / Pseudonyme :</strong> Nécessaire pour identifier votre compte.</li>
                <li><strong>Sel cryptographique (Salt) :</strong> Donnée aléatoire publique permettant de dériver votre clé côté client.</li>
                <li><strong>Empreinte cryptographique (Hash de mot de passe) :</strong> Dérivé via Argon2id pour vérifier votre identité sans stocker votre mot de passe réel.</li>
                <li><strong>Blobs chiffrés du coffre :</strong> Les paquets de données chiffrées de vos entrées (inintelligibles pour le serveur).</li>
                <li><strong>Adresse IP technique :</strong> Enregistrée pour prévenir les attaques par force brute, les abus et le spam (intérêt légitime de sécurité, Article 6.1.f RGPD).</li>
              </ul>

              <h3>3. Ce Que Nous Ne Collectons JAMAIS</h3>
              <ul>
                <li>Aucun nom réel, prénom, numéro de téléphone ou adresse postale obligatoire.</li>
                <li>Aucun mot de passe maître ou PIN en clair.</li>
                <li>Aucune donnée bancaire (le service étant actuellement gratuit).</li>
                <li>Aucun traceur publicitaire ou outil de profilage tiers (pas de Google Analytics, Meta Pixel ou TikTok).</li>
              </ul>

              <h3>4. Vos Droits sous le RGPD</h3>
              <p>
                Conformément aux Articles 15 à 21 du Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul>
                <li><strong>Droit d'accès et d'export :</strong> Vous pouvez exporter toutes vos entrées déchiffrées depuis votre tableau de bord.</li>
                <li><strong>Droit de rectification :</strong> Vous pouvez modifier vos entrées et clés à tout moment.</li>
                <li><strong>Droit à l'effacement (« Droit à l'oubli ») :</strong> Vous pouvez demander la suppression définitive de votre compte et de toutes vos données associées.</li>
              </ul>

              <h3>5. Contact DPO & Réclamations</h3>
              <p>
                Pour exercer vos droits ou pour toute question relative à la protection de vos données, vous pouvez contacter l'administrateur à :
                <code> support@vaultic-sa.fr</code>. En cas de litige non résolu, vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés — cnil.fr).
              </p>
            </article>
          )}

          {/* TAB 2 : CGU */}
          {activeTab === "terms" && (
            <article className="legal-article">
              <h2>Conditions Générales d'Utilisation (CGU)</h2>
              <p className="legal-date">En vigueur au : {new Date().toLocaleDateString("fr-FR")}</p>

              <h3>1. Objet du Service</h3>
              <p>
                Vaultic (accessible sur vaultic-sa.fr) est un outil numérique personnel et autonome de gestion sécurisée de mots de passe
                basé sur la cryptographie Zero-Knowledge côté client.
              </p>

              <h3>2. Responsabilité de l'Utilisateur & Mot de Passe Maître</h3>
              <div className="callout-box warning">
                <strong>Attention — Perte irrémédiable :</strong> En raison de la technologie Zero-Knowledge, Vaultic n'a aucun moyen de
                réinitialiser votre mot de passe maître ou votre code PIN. Si vous égarez vos identifiants principaux, vos données chiffrées
                ne pourront pas être restaurées. Vous êtes seul garant de la conservation de votre mot de passe maître.
              </div>

              <h3>3. Modalités Financières & Droit de Rétractation</h3>
              <p>
                <strong>Gratuité du service :</strong> L'accès à Vaultic est actuellement fourni à titre gratuit.
                Par conséquent, les dispositions relatives au droit de rétractation et aux politiques de remboursement
                (Article L221-18 du Code de la consommation) ne s'appliquent pas, aucune transaction financière n'ayant lieu.
                En cas d'évolution future vers des offres payantes, une politique d'annulation et de remboursement conforme sera communiquée avant toute souscription.
              </p>

              <h3>4. Disponibilité & Maintenance</h3>
              <p>
                Nous nous efforçons de maintenir un accès continu 24h/24 et 7j/7 grâce à notre infrastructure cloud Railway.
                Néanmoins, des interruptions temporaires pour maintenance, mises à jour ou cas de force majeure peuvent survenir.
              </p>

              <h3>5. Usage Licite</h3>
              <p>
                L'utilisateur s'engage à ne pas utiliser Vaultic à des fins illégales, malveillantes ou de piratage.
                Toute tentative d'intrusion ou de dégradation du système entraînera le bannissement immédiat de l'adresse IP et d'éventuelles poursuites judiciaires.
              </p>
            </article>
          )}

          {/* TAB 3 : COOKIES */}
          {activeTab === "cookies" && (
            <article className="legal-article">
              <h2>Politique relative aux Cookies & Traceurs</h2>
              <p className="legal-date">Directive ePrivacy & Recommandations CNIL</p>

              <div className="callout-box success">
                <strong>Statut de conformité CNIL :</strong> Aucune bannière intrusive de consentement (« bandeau cookies ») n'est nécessaire
                sur Vaultic. Voici pourquoi en toute transparence :
              </div>

              <h3>1. Pourquoi n'y a-t-il pas de bandeau de cookies ?</h3>
              <p>
                Conformément aux délibérations de la <strong>CNIL</strong> et à l'article 82 de la loi Informatique et Libertés,
                les traceurs strictement nécessaires à la fourniture d'un service de communication en ligne expressément demandé par l'utilisateur
                sont <strong>dispensés de consentement préalable</strong>.
              </p>

              <h3>2. Liste Exhaustive des Cookies Utilisés</h3>
              <table className="legal-table">
                <thead>
                  <tr>
                    <th>Nom du cookie</th>
                    <th>Finalité</th>
                    <th>Durée</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>connect.sid</code></td>
                    <td>Maintien de la session d'authentification sécurisée de l'utilisateur connecté</td>
                    <td>Session (effacé à la déconnexion ou fermeture)</td>
                    <td>Technique (Exempté)</td>
                  </tr>
                </tbody>
              </table>

              <h3>3. Traceurs Tiers & Publicitaires</h3>
              <p>
                Vaultic contient <strong>0 tracker tiers</strong>, <strong>0 cookie publicitaire</strong> et <strong>0 outil d'analyse comportementale externe</strong>.
                Aucune de vos activités n'est vendue, partagée ou pistée à travers le web.
              </p>
            </article>
          )}

          {/* TAB 4 : MENTIONS LÉGALES */}
          {activeTab === "mentions" && (
            <article className="legal-article">
              <h2>Mentions Légales (Loi LCEN n° 2004-575)</h2>

              <h3>1. Éditeur de l'Application & du Site</h3>
              <p>
                Le site et service <strong>Vaultic (Vaultic / SA)</strong>, accessible à l'adresse <code>https://vaultic-sa.fr</code>,
                est développé et administré par l'équipe projet Vaultic.
              </p>
              <p>
                <strong>Courriel de contact :</strong> <code>support@vaultic-sa.fr</code>
              </p>

              <h3>2. Hébergeur de l'Infrastructure</h3>
              <p>
                L'application, l'API et la base de données sont hébergées par :
              </p>
              <div className="host-card">
                <strong>Railway Corp.</strong><br />
                548 Market St, PMB 69022, San Francisco, CA 94104, USA<br />
                Site web : <a href="https://railway.app" target="_blank" rel="noopener noreferrer">https://railway.app</a>
              </div>

              <h3>3. Enregistrement du Nom de Domaine</h3>
              <p>
                Le nom de domaine <code>vaultic-sa.fr</code> est enregistré auprès de :
              </p>
              <div className="host-card">
                <strong>IONOS SARL</strong><br />
                7 Place de la Gare, 57200 Sarreguemines, France<br />
                Site web : <a href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer">https://www.ionos.fr</a>
              </div>

              <h3>4. Propriété Intellectuelle</h3>
              <p>
                L'ensemble des composants graphiques, interfaces, logotypes et codes sources de Vaultic sont protégés par le droit d'auteur.
                Toute reproduction sans accord préalable est interdite.
              </p>
            </article>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="theme-footer">
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vaultic (Vaultic / SA). Conforme RGPD & CNIL.</span>
          <Link to="/" style={{ color: "var(--theme-color)", textDecoration: "none" }}>Retour à l'accueil</Link>
        </div>
      </footer>
    </div>
  );
}
