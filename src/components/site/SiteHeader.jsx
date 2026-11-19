import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitch } from "./LanguageSwitch";
import { useScrolled } from "../../lib/hooks";
import { NanasLogo } from "../ui/NanasLogo";
import { Magnetic } from "../motion/Magnetic";
import { RollText } from "../motion/RollText";
import { DURATION, EASE } from "../../lib/motion";
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

// Isi header turun pelan satu per satu, hanya saat website pertama kali dibuka.
const enter = {
  hidden: { opacity: 0, y: -10 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

/**
 * Header tipis — menu selalu terlihat, juga di HP (tanpa ☰).
 *  Desktop: logo nanas · Projects Research About · cari (⌘K) · bahasa · tema
 *  HP:      logo nanas · Projects Research About · cari
 * Menu & logo magnetik (mouse saja); titik kecil menandai halaman aktif dan meluncur saat pindah halaman.
 */
export function SiteHeader({ name, sections, active, onSearch }) {
  const { t, to } = useLang();
  const scrolled = useScrolled(8);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-500",
        scrolled ? "border-line/70 bg-bg/75 backdrop-blur-xl backdrop-saturate-150" : "border-transparent",
      )}
    >
      <motion.div
        className="frame flex h-14 items-center gap-1 sm:h-16"
        initial="hidden"
        animate="shown"
        variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
      >
        <motion.div variants={enter} className="mr-auto -ml-1.5">
          <Magnetic strength={0.35}>
            <Link to={to("/")} aria-label={name} title={name} className="group flex shrink-0 items-center rounded-full p-1">
              <NanasLogo />
            </Link>
          </Magnetic>
        </motion.div>

        <nav className="mr-1 flex items-center gap-2.5 sm:mr-3 sm:gap-4" aria-label="Main">
          {sections.map((id) => (
            <motion.div key={id} variants={enter}>
              <Magnetic strength={0.25} reach={18}>
                <Link
                  to={to(`/${id}`)}
                  aria-current={active === id ? "page" : undefined}
                  className={cn(
                    "group relative whitespace-nowrap rounded-full px-1.5 py-2 text-[13px] transition-colors sm:px-2 sm:text-sm",
                    active === id ? "font-medium text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  <RollText>{t(`nav.${id}`)}</RollText>
                  {active === id && (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0.5 mx-auto size-1 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              </Magnetic>
            </motion.div>
          ))}
        </nav>

        <motion.div variants={enter} className="flex items-center">
          <Magnetic strength={0.3} reach={16}>
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
          </Magnetic>
          <PreferenceToggles className="hidden md:flex" />
        </motion.div>
      </motion.div>
    </header>
  );
}
