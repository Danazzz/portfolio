import { createContext, useContext } from "react";

export const LanguageContext = createContext(null);

/**
 * { lang, t(key), tr(row, field), date(text), to(path), switchLang() }
 *  - t      : teks tampilan dari kamus
 *  - tr     : isi konten (dengan cadangan ke Bahasa Inggris)
 *  - to     : alamat halaman sesuai bahasa ("/project/x" → "/id/project/x")
 */
export const useLang = () => useContext(LanguageContext);
