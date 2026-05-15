import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CanvasApp } from "@/app";
import { LoginPage } from "@/pages/login";

const isOfflineBuild = import.meta.env.VITE_OFFLINE_BUILD === "true";

export function Root() {
  if (isOfflineBuild) {
    return <CanvasApp />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<CanvasApp />} />
      </Routes>
    </BrowserRouter>
  );
}
