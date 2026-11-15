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

/** Scroll halus ke section tertentu (aman dipakai bersama HashRouter). */
export const scrollToSection = (id) => {
  if (id === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const whatsappLink = (number) => {
  const digits = String(number || "").replace(/\D/g, "").replace(/^0/, "62");
  return digits ? `https://wa.me/${digits}` : "";
};

export const byOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);
