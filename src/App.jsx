import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Home from "./pages/Home";
import { ProjectSheet } from "./components/site/ProjectSheet";
import { PortfolioProvider } from "./components/site/PortfolioProvider";

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
 *   .../portfolio/#/                    → website (English)
 *   .../portfolio/#/id                  → website (Bahasa Indonesia)
 *   .../portfolio/#/id/project/nama     → detail proyek
 *   .../portfolio/#/admin               → panel admin
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <AdminApp />
            </Suspense>
          }
        />
        {/* Data dimuat sekali di sini, jadi ganti bahasa tidak memuat ulang data. */}
        <Route
          element={
            <PortfolioProvider>
              <Outlet />
            </PortfolioProvider>
          }
        >
          <Route path="/:lang?" element={<Home />}>
            <Route path="project/:slug" element={<ProjectSheet />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
