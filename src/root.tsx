import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { CanvasApp } from "@/app";
import { LoginPage } from "@/pages/login";

const isOfflineBuild = import.meta.env.VITE_OFFLINE_BUILD === "true";
const Router = isOfflineBuild ? HashRouter : BrowserRouter;

export function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<CanvasApp />} />
      </Routes>
    </Router>
  );
}
