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
    const checkForUpdate = () => void registration.update();
    setInterval(checkForUpdate, 15 * 60 * 1000);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdate();
    });
    window.addEventListener("focus", checkForUpdate);
  },
});

/**
 * When a new service worker takes control and the page was already controlled
 * by an older one, reload once so the user never gets stuck on cached assets.
 */
if ("serviceWorker" in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
