import dotenv from "dotenv";

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  port: Number(required("PORT", "3001")),
  nodeEnv: required("NODE_ENV", "development"),
  isProduction: process.env.NODE_ENV === "production",
  sessionSecret: required("SESSION_SECRET", "vaultic_default_secret_change_in_prod_" + Math.random()),
};