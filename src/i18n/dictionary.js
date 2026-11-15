/**
 * Teks tampilan website dalam dua bahasa.
 * Bahasa Inggris adalah bahasa utama (tampil pertama kali).
 */
export const LANGUAGES = ["en", "id"];
export const DEFAULT_LANG = "en";

export const DICTIONARY = {
  en: {
    "meta.title": "Portfolio",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.experience": "Experience",
    "nav.skills": "Skills",
    "nav.certificates": "Certificates",
    "nav.contact": "Contact",
    "nav.share": "Share",
    "nav.copied": "Copied!",
    "lang.switch": "Ganti ke Bahasa Indonesia",
    "theme.light": "Switch to light mode",
    "theme.dark": "Switch to dark mode",

    "hero.greeting": "Hi there 👋 I'm",
    "stats.projects": "Projects",
    "stats.experiences": "Experiences",
    "stats.skills": "Skills",
    "stats.certificates": "Certificates",

    "featured.title": "✨ Featured",
    "projects.subtitle": "Tap a project to see photos, videos and details",
    "projects.all": "All",
    "projects.empty": "No projects yet — check back soon.",
    "projects.video": "Video",
    "about.title": "About me",
    "experience.subtitle": "Where I've worked and what I delivered",
    "experience.present": "Present",
    "skills.subtitle": "Tools and technologies I use",
    "certificates.subtitle": "Courses and achievements",
    "certificates.view": "View credential",
    "contact.heading": "Let's work together",
    "contact.text": "Have a project in mind or just want to say hi? Feel free to reach out.",

    "project.demo": "Live demo",
    "project.source": "Source code",
    "project.share": "Share",
    "project.copied": "Link copied",
    "project.about": "About this project",
    "project.builtWith": "Built with",
    "project.notFound": "Project not found",
    "project.notFoundText": "It may have been moved or removed.",
    "project.backHome": "Back to home",

    "error.title": "Couldn't load the page",
    "error.text": "Please check your internet connection and try again.",
    "error.retry": "Try again",
    "common.close": "Close",
    "media.fullscreen": "View full screen",
    "media.view": "View photo",
    "media.gallery": "Gallery",
  },
  id: {
    "meta.title": "Portofolio",
    "nav.home": "Beranda",
    "nav.about": "Tentang",
    "nav.projects": "Proyek",
    "nav.experience": "Pengalaman",
    "nav.skills": "Keahlian",
    "nav.certificates": "Sertifikat",
    "nav.contact": "Kontak",
    "nav.share": "Bagikan",
    "nav.copied": "Tersalin!",
    "lang.switch": "Switch to English",
    "theme.light": "Ganti ke mode terang",
    "theme.dark": "Ganti ke mode gelap",

    "hero.greeting": "Halo 👋 saya",
    "stats.projects": "Proyek",
    "stats.experiences": "Pengalaman",
    "stats.skills": "Keahlian",
    "stats.certificates": "Sertifikat",

    "featured.title": "✨ Unggulan",
    "projects.subtitle": "Ketuk proyek untuk melihat foto, video dan detailnya",
    "projects.all": "Semua",
    "projects.empty": "Belum ada proyek — nantikan segera.",
    "projects.video": "Video",
    "about.title": "Tentang saya",
    "experience.subtitle": "Tempat saya bekerja dan hasil yang saya berikan",
    "experience.present": "Sekarang",
    "skills.subtitle": "Teknologi dan tools yang saya gunakan",
    "certificates.subtitle": "Kursus dan pencapaian",
    "certificates.view": "Lihat kredensial",
    "contact.heading": "Mari bekerja sama",
    "contact.text": "Punya ide proyek atau sekadar ingin menyapa? Jangan ragu menghubungi saya.",

    "project.demo": "Lihat demo",
    "project.source": "Kode sumber",
    "project.share": "Bagikan",
    "project.copied": "Link tersalin",
    "project.about": "Tentang proyek ini",
    "project.builtWith": "Dibuat dengan",
    "project.notFound": "Proyek tidak ditemukan",
    "project.notFoundText": "Mungkin sudah dipindah atau dihapus.",
    "project.backHome": "Kembali ke beranda",

    "error.title": "Halaman gagal dimuat",
    "error.text": "Periksa koneksi internet Anda lalu coba lagi.",
    "error.retry": "Coba lagi",
    "common.close": "Tutup",
    "media.fullscreen": "Lihat layar penuh",
    "media.view": "Lihat foto",
    "media.gallery": "Galeri",
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
