/**
 * Pengenal error: mengubah error mentah (Supabase, jaringan, kode) menjadi
 * jenis yang bisa dijelaskan ke manusia + detail teknis untuk debugging.
 */

export class AppError extends Error {
  constructor(message, info = {}) {
    super(message || info.code || `HTTP ${info.status ?? "?"}`);
    this.name = "AppError";
    Object.assign(this, info);
  }
}

/**
 * Ubah hasil query Supabase ({ data, error, status }) menjadi data, atau lempar AppError
 * yang membawa kode, status HTTP dan konteks (nama tabel / aksi).
 */
export function fromResponse(res, context) {
  if (!res?.error) return res?.data;
  const e = res.error;
  throw new AppError(e.message, {
    code: e.code || "",
    status: res.status,
    details: e.details || "",
    hint: e.hint || "",
    context,
  });
}

/** Batasi lama menunggu supaya halaman tidak memuat selamanya. */
export function withTimeout(promise, ms, context) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new AppError(`Timeout after ${ms / 1000}s`, { code: "TIMEOUT", context })), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const text = (error) => String(error?.message || error || "");

/**
 * Jenis error:
 *  offline     – perangkat tidak terhubung internet
 *  network     – server tidak bisa dihubungi (alamat salah / diblokir)
 *  config      – alamat atau kunci Supabase salah
 *  schema      – tabel/kolom belum dibuat (perlu menjalankan file SQL)
 *  permission  – ditolak aturan keamanan (RLS) / bukan admin
 *  timeout     – server terlalu lama menjawab
 *  server      – server Supabase bermasalah (5xx)
 *  app         – kesalahan di kode website
 *  unknown     – selain itu
 */
export function errorKind(error) {
  const msg = text(error);
  const code = error?.code || "";
  const status = error?.status;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  if (code === "TIMEOUT" || error?.name === "AbortError") return "timeout";
  if (/Failed to fetch|NetworkError|Load failed|ERR_NAME_NOT_RESOLVED/i.test(msg)) return "network";
  if (code === "PGRST205" || code === "42P01" || code === "PGRST204" || code === "42703" || /schema cache|does not exist/i.test(msg))
    return "schema";
  if (status === 401 || /Invalid API key|No API key|apikey/i.test(msg)) return "config";
  if (status === 404 && !code) return "config";
  if (code === "42501" || status === 403 || /row-level security|permission denied|not authorized/i.test(msg)) return "permission";
  if (status >= 500) return "server";
  if (error instanceof TypeError || error instanceof ReferenceError || error instanceof RangeError) return "app";
  return "unknown";
}

/** Nama kolom/tabel yang hilang dari pesan error Postgres/PostgREST. */
export function missingName(error) {
  const msg = text(error);
  return (
    msg.match(/'([\w.]+)' column/)?.[1] ||
    msg.match(/column ["\w.]*?\.?"?(\w+)"? does not exist/)?.[1] ||
    msg.match(/table '(?:public\.)?([\w.]+)'/)?.[1] ||
    msg.match(/relation "(?:public\.)?(\w+)" does not exist/)?.[1] ||
    ""
  );
}

/** Detail teknis yang aman ditampilkan & disalin (tanpa kunci rahasia). */
export function technical(error) {
  return {
    kind: errorKind(error),
    message: text(error).slice(0, 500),
    ...(error?.code && { code: error.code }),
    ...(error?.status && { status: error.status }),
    ...(error?.context && { context: error.context }),
    ...(error?.details && { details: String(error.details).slice(0, 300) }),
    ...(error?.hint && { hint: String(error.hint).slice(0, 300) }),
    ...(error?.stack && errorKind(error) === "app" && { stack: String(error.stack).split("\n").slice(0, 4).join("\n") }),
  };
}

/** Teks laporan untuk disalin (mis. dikirim ke developer). */
export const reportText = (error) =>
  JSON.stringify(
    { ...technical(error), page: typeof location !== "undefined" ? location.href : "", time: new Date().toISOString() },
    null,
    2,
  );
