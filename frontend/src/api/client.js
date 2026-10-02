// Détection propre de l'API : port 5173 en dev local, sinon chemin relatif /api sur le domaine de production
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port === "5173"
  ? "http://localhost:3001/api"
  : "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erreur ${response.status}`);
  }

  return data;
}

export const api = {
  register: (username, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  getVaultStatus: () =>
    request("/vault/status", {
      method: "GET",
    }),

  storeVaultKey: (encryptedVaultKey, nonce, unlockType) =>
    request("/vault/key", {
      method: "POST",
      body: JSON.stringify({
        encryptedVaultKey,
        nonce,
        unlockType,
      }),
    }),

  getVaultKey: () =>
    request("/vault/key", {
      method: "GET",
    }),

  getEntries: () =>
    request("/vault/entries", {
      method: "GET",
    }),

  createEntry: (encryptedData, nonce) =>
    request("/vault/entries", {
      method: "POST",
      body: JSON.stringify({
        encryptedData,
        nonce,
      }),
    }),

  updateEntry: (id, encryptedData, nonce) =>
    request(`/vault/entries/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        encryptedData,
        nonce,
      }),
    }),

  deleteEntry: (id) =>
    request(`/vault/entries/${id}`, {
      method: "DELETE",
    }),

  // API Administration
  getAdminStats: () =>
    request("/admin/stats", {
      method: "GET",
    }),

  getAdminUsers: () =>
    request("/admin/users", {
      method: "GET",
    }),

  getBannedIps: () =>
    request("/admin/banned-ips", {
      method: "GET",
    }),

  banIp: (ip, reason) =>
    request("/admin/ban-ip", {
      method: "POST",
      body: JSON.stringify({ ip, reason }),
    }),

  unbanIp: (ip) =>
    request("/admin/unban-ip", {
      method: "POST",
      body: JSON.stringify({ ip }),
    }),

  toggleRegistrations: (enabled) =>
    request("/admin/toggle-registrations", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),
};