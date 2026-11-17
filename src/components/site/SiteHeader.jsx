import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitch } from "./LanguageSwitch";
import { useScrolled } from "../../lib/hooks";
import { NanasLogo } from "../ui/NanasLogo";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Bahasa + tema. Di desktop ada di header; di HP di baris bawah halaman (lihat footer). */
export function PreferenceToggles({ className }) {
  const { t } = useLang();
  return (
    <div className={cn("flex items-center", className)}>
      <LanguageSwitch />
      <ThemeToggle
        labels={{ light: t("theme.light"), dark: t("theme.dark") }}
        className="size-9 text-muted hover:bg-surface-2 hover:text-ink [&_svg]:size-[18px]"
      />
    </div>
  );
}

/**
 * Header tipis — menu selalu terlihat, juga di HP (tanpa ☰).
 *  Desktop: logo nanas · Projects Research About · cari (⌘K) · bahasa · tema
 *  HP:      logo nanas · Projects Research About · cari
 */
export function SiteHeader({ name, sections, active, onSearch }) {
  const { t, to } = useLang();
  const scrolled = useScrolled(8);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300",
        scrolled ? "border-line/70 bg-bg/75 backdrop-blur-xl backdrop-saturate-150" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-5 sm:px-8">
        <Link
          to={to("/")}
          aria-label={name}
          title={name}
          className="group mr-auto -ml-1.5 flex shrink-0 items-center rounded-full p-1"
        >
          <NanasLogo />
        </Link>

        <nav className="mr-1 flex items-center gap-4 sm:mr-3 sm:gap-6" aria-label="Main">
          {sections.map((id) => (
            <Link
              key={id}
              to={to(`/${id}`)}
              aria-current={active === id ? "page" : undefined}
              className={cn(
                "whitespace-nowrap text-[13px] transition sm:text-sm",
                active === id ? "font-medium text-ink" : "text-muted hover:text-ink",
              )}
            >
              {t(`nav.${id}`)}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={onSearch}
          aria-label={t("search.open")}
          title={`${t("search.open")} (${isMac ? "⌘" : "Ctrl+"}K)`}
          className="-mr-2 inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-2.5 text-muted transition hover:bg-surface-2 hover:text-ink md:mr-0"
        >
          <Search className="size-[18px]" />
          <kbd className="hidden font-sans text-xs font-medium md:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
        </button>
        <PreferenceToggles className="hidden md:flex" />
      </div>
    </header>
  );
}
