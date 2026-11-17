import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { PreferenceToggles, SiteHeader } from "../../components/site/SiteHeader";
import { CommandPalette } from "../../components/site/CommandPalette";
import { ContactFab } from "../../components/site/ContactFab";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";
import { ErrorDetails } from "../../components/ui/ErrorDetails";
import { errorKind } from "../../lib/errors";
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

const SHOWN_KINDS = ["offline", "network", "config", "schema", "permission", "timeout", "server"];

/** Halaman gagal dimuat: sebutkan penyebabnya + detail teknis yang bisa disalin. */
function ErrorView({ error, onRetry }) {
  const { t } = useLang();
  const kind = SHOWN_KINDS.includes(errorKind(error)) ? errorKind(error) : "unknown";
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">{t(`error.${kind}.title`)}</h1>
        <p className="mt-2 text-muted">{t(`error.${kind}.text`)}</p>
        <ErrorDetails
          error={error}
          labels={{ details: t("error.details"), copy: t("error.copy"), copied: t("error.copied") }}
          className="mt-5"
        />
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
      className={`mx-auto mt-20 flex w-full max-w-5xl items-center justify-between gap-4 py-8 pl-5 pr-24 text-xs text-muted sm:pl-8 sm:pr-28 ${className}`}
    >
      <p>
        © {new Date().getFullYear()} {name}
      </p>
      <div className="flex items-center gap-3">
        {/* HP: bahasa & tema ada di sini (di desktop ada di header) */}
        <PreferenceToggles className="md:hidden" />
        <Link to="/admin" className="text-muted/50 transition hover:text-muted">
          Admin
        </Link>
      </div>
    </footer>
  );
}

function Shell() {
  const { status, data, error, reload } = usePortfolio();
  const { t, lang, to } = useLang();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState(false);
  const [contact, setContact] = useState(false);
  const active = sectionFromPath(pathname);
  const name = data?.profile.name;
  const isPage = SECTION_ORDER.includes(active);
  const isHome = active === "";

  // Pindah halaman → mulai dari atas.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Alamat #/contact (link lama / dari pencarian) → beranda dengan panel kontak terbuka.
  useEffect(() => {
    if (active !== "contact") return;
    setContact(true);
    navigate(to("/"), { replace: true });
  }, [active, navigate, to]);

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
  const openSearch = useCallback(() => {
    setContact(false);
    setSearch(true);
  }, []);

  if (status === "error" && !data) return <ErrorView error={error} onRetry={reload} />;
  if (!data) return <LoadingView />;

  const sections = availableSections(data);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader name={name} sections={sections} active={active} onSearch={openSearch} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isHome && <SiteFooter name={name} />}
      <ContactFab profile={data.profile} open={contact} onOpenChange={setContact} />
      <AnimatePresence>
        {search && <CommandPalette sections={sections} projects={data.projects} research={data.research} onClose={closeSearch} />}
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
