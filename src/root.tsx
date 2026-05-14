import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CanvasApp } from "@/app";
import { LoginPage } from "@/pages/login";

export function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<CanvasApp />} />
      </Routes>
    </BrowserRouter>
  );
}
