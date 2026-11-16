import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { useLang } from "./i18n/language";
import { Loader2 } from "lucide-react";
import { PortfolioProvider } from "./components/site/PortfolioProvider";
import { ProjectSheet } from "./components/site/ProjectSheet";
import SiteLayout from "./pages/site/SiteLayout";
import HomePage from "./pages/site/HomePage";
import ProjectsPage from "./pages/site/ProjectsPage";
import ExperiencePage from "./pages/site/ExperiencePage";
import SkillsPage from "./pages/site/SkillsPage";
import CertificatesPage from "./pages/site/CertificatesPage";
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

/** Halaman website (dipakai untuk "/" English dan "/id" Indonesia). */
const siteRoutes = (
  <>
    <Route index element={<HomePage />} />
    <Route path="projects" element={<ProjectsPage />}>
      <Route path=":slug" element={<ProjectSheet />} />
    </Route>
    <Route path="experience" element={<ExperiencePage />} />
    <Route path="skills" element={<SkillsPage />} />
    <Route path="certificates" element={<CertificatesPage />} />
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
 *   #/experience, #/skills, #/certificates, #/about, #/contact
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
