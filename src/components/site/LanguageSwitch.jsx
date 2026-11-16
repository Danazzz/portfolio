import { cn } from "../../lib/utils";
import { useLang } from "../../i18n/language";

/**
 * Tombol pilihan bahasa berbentuk pil: EN | ID
 * tone "onBrand" = di atas header coklat, "surface" = di atas latar terang.
 */
export function LanguageSwitch({ tone = "surface" }) {
  const { lang, t, switchLang } = useLang();
  const onBrand = tone === "onBrand";
  return (
    <button
      type="button"
      onClick={switchLang}
      aria-label={t("lang.switch")}
      title={t("lang.switch")}
      className={cn(
        "relative grid h-9 shrink-0 grid-cols-2 items-center rounded-full p-1 text-xs font-bold transition",
        onBrand ? "bg-white/15" : "bg-surface-2",
      )}
    >
      <span
        className={cn(
          "absolute inset-y-1 w-[calc(50%-4px)] rounded-full shadow transition-all duration-300",
          onBrand ? "bg-white" : "bg-brand",
          lang === "en" ? "left-1" : "left-1/2",
        )}
      />
      {["en", "id"].map((code) => (
        <span
          key={code}
          className={cn(
            "relative z-10 px-2.5 transition-colors",
            lang === code && (onBrand ? "text-[#3b2b26]" : "text-on-brand"),
          )}
        >
          {code.toUpperCase()}
        </span>
      ))}
    </button>
  );
}
