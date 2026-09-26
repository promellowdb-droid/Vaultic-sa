import { createContext, useContext, useState, useCallback } from "react";

const VaultContext = createContext(null);

export function VaultProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [masterKeySalt, setMasterKeySalt] = useState(null);
  const [vaultKey, setVaultKeyState] = useState(null); // Uint8Array — en mémoire uniquement, jamais persisté

  const setSession = useCallback((user) => {
    setUserId(user.id);
    setUsername(user.username);
    setMasterKeySalt(user.masterKeySalt);
  }, []);

  const unlock = useCallback((key) => {
    setVaultKeyState(key);
  }, []);

  const lock = useCallback(() => {
    setVaultKeyState(null); // efface la clé de la mémoire JS
  }, []);

  const clearSession = useCallback(() => {
    setUserId(null);
    setUsername(null);
    setMasterKeySalt(null);
    setVaultKeyState(null);
  }, []);

  const value = {
    userId,
    username,
    masterKeySalt,
    vaultKey,
    isAuthenticated: !!userId,
    isUnlocked: !!vaultKey,
    setSession,
    unlock,
    lock,
    clearSession,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault doit être utilisé à l'intérieur d'un VaultProvider");
  return ctx;
}