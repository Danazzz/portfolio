import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { useLang } from "./i18n/language";
import { ABOUT_PARTS } from "./lib/sections";
import { Loader2 } from "lucide-react";
import { PortfolioProvider } from "./components/site/PortfolioProvider";
import SiteLayout from "./pages/site/SiteLayout";
import HomePage from "./pages/site/HomePage";
import ProjectsPage from "./pages/site/ProjectsPage";
import ProjectPage from "./pages/site/ProjectPage";
import AboutPage from "./pages/site/AboutPage";
import ContactPage from "./pages/site/ContactPage";

// Halaman admin dimuat terpisah supaya website utama tetap ringan.
const AdminApp = lazy(() => import("./admin/AdminApp"));

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loader2 className="size-8 animate-spin text-brand" />
    </div>
  );
}

/** Alamat lama "#/project/slug" → "#/projects/slug" (link yang sudah terlanjur dibagikan tetap jalan). */
function LegacyProjectRedirect() {
  const { slug } = useParams();
  const { to } = useLang();
  return <Navigate to={to(`/projects/${slug}`)} replace />;
}

/** Alamat lama "#/skills" dll. → bagian terkait di halaman About. */
function AboutPartRedirect({ part }) {
  const { to } = useLang();
  return <Navigate to={to("/about")} state={{ part }} replace />;
}

/** Halaman website (dipakai untuk "/" English dan "/id" Indonesia). */
const siteRoutes = (
  <>
    <Route index element={<HomePage />} />
    <Route path="projects" element={<ProjectsPage />} />
    <Route path="projects/:slug" element={<ProjectPage />} />
    {ABOUT_PARTS.map((part) => (
      <Route key={part} path={part} element={<AboutPartRedirect part={part} />} />
    ))}
    <Route path="about" element={<AboutPage />} />
    <Route path="contact" element={<ContactPage />} />
    <Route path="project/:slug" element={<LegacyProjectRedirect />} />
  </>
);

/*
 * HashRouter dipakai karena GitHub Pages hanya melayani file statis.
 *   #/                       → beranda (English)      #/id            → beranda (Indonesia)
 *   #/projects               → daftar proyek          #/id/projects   → versi Indonesia
 *   #/projects/nama-proyek   → detail proyek
 *   #/about, #/contact      (#/experience, #/skills, #/certificates → bagian di About)
 *   #/admin                  → panel admin
 */
export default function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<FullScreenLoader />}>
              <AdminApp />
            </Suspense>
          }
        />
        {/* Data dimuat sekali di sini, jadi pindah halaman/bahasa tidak memuat ulang data. */}
        <Route
          element={
            <PortfolioProvider>
              <Outlet />
            </PortfolioProvider>
          }
        >
          {/* Ditulis eksplisit (bukan "/:lang?") supaya tidak bentrok dengan "/admin/..." */}
          <Route path="/" element={<SiteLayout lang="en" />}>
            {siteRoutes}
          </Route>
          <Route path="/id" element={<SiteLayout lang="id" />}>
            {siteRoutes}
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
