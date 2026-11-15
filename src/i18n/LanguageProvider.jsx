import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_LANG, DICTIONARY, localizeDate, pickText } from "./dictionary";
import { LanguageContext } from "./language";

const STORAGE_KEY = "lang";
let checkedSavedLang = false;

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const save = (lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* penyimpanan browser tidak tersedia */
  }
};

/** Bahasa ditentukan dari alamat: "/..." = English, "/id/..." = Indonesia. */
export function LanguageProvider({ lang, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Kunjungan pertama ke beranda: pakai bahasa yang terakhir dipilih pengunjung.
  useEffect(() => {
    if (checkedSavedLang) return;
    checkedSavedLang = true;
    if (lang === DEFAULT_LANG && pathname === "/" && readSaved() === "id") {
      navigate("/id", { replace: true });
    }
  }, [lang, pathname, navigate]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const to = useCallback(
    (path) => (lang === DEFAULT_LANG ? path : `/${lang}${path === "/" ? "" : path}`),
    [lang],
  );

  const switchLang = useCallback(() => {
    const next = lang === "id" ? "en" : "id";
    save(next);
    const rest = pathname.replace(/^\/id(?=\/|$)/, "") || "/";
    navigate(next === "id" ? `/id${rest === "/" ? "" : rest}` : rest, { replace: true });
  }, [lang, pathname, navigate]);

  const value = useMemo(
    () => ({
      lang,
      t: (key) => DICTIONARY[lang]?.[key] ?? DICTIONARY[DEFAULT_LANG][key] ?? key,
      tr: (row, field) => pickText(row, field, lang),
      date: (text) => localizeDate(text, lang),
      to,
      switchLang,
    }),
    [lang, to, switchLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
