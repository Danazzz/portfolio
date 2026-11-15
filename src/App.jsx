import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Home from "./pages/Home";
import { ProjectSheet } from "./components/site/ProjectSheet";

// Halaman admin dimuat terpisah supaya website utama tetap ringan.
const AdminApp = lazy(() => import("./admin/AdminApp"));

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loader2 className="size-8 animate-spin text-brand" />
    </div>
  );
}

/*
 * HashRouter dipakai karena GitHub Pages hanya melayani file statis.
 * Alamat halaman berbentuk .../portfolio/#/project/nama-project dan .../portfolio/#/admin
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="project/:slug" element={<ProjectSheet />} />
        </Route>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
