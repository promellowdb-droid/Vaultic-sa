import { db } from "../db/connection.js";

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

export function checkBannedIp(req, res, next) {
  const clientIp = getClientIp(req);

  const banned = db
    .prepare("SELECT ip, reason FROM banned_ips WHERE ip = ?")
    .get(clientIp);

  if (banned) {
    return res.status(403).json({
      error: `Votre adresse IP (${clientIp}) a été bannie par l'administrateur. Motif : ${
        banned.reason || "Non spécifié"
      }`,
    });
  }

  req.clientIp = clientIp;
  next();
}
