import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { VaultProvider } from "./state/VaultContext.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <VaultProvider>
        <App />
      </VaultProvider>
    </BrowserRouter>
  </StrictMode>
);