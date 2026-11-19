/** Gabungkan className, abaikan nilai kosong. */
export const cn = (...classes) => classes.filter(Boolean).join(" ");

/**
 * URL gambar/aset. URL lengkap (hasil upload Supabase) dipakai apa adanya,
 * path pendek seperti "skills/react.png" diarahkan ke folder public/assets.
 */
export const assetUrl = (path) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${import.meta.env.BASE_URL}assets/${path.replace(/^\/+/, "")}`;
};

export const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** Ambil ID video dari berbagai bentuk link YouTube. */
export const getYouTubeId = (url) => {
  if (!url) return null;
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
};

export const youTubeThumb = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
};

export const youTubeEmbed = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
};

/** Gambar sampul sebuah media (dipakai untuk kartu & thumbnail). */
export const mediaThumb = (media) => {
  if (!media) return "";
  if (media.type === "youtube") return youTubeThumb(media.url);
  return media.type === "image" ? assetUrl(media.url) : "";
};

export const whatsappLink = (number) => {
  const digits = String(number || "").replace(/\D/g, "").replace(/^0/, "62");
  return digits ? `https://wa.me/${digits}` : "";
};

export const byOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

/**
 * Penyaring link dari database. Hanya mengizinkan https/http, mailto, tel, path aset
 * (mis. "profile/foto.png") dan gambar data:image. Selain itu (mis. "javascript:...") → "".
 * Spasi & karakter kontrol tersembunyi dibuang dulu, karena sering dipakai untuk mengelabui pengecekan.
 */
export const safeUrl = (value) => {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const url = value.replace(/[\u0000-\u001F\u007F\s]+/g, "");
  if (!url) return "";
  const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (!scheme) return url.startsWith("//") ? "" : value.trim(); // path relatif (aset)
  if (["https", "http", "mailto", "tel"].includes(scheme)) return value.trim();
  if (scheme === "data" && /^data:image\//i.test(url)) return value.trim();
  return "";
};

/** Saring semua kolom berakhiran "_url" pada satu baris data. */
export const withSafeUrls = (row) => {
  if (!row || typeof row !== "object") return row;
  const out = { ...row };
  for (const key of Object.keys(out)) {
    if (key.endsWith("_url") || key === "url") out[key] = safeUrl(out[key]);
  }
  return out;
};
