import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitch } from "./LanguageSwitch";
import { useScrolled } from "../../lib/hooks";
import { NanasLogo } from "../ui/NanasLogo";
import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Menu layar penuh untuk HP. */
function MenuOverlay({ name, sections, active, onClose }) {
  const { t, to } = useLang();
  const items = ["", ...sections];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-bg [background-image:var(--grain)] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="flex h-14 items-center justify-between px-5">
        <Link to={to("/")} onClick={onClose} aria-label={name} className="group -ml-1 flex items-center gap-1.5">
          <NanasLogo />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("menu.close")}
          className="-mr-2 grid size-10 place-items-center rounded-full hover:bg-surface-2"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col justify-center gap-1 px-5" aria-label="Main">
        {items.map((id, i) => (
          <motion.div
            key={id || "home"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={to(id ? `/${id}` : "/")}
              onClick={onClose}
              aria-current={active === id ? "page" : undefined}
              className={cn(
                "block py-2 text-4xl font-semibold tracking-tight transition",
                active === id ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              {t(id ? `nav.${id}` : "nav.home")}
            </Link>
          </motion.div>
        ))}
      </nav>
      <div className="flex items-center justify-between border-t border-line px-5 py-4 pb-safe">
        <LanguageSwitch className="-ml-2.5" />
        <ThemeToggle labels={{ light: t("theme.light"), dark: t("theme.dark") }} className="hover:bg-surface-2" />
      </div>
    </motion.div>
  );
}

/**
 * Header tipis bergaya Apple.
 *  Desktop: logo nanas · menu · cari (⌘K) · bahasa · tema
 *  HP:      logo nanas · cari · ☰ (menu layar penuh)
 */
export function SiteHeader({ name, sections, active, onSearch }) {
  const { t, to } = useLang();
  const scrolled = useScrolled(8);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  const closeMenu = useCallback(() => setMenu(false), []);
  useEffect(() => setMenu(false), [pathname]);

  return (
    <>
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
            className="group mr-auto -ml-1.5 flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2"
          >
            <NanasLogo />
          </Link>

          <nav className="mr-3 hidden items-center gap-6 md:flex" aria-label="Main">
            {sections.map((id) => (
              <Link
                key={id}
                to={to(`/${id}`)}
                aria-current={active === id ? "page" : undefined}
                className={cn(
                  "text-sm transition",
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
            className="inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <Search className="size-[18px]" />
            <kbd className="hidden font-sans text-xs font-medium md:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <div className="hidden items-center md:flex">
            <LanguageSwitch />
            <ThemeToggle
              labels={{ light: t("theme.light"), dark: t("theme.dark") }}
              className="size-9 text-muted hover:bg-surface-2 hover:text-ink [&_svg]:size-[18px]"
            />
          </div>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label={t("menu.open")}
            aria-expanded={menu}
            className="-mr-2 grid size-10 place-items-center rounded-full transition hover:bg-surface-2 md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      <AnimatePresence>
        {menu && <MenuOverlay name={name} sections={sections} active={active} onClose={closeMenu} />}
      </AnimatePresence>
    </>
  );
}
