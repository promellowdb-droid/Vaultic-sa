import { db } from "../db/connection.js";

// GET /api/reviews — public, récupère tous les avis (les plus récents en premier)
export function getReviews(req, res) {
  const reviews = db
    .prepare(`
      SELECT id, username, rating, content, created_at
      FROM reviews
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all();

  const avg = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  res.json({ reviews, average: avg, total: reviews.length });
}

// POST /api/reviews — authentifié, l'utilisateur soumet un avis
export function addReview(req, res) {
  const { rating, content } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "Vous devez être connecté pour laisser un avis." });
  }

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "La note doit être comprise entre 1 et 5." });
  }

  if (!content || content.trim().length < 10) {
    return res.status(400).json({ error: "Votre avis doit contenir au moins 10 caractères." });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({ error: "Votre avis ne peut pas dépasser 500 caractères." });
  }

  const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable." });

  // Un utilisateur ne peut laisser qu'un seul avis — on remplace s'il en a déjà un
  const existing = db.prepare("SELECT id FROM reviews WHERE user_id = ?").get(userId);

  if (existing) {
    db.prepare("UPDATE reviews SET rating = ?, content = ?, created_at = datetime('now') WHERE user_id = ?")
      .run(Number(rating), content.trim(), userId);
    return res.json({ status: "ok", message: "Votre avis a été mis à jour." });
  }

  db.prepare("INSERT INTO reviews (user_id, username, rating, content) VALUES (?, ?, ?, ?)")
    .run(userId, user.username, Number(rating), content.trim());

  res.json({ status: "ok", message: "Votre avis a été publié. Merci !" });
}

// DELETE /api/reviews/:id — admin uniquement, supprimer un avis
export function deleteReview(req, res) {
  const { id } = req.params;
  db.prepare("DELETE FROM reviews WHERE id = ?").run(Number(id));
  res.json({ status: "ok", message: "Avis supprimé." });
}
