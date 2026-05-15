import * as React from "react";
import { createRoot } from "react-dom/client";
import "~/src/index.css";
import { Root } from "@/root";

const app = <Root />;
const isOfflineBuild = import.meta.env.VITE_OFFLINE_BUILD === "true";

function mountApp() {
  const el = document.getElementById("root");
  if (!el) {
    console.error("Mount failed: #root not found.");
    return;
  }
  createRoot(el).render(isOfflineBuild ? app : <React.StrictMode>{app}</React.StrictMode>);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountApp);
} else {
  mountApp();
}
