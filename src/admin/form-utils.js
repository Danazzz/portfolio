/** Rapikan nilai sebelum disimpan & cek isian wajib. */
export function prepareRow(fields, value) {
  const row = { ...value };
  const errors = {};
  fields.forEach((f) => {
    if (f.type === "lines") row[f.name] = (row[f.name] || []).map((s) => s.trim()).filter(Boolean);
    else if (typeof row[f.name] === "string") row[f.name] = row[f.name].trim();
    if (f.required && !row[f.name]) errors[f.name] = `${f.label} wajib diisi.`;
  });
  return { row, errors };
}

/** URL gambar yang berubah antara dua versi data (untuk membersihkan file lama). */
export function changedImages(fields, before = {}, after = {}) {
  return fields
    .filter((f) => f.type === "image" && before[f.name] && before[f.name] !== after[f.name])
    .map((f) => before[f.name]);
}
