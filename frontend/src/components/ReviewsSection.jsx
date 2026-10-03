import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useVault } from "../state/VaultContext.jsx";

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" aria-label={`Note: ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readOnly ? "button" : "button"}
          disabled={readOnly}
          className={`star-btn ${(hovered || value) >= star ? "star-filled" : "star-empty"}`}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          onClick={() => !readOnly && onChange && onChange(star)}
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Génère une couleur de fond unique basée sur le nom d'utilisateur
  const colors = ["#6571FF", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];
  const colorIndex = review.username.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-avatar" style={{ background: avatarColor }}>
          {review.username.charAt(0).toUpperCase()}
        </div>
        <div className="review-meta">
          <span className="review-username">{review.username}</span>
          <span className="review-date">{date}</span>
        </div>
        <StarRating value={review.rating} readOnly />
      </div>
      <p className="review-content">{review.content}</p>
    </div>
  );
}

export default function ReviewsSection() {
  const { isAuthenticated } = useVault();
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Formulaire
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadReviews() {
    try {
      const data = await api.getReviews();
      setReviews(data.reviews || []);
      setAverage(data.average);
      setTotal(data.total);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.addReview(rating, content);
      setSuccess(res.message);
      setContent("");
      setRating(5);
      setShowForm(false);
      loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="reviews-section" id="avis">
      <div className="reviews-header">
        <h2 className="reviews-title">Ce que disent nos utilisateurs</h2>
        <p className="reviews-subtitle">
          Des milliers de personnes font confiance à Vaultic pour protéger leurs accès.
        </p>

        {/* Résumé note globale */}
        {total > 0 && (
          <div className="reviews-summary">
            <span className="reviews-avg-score">{average}</span>
            <div className="reviews-avg-stars">
              <StarRating value={Math.round(Number(average))} readOnly />
              <span className="reviews-total-count">{total} avis</span>
            </div>
          </div>
        )}
      </div>

      {/* Bouton laisser un avis */}
      <div className="reviews-action-row">
        {isAuthenticated ? (
          <button
            className="btn-leave-review"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Annuler" : "✍️ Laisser un avis"}
          </button>
        ) : (
          <Link to="/login" className="btn-leave-review">
            🔐 Connectez-vous pour laisser un avis
          </Link>
        )}
      </div>

      {/* Formulaire de dépôt d'avis */}
      {showForm && isAuthenticated && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-rating">
            <label>Votre note :</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            className="review-textarea"
            placeholder="Partagez votre expérience avec Vaultic… (min. 10 caractères)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            required
          />
          <div className="review-form-footer">
            <span className="review-char-count">{content.length}/500</span>
            {error && <span className="review-error">{error}</span>}
            {success && <span className="review-success">{success}</span>}
            <button
              type="submit"
              className="btn-submit-review"
              disabled={submitting}
            >
              {submitting ? "Publication…" : "Publier mon avis"}
            </button>
          </div>
        </form>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="reviews-loading">Chargement des avis…</div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">
          <p>Soyez le premier à laisser un avis ! 🌟</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </section>
  );
}
