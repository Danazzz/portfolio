import { technical } from "./errors";

/**
 * Catatan error terakhir, disimpan di browser ini (bukan di server).
 * Tampil di Admin → Cek Sistem supaya penyebab masalah bisa dilacak.
 */
const KEY = "nanas:error-log";
const MAX = 20;

export function getErrorLog() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearErrorLog() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* penyimpanan browser tidak tersedia */
  }
}

let last = "";

/** Catat error ke console + log browser. `where` = bagian yang gagal (mis. "Memuat website"). */
export function logError(error, where = "") {
  const info = technical(error);
  const entry = { time: new Date().toISOString(), where, page: location.hash || "#/", ...info };
  // Error yang sama berturut-turut (mis. dari StrictMode) cukup dicatat sekali.
  const signature = `${where}|${info.message}|${info.code || ""}`;
  if (signature === last) return entry;
  last = signature;

  console.error(`[nanas] ${where || "error"}:`, error);
  try {
    localStorage.setItem(KEY, JSON.stringify([entry, ...getErrorLog()].slice(0, MAX)));
  } catch {
    /* penyimpanan browser penuh / tidak tersedia */
  }
  return entry;
}

/** Tangkap error yang lolos (kode async tanpa try/catch). */
export function installGlobalErrorHandlers() {
  window.addEventListener("error", (e) => {
    // Gagal memuat gambar/script juga memicu "error" tanpa objek error.
    if (e.error) logError(e.error, "Uncaught error");
  });
  window.addEventListener("unhandledrejection", (e) => logError(e.reason, "Unhandled promise"));
}
