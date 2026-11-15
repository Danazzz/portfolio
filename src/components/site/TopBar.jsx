import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useScrolled } from "../../lib/hooks";
import { cn, scrollToSection } from "../../lib/utils";
import { useLang } from "../../i18n/language";

const NAV_ITEMS = ["about", "projects", "experience", "skills", "certificates", "contact"];

/** Tombol pilihan bahasa berbentuk pil: EN | ID */
function LanguageSwitch({ scrolled }) {
  const { lang, t, switchLang } = useLang();
  return (
    <button
      type="button"
      onClick={switchLang}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className={cn(
        "relative grid h-9 grid-cols-2 items-center rounded-full p-1 text-xs font-bold transition",
        scrolled ? "bg-surface-2" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-1 w-[calc(50%-4px)] rounded-full shadow transition-all duration-300",
          scrolled ? "bg-brand" : "bg-white",
          lang === "en" ? "left-1" : "left-1/2",
        )}
      />
      {["en", "id"].map((code) => (
        <span
          key={code}
          className={cn(
            "relative z-10 px-2.5 transition-colors",
            lang === code ? (scrolled ? "text-on-brand" : "text-[#3b2b26]") : "",
          )}
        >
          {code.toUpperCase()}
        </span>
      ))}
    </button>
  );
}

export function TopBar({ name, sections }) {
  const scrolled = useScrolled(40);
  const { t, to } = useLang();
  const initial = (name || "D").trim().charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled ? "border-b border-line bg-surface/85 text-ink backdrop-blur-lg" : "text-white",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <Link
          to={to("/")}
          onClick={() => scrollToSection("top")}
          className="mr-auto flex items-center gap-2 font-semibold tracking-tight"
        >
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl text-lg font-bold transition-colors",
              scrolled ? "bg-brand text-on-brand" : "bg-white/20 text-white",
            )}
          >
            {initial}
          </span>
          <span className="text-lg">{name?.split(" ")[0] || "Portfolio"}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.filter((id) => sections.includes(id)).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition",
                scrolled ? "hover:bg-surface-2" : "hover:bg-white/15",
              )}
            >
              {t(`nav.${id}`)}
            </button>
          ))}
        </nav>
        <LanguageSwitch scrolled={scrolled} />
        <ThemeToggle
          labels={{ light: t("theme.light"), dark: t("theme.dark") }}
          className={scrolled ? "hover:bg-surface-2" : "hover:bg-white/15"}
        />
      </div>
    </div>
  );
}
