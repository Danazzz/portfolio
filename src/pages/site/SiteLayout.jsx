import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { RefreshCw, WifiOff } from "lucide-react";
import { TopBar } from "../../components/site/TopBar";
import { BottomNav } from "../../components/site/BottomNav";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { usePortfolio } from "../../lib/portfolio";
import { availableSections, sectionFromPath, SECTION_ORDER } from "../../lib/sections";
import { LanguageProvider } from "../../i18n/LanguageProvider";
import { useLang } from "../../i18n/language";

function LoadingView() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="h-64 rounded-b-[2.5rem] bg-gradient-to-br from-[#7d5a50] to-[#b4846c] dark:from-[#3b2b26] dark:to-[#7d5a50]" />
      <div className="mx-auto -mt-16 max-w-3xl space-y-8 px-4">
        <Skeleton className="h-28 rounded-3xl bg-surface shadow-float" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="mx-auto size-14 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorView({ onRetry }) {
  const { t } = useLang();
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="grid size-16 place-items-center rounded-full bg-surface-2">
          <WifiOff className="size-8 text-brand" />
        </span>
        <h1 className="text-xl font-bold">{t("error.title")}</h1>
        <p className="max-w-sm text-muted">{t("error.text")}</p>
        <Button icon={RefreshCw} onClick={onRetry}>
          {t("error.retry")}
        </Button>
      </div>
    </div>
  );
}

function Shell() {
  const { status, data, reload } = usePortfolio();
  const { t, lang } = useLang();
  const { pathname } = useLocation();
  const active = sectionFromPath(pathname);
  const name = data?.profile.name;
  const isPage = SECTION_ORDER.includes(active);

  // Pindah menu → mulai dari atas (membuka detail proyek tidak ikut menggulir).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [active]);

  useEffect(() => {
    if (!name) return;
    document.title = isPage ? `${t(`nav.${active}`)} — ${name}` : `${name} — ${t("meta.title")}`;
  }, [name, lang, t, active, isPage]);

  if (status === "error" && !data) return <ErrorView onRetry={reload} />;
  if (!data) return <LoadingView />;

  const sections = availableSections(data);

  return (
    <>
      <TopBar name={name} sections={sections} title={isPage ? t(`nav.${active}`) : null} active={active} />
      <main className="pb-6">
        <Outlet />
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 pb-28 pt-6 text-sm text-muted lg:pb-8">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
        <Link to="/admin" className="rounded-full px-3 py-1 hover:bg-surface-2">
          Admin
        </Link>
      </footer>
      <BottomNav sections={sections} active={active} />
    </>
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
