import * as React from "react";
import { createRoot } from "react-dom/client";
import "~/src/index.css";
import { Root } from "@/root";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
