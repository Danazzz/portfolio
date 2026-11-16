import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitch } from "./LanguageSwitch";
import { useScrolled } from "../../lib/hooks";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

/**
 * Header website.
 *  - Beranda: transparan di atas header coklat, logo di kiri.
 *  - Halaman menu: putih, tombol kembali + judul halaman (seperti layanan di aplikasi).
 * Di desktop selalu ada tautan ke semua menu.
 */
export function TopBar({ name, sections, title, active }) {
  const scrolled = useScrolled(40);
  const { t, to } = useLang();
  const isHome = !title;
  const solid = !isHome || scrolled;
  const initial = (name || "D").trim().charAt(0).toUpperCase();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid ? "border-b border-line bg-surface/90 text-ink backdrop-blur-lg" : "text-white",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        {isHome ? (
          <Link to={to("/")} className="mr-auto flex items-center gap-2 font-semibold tracking-tight">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl text-lg font-bold transition-colors",
                solid ? "bg-brand text-on-brand" : "bg-white/20 text-white",
              )}
            >
              {initial}
            </span>
            <span className="text-lg">{name?.split(" ")[0] || "Portfolio"}</span>
          </Link>
        ) : (
          <div className="mr-auto flex min-w-0 items-center gap-1">
            <Link
              to={to("/")}
              aria-label={t("common.back")}
              title={t("common.back")}
              className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full transition hover:bg-surface-2"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
          </div>
        )}

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {sections.map((id) => (
            <Link
              key={id}
              to={to(`/${id}`)}
              aria-current={active === id ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                active === id
                  ? "bg-brand text-on-brand"
                  : solid
                    ? "hover:bg-surface-2"
                    : "hover:bg-white/15",
              )}
            >
              {t(`nav.${id}`)}
            </Link>
          ))}
        </nav>
        <LanguageSwitch tone={solid ? "surface" : "onBrand"} />
        <ThemeToggle
          labels={{ light: t("theme.light"), dark: t("theme.dark") }}
          className={solid ? "hover:bg-surface-2" : "hover:bg-white/15"}
        />
      </div>
    </header>
  );
}
