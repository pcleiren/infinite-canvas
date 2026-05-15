import * as React from "react";
import { createRoot } from "react-dom/client";
import "~/src/index.css";
import { Root } from "@/root";

const app = <Root />;
const isOfflineBuild = import.meta.env.VITE_OFFLINE_BUILD === "true";

createRoot(document.getElementById("root") as HTMLElement).render(
  isOfflineBuild ? app : <React.StrictMode>{app}</React.StrictMode>,
);
