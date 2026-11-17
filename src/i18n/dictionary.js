/**
 * Teks tampilan website dalam dua bahasa.
 * Bahasa Inggris adalah bahasa utama (tampil pertama kali).
 */
export const LANGUAGES = ["en", "id"];
export const DEFAULT_LANG = "en";

export const DICTIONARY = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.experience": "Experience",
    "nav.skills": "Skills",
    "nav.certificates": "Certificates",
    "nav.contact": "Contact",
    "lang.switch": "Ganti ke Bahasa Indonesia",
    "theme.light": "Switch to light mode",
    "theme.dark": "Switch to dark mode",

    "projects.all": "All",
    "projects.empty": "No projects yet — check back soon.",
    "experience.present": "Present",
    "certificates.view": "View credential",

    "project.demo": "Live demo",
    "project.source": "Source code",
    "project.share": "Share",
    "project.copied": "Link copied",
    "project.notFound": "Project not found",
    "project.notFoundText": "It may have been moved or removed.",
    "project.backHome": "Back to projects",

    "error.title": "Couldn't load the page",
    "error.text": "Please check your internet connection and try again.",
    "error.retry": "Try again",
    "common.close": "Close",
    "skills.other": "Other",
    "contact.cv": "Resume / CV",
    "media.fullscreen": "View full screen",
    "media.view": "View photo",
    "media.gallery": "Gallery",

    "home.curious": "Currently curious about",
    "menu.open": "Open menu",
    "menu.close": "Close menu",
    "search.open": "Search",
    "search.placeholder": "Type to search…",
    "search.pages": "Pages",
    "search.projects": "Projects",
    "search.empty": "Nothing found.",
    "search.hint": "to navigate",
    "project.specs": "Specs",
    "project.role": "Role",
    "project.year": "Year",
    "project.category": "Type",
    "project.stack": "Stack",
    "project.links": "Links",
    "project.prev": "Previous",
    "project.next": "Next",
    "project.all": "All projects",
  },
  id: {
    "nav.home": "Beranda",
    "nav.about": "Tentang",
    "nav.projects": "Proyek",
    "nav.experience": "Pengalaman",
    "nav.skills": "Keahlian",
    "nav.certificates": "Sertifikat",
    "nav.contact": "Kontak",
    "lang.switch": "Switch to English",
    "theme.light": "Ganti ke mode terang",
    "theme.dark": "Ganti ke mode gelap",

    "projects.all": "Semua",
    "projects.empty": "Belum ada proyek — nantikan segera.",
    "experience.present": "Sekarang",
    "certificates.view": "Lihat kredensial",

    "project.demo": "Lihat demo",
    "project.source": "Kode sumber",
    "project.share": "Bagikan",
    "project.copied": "Link tersalin",
    "project.notFound": "Proyek tidak ditemukan",
    "project.notFoundText": "Mungkin sudah dipindah atau dihapus.",
    "project.backHome": "Kembali ke daftar proyek",

    "error.title": "Halaman gagal dimuat",
    "error.text": "Periksa koneksi internet Anda lalu coba lagi.",
    "error.retry": "Coba lagi",
    "common.close": "Tutup",
    "skills.other": "Lainnya",
    "contact.cv": "Resume / CV",
    "media.fullscreen": "Lihat layar penuh",
    "media.view": "Lihat foto",
    "media.gallery": "Galeri",

    "home.curious": "Sedang penasaran dengan",
    "menu.open": "Buka menu",
    "menu.close": "Tutup menu",
    "search.open": "Cari",
    "search.placeholder": "Ketik untuk mencari…",
    "search.pages": "Halaman",
    "search.projects": "Proyek",
    "search.empty": "Tidak ada hasil.",
    "search.hint": "untuk memilih",
    "project.specs": "Spesifikasi",
    "project.role": "Peran",
    "project.year": "Tahun",
    "project.category": "Jenis",
    "project.stack": "Teknologi",
    "project.links": "Tautan",
    "project.prev": "Sebelumnya",
    "project.next": "Berikutnya",
    "project.all": "Semua proyek",
  },
};

const ID_MONTHS = { May: "Mei", Aug: "Agu", Oct: "Okt", Dec: "Des", August: "Agustus", October: "Oktober", December: "Desember" };

/** "Aug 2023" → "Agu 2023" untuk versi Indonesia. */
export const localizeDate = (text, lang) =>
  lang === "id" && text ? text.replace(/\b(May|August|Aug|October|Oct|December|Dec)\b/g, (m) => ID_MONTHS[m]) : text;

/**
 * Ambil isi konten sesuai bahasa. Jika terjemahan Indonesia kosong,
 * otomatis memakai versi Inggris.
 */
export const pickText = (row, field, lang) => {
  if (!row) return "";
  if (lang !== DEFAULT_LANG) {
    const value = row.translations?.[lang]?.[field];
    if (Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim()) return value;
  }
  return row[field];
};
