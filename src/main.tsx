import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

import App from "./App";
import "./styles/globals.css";

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    toast("Hay una nueva versión disponible", {
      duration: Infinity,
      action: {
        label: "Recargar",
        onClick: () => void updateSW(true),
      },
    });
  },
  onOfflineReady() {
    toast.success("PokéGuía está lista para usarse sin conexión");
  },
  onRegisteredSW(_url, registration) {
    if (!registration) return;
    setInterval(() => void registration.update(), 60 * 60 * 1000);
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
