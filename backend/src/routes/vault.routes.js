import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.middleware.js";
import {
  storeVaultKey,
  getVaultKey,
  getVaultStatus,
  createEntry,
  listEntries,
  updateEntry,
  deleteEntry,
} from "../controllers/vault.controller.js";

export const vaultRouter = Router();

vaultRouter.use(requireAuth);

vaultRouter.get("/status", getVaultStatus);
vaultRouter.post("/key", storeVaultKey);
vaultRouter.get("/key", getVaultKey);

vaultRouter.post("/entries", createEntry);
vaultRouter.get("/entries", listEntries);
vaultRouter.put("/entries/:id", updateEntry);
vaultRouter.delete("/entries/:id", deleteEntry);