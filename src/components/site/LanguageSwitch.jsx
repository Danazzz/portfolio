import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

/** Pilihan bahasa berupa teks: "EN / ID" — bahasa aktif lebih tegas. */
export function LanguageSwitch({ className }) {
  const { lang, t, switchLang } = useLang();
  return (
    <button
      type="button"
      onClick={switchLang}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className={cn(
        "inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-xs font-semibold tracking-wide transition hover:bg-surface-2",
        className,
      )}
    >
      {["en", "id"].map((code, i) => (
        <span key={code} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-muted/50">/</span>}
          <span className={lang === code ? "text-ink" : "text-muted/70"}>{code.toUpperCase()}</span>
        </span>
      ))}
    </button>
  );
}
