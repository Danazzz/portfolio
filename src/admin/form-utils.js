export const ALT_LANG = "id";

/** Teks terjemahan Indonesia dari sebuah baris data. */
export const getTr = (row, field) => row?.translations?.[ALT_LANG]?.[field];

/** Salinan baris dengan terjemahan Indonesia yang diperbarui. */
export const setTr = (row, field, value) => ({
  ...row,
  translations: {
    ...(row.translations || {}),
    [ALT_LANG]: { ...(row.translations?.[ALT_LANG] || {}), [field]: value },
  },
});

/** Apakah baris ini sudah punya minimal satu teks Indonesia. */
export const hasTranslation = (row) =>
  Object.values(row?.translations?.[ALT_LANG] || {}).some((v) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v),
  );

/** Rapikan terjemahan: buang spasi berlebih & isian kosong. */
export function cleanTranslations(translations = {}) {
  const id = {};
  Object.entries(translations[ALT_LANG] || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const lines = value.map((s) => s.trim()).filter(Boolean);
      if (lines.length) id[key] = lines;
    } else if (typeof value === "string" && value.trim()) {
      id[key] = value.trim();
    }
  });
  return { ...translations, [ALT_LANG]: id };
}

const isUrl = (v) => {
  try {
    const u = new URL(v);
    return /^https?:$/.test(u.protocol) && u.hostname.includes(".");
  } catch {
    return false;
  }
};

/** Aturan format isian: [cek, pesan jika salah]. */
const RULES = {
  email: [(v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Format email tidak valid. Contoh: nama@email.com"],
  url: [isUrl, "Link harus lengkap diawali https:// — contoh: https://github.com/nama"],
  phone: [(v) => /^\+?\d[\d\s-]{7,16}$/.test(v), "Nomor hanya berisi angka (boleh diawali +62 atau 0), 8–16 digit."],
  year: [(v) => /^(19|20)\d{2}$/.test(v), "Tahun harus 4 angka, contoh: 2024."],
};

/** Pesan error format (null jika kosong atau sudah benar). */
export const checkFormat = (rule, value) => {
  if (!value || !RULES[rule]) return null;
  const [valid, message] = RULES[rule];
  return valid(String(value).trim()) ? null : message;
};

/** Rapikan nilai sebelum disimpan, cek isian wajib & format (email, link, nomor, tahun). */
export function prepareRow(fields, value) {
  const row = { ...value };
  const errors = {};
  fields.forEach((f) => {
    if (f.type === "lines") row[f.name] = (row[f.name] || []).map((s) => s.trim()).filter(Boolean);
    else if (typeof row[f.name] === "string") row[f.name] = row[f.name].trim();
    if (f.required && !row[f.name]) errors[f.name] = `${f.label} wajib diisi.`;
    const rule = f.validate || (f.type === "email" || f.type === "url" ? f.type : null);
    const formatError = rule && typeof row[f.name] === "string" && checkFormat(rule, row[f.name]);
    if (formatError && !errors[f.name]) errors[f.name] = formatError;
  });
  if (fields.some((f) => f.translatable)) row.translations = cleanTranslations(row.translations);
  return { row, errors };
}

/** URL gambar yang berubah antara dua versi data (untuk membersihkan file lama). */
export function changedImages(fields, before = {}, after = {}) {
  return fields
    .filter((f) => f.type === "image" && before[f.name] && before[f.name] !== after[f.name])
    .map((f) => before[f.name]);
}
