import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import { getReviews, addReview, deleteReview } from "../controllers/review.controller.js";

export const reviewRouter = Router();

// GET public — tout le monde peut lire les avis
reviewRouter.get("/", getReviews);

// POST authentifié — il faut être connecté pour laisser un avis
reviewRouter.post("/", requireAuth, addReview);

// DELETE admin — supprimer un avis (réservé à l'admin via le routeur admin)
reviewRouter.delete("/:id", requireAuth, deleteReview);
