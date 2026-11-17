import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { SiteHeader } from "../../components/site/SiteHeader";
import { CommandPalette } from "../../components/site/CommandPalette";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { usePortfolio } from "../../lib/portfolio";
import { availableSections, sectionFromPath, SECTION_ORDER } from "../../lib/sections";
import { LanguageProvider } from "../../i18n/LanguageProvider";
import { useLang } from "../../i18n/language";

function LoadingView() {
  return (
    <div aria-busy="true" aria-label="Loading" className="mx-auto max-w-5xl px-5 pt-32 sm:px-8">
      <Skeleton className="h-16 w-3/4 max-w-xl sm:h-24" />
      <Skeleton className="mt-6 h-6 w-1/2 max-w-xs" />
      <div className="mt-24 space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  );
}

function ErrorView({ onRetry }) {
  const { t } = useLang();
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm">
        <h1 className="text-3xl font-semibold tracking-tight">{t("error.title")}</h1>
        <p className="mt-2 text-muted">{t("error.text")}</p>
        <Button icon={RefreshCw} onClick={onRetry} className="mt-6">
          {t("error.retry")}
        </Button>
      </div>
    </div>
  );
}

/** Footer kecil di halaman isi (beranda punya baris bawahnya sendiri). */
export function SiteFooter({ name, className = "" }) {
  return (
    <footer
      className={`mx-auto mt-20 flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-8 text-xs text-muted sm:px-8 ${className}`}
    >
      <p>
        © {new Date().getFullYear()} {name}
      </p>
      <Link to="/admin" className="text-muted/50 transition hover:text-muted">
        Admin
      </Link>
    </footer>
  );
}

function Shell() {
  const { status, data, reload } = usePortfolio();
  const { t, lang } = useLang();
  const { pathname } = useLocation();
  const [search, setSearch] = useState(false);
  const active = sectionFromPath(pathname);
  const name = data?.profile.name;
  const isPage = SECTION_ORDER.includes(active);
  const isHome = active === "";

  // Pindah halaman → mulai dari atas.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!name) return;
    document.title = isPage ? `${t(`nav.${active}`)} — ${name}` : name;
  }, [name, lang, t, active, isPage]);

  // ⌘K / Ctrl+K membuka pencarian dari halaman mana pun.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const closeSearch = useCallback(() => setSearch(false), []);

  if (status === "error" && !data) return <ErrorView onRetry={reload} />;
  if (!data) return <LoadingView />;

  const sections = availableSections(data);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader name={name} sections={sections} active={active} onSearch={() => setSearch(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHome && <SiteFooter name={name} />}
      <AnimatePresence>
        {search && <CommandPalette sections={sections} projects={data.projects} onClose={closeSearch} />}
      </AnimatePresence>
    </div>
  );
}

/** Kerangka website: bahasa dari alamat ("/..." = English, "/id/..." = Indonesia). */
export default function SiteLayout({ lang }) {
  return (
    <LanguageProvider lang={lang}>
      <Shell />
    </LanguageProvider>
  );
}
