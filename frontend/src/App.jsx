import { Routes, Route, Navigate } from "react-router-dom";
import { useVault } from "./state/VaultContext.jsx";
import Landing from "./pages/Landing.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import CreateMasterSecret from "./pages/CreateMasterSecret.jsx";
import CreatePin from "./pages/CreatePin.jsx";
import CreateMasterPassword from "./pages/CreateMasterPassword.jsx";
import UnlockVault from "./pages/UnlockVault.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import Legal from "./pages/Legal.jsx";
import WebOnly from "./pages/WebOnly.jsx";
import DownloadApp from "./pages/DownloadApp.jsx";

// Détecte si l'utilisateur est dans l'application de bureau Vaultic
function isDesktopApp() {
  return (
    navigator.userAgent.includes("VaulticDesktop") ||
    navigator.userAgent.includes("VaulticAdmin") ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone
  );
}

function RequireSession({ children }) {
  const { isAuthenticated } = useVault();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RequireUnlocked({ children }) {
  const { isAuthenticated, isUnlocked } = useVault();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Sur navigateur web (pas l'app), bloquer l'accès au coffre
  if (!isDesktopApp()) return <WebOnly />;
  if (!isUnlocked) return <Navigate to="/unlock" replace />;
  return children;
}

function HomeRoute() {
  if (isDesktopApp()) {
    return <Navigate to="/login" replace />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/setup-master" element={<RequireSession><CreateMasterSecret /></RequireSession>} />
      <Route path="/setup-master/pin" element={<RequireSession><CreatePin /></RequireSession>} />
      <Route path="/setup-master/password" element={<RequireSession><CreateMasterPassword /></RequireSession>} />
      <Route path="/unlock" element={<RequireSession><UnlockVault /></RequireSession>} />
      <Route path="/dashboard" element={<RequireUnlocked><Dashboard /></RequireUnlocked>} />
      <Route path="/admin" element={<RequireSession><Admin /></RequireSession>} />
      <Route path="/download-app" element={<DownloadApp />} />
      <Route path="/privacy" element={<Legal />} />
      <Route path="/terms" element={<Legal />} />
      <Route path="/cookies" element={<Legal />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}