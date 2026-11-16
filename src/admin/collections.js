/**
 * Konfigurasi halaman kelola data sederhana di panel admin.
 * Tipe isian: text | textarea | lines (satu baris = satu poin) | image | url
 */
export const COLLECTIONS = [
  {
    table: "experiences",
    path: "experiences",
    title: "Pengalaman Kerja",
    description: "Riwayat pekerjaan yang tampil di bagian Experience.",
    itemName: "pengalaman",
    primary: (row) => row.role,
    secondary: (row) =>
      [row.organisation, [row.start_date, row.end_date || "Sekarang"].filter(Boolean).join(" – ")]
        .filter(Boolean)
        .join(" · "),
    fields: [
      { name: "role", label: "Posisi / jabatan", type: "text", required: true, translatable: true, placeholder: "Contoh: Fullstack Developer" },
      { name: "organisation", label: "Nama perusahaan", type: "text", placeholder: "Contoh: Baliola.com" },
      { name: "start_date", label: "Mulai", type: "text", placeholder: "Contoh: Nov 2021", half: true },
      { name: "end_date", label: "Selesai", type: "text", placeholder: "Contoh: Jul 2022", help: "Kosongkan jika masih bekerja di sini.", half: true },
      { name: "highlights", label: "Tugas & pencapaian", type: "lines", translatable: true, help: "Tulis satu poin per baris (tekan Enter untuk poin baru)." },
    ],
  },
  {
    table: "skills",
    path: "skills",
    title: "Skill",
    description: "Teknologi dan tools yang Anda kuasai.",
    itemName: "skill",
    primary: (row) => row.name,
    secondary: (row) => row.category || "Tanpa kelompok",
    fields: [
      { name: "name", label: "Nama skill", type: "text", required: true, placeholder: "Contoh: React.js", half: true },
      {
        name: "category",
        label: "Kelompok",
        type: "text",
        placeholder: "Contoh: Frontend",
        options: ["Frontend", "Backend", "Database", "Mobile", "DevOps", "Tools", "CMS"],
        help: "Skill dengan kelompok sama tampil berdampingan.",
        half: true,
      },
      { name: "icon_url", label: "Logo kecil (opsional)", type: "image", aspect: "aspect-square max-w-32", help: "Tidak wajib. Tampilan paling rapi tanpa logo." },
    ],
  },
  {
    table: "certificates",
    path: "certificates",
    title: "Sertifikat",
    description: "Sertifikat kursus, pelatihan atau penghargaan.",
    itemName: "sertifikat",
    primary: (row) => row.title,
    secondary: (row) => [row.issuer, row.issued_at].filter(Boolean).join(" · "),
    image: (row) => row.image_url,
    fields: [
      { name: "title", label: "Nama sertifikat", type: "text", required: true, placeholder: "Contoh: AWS Cloud Practitioner" },
      { name: "issuer", label: "Diterbitkan oleh", type: "text", placeholder: "Contoh: Dicoding", half: true },
      { name: "issued_at", label: "Tanggal terbit", type: "text", placeholder: "Contoh: Mar 2024", half: true },
      { name: "image_url", label: "Foto / scan sertifikat", type: "image", aspect: "aspect-[4/3]" },
      { name: "credential_url", label: "Link verifikasi", type: "url", placeholder: "https://...", help: "Opsional. Link untuk mengecek keaslian sertifikat." },
    ],
  },
];

export const emptyRow = (fields) => ({
  ...Object.fromEntries(fields.map((f) => [f.name, f.type === "lines" ? [] : ""])),
  ...(fields.some((f) => f.translatable) ? { translations: {} } : {}),
});
