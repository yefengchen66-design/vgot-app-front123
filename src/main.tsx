
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);

  // Service Worker handling
  if ("serviceWorker" in navigator) {
    const _env = (typeof import.meta !== "undefined" && (import.meta as any).env) || {} as any;
    // In production: register SW for PWA
    if (_env.PROD) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .catch((err) => console.warn("Service worker registration failed:", err));
      });
    }

    // In development: ensure no SW interferes with Vite dev server
    if (_env.DEV) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      // Best-effort: clear our runtime caches to avoid stale assets locally
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.filter((k) => k.startsWith("vgot-cache-")).forEach((k) => caches.delete(k));
        });
      }
    }
  }
  