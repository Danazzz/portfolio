/** Batas ukuran file per upload di Supabase paket gratis. */
export const MAX_UPLOAD_MB = 50;

const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };
    img.src = url;
  });

/**
 * Perkecil foto sebelum di-upload (maks 1920px, format WebP) supaya
 * kuota penyimpanan gratis awet dan website tetap cepat.
 * GIF/SVG dan file yang gagal diproses dikirim apa adanya.
 */
export async function compressImage(file, maxSize = 1920, quality = 0.82) {
  if (!COMPRESSIBLE.includes(file.type)) return file;
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export const mediaTypeOf = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
};
