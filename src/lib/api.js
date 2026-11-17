import seed from "../data/seed.json";
import { supabase, isSupabaseReady, MEDIA_BUCKET } from "./supabase";
import { compressImage, MAX_UPLOAD_MB } from "./media";
import { byOrder, slugify } from "./utils";

/* ------------------------------------------------------------------ */
/*  Data publik (dipakai halaman website)                              */
/* ------------------------------------------------------------------ */

const normalize = (data) => ({
  profile: data.profile || seed.profile,
  projects: (data.projects || [])
    .filter((p) => p.published !== false)
    .map((p) => ({ ...p, tags: p.tags || [], media: [...(p.media || [])].sort(byOrder) }))
    .sort(byOrder),
  experiences: [...(data.experiences || [])].map((e) => ({ ...e, highlights: e.highlights || [] })).sort(byOrder),
  skills: [...(data.skills || [])].sort(byOrder),
  certificates: [...(data.certificates || [])].sort(byOrder),
});

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

/**
 * Ambil semua isi website. Tanpa Supabase (atau database masih kosong),
 * website memakai data bawaan di src/data/seed.json.
 */
export async function fetchPortfolio() {
  if (!isSupabaseReady) return normalize(seed);

  const [profile, projects, experiences, skills, certificates] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle().then(unwrap),
    supabase.from("projects").select("*, media:project_media(*)").eq("published", true).then(unwrap),
    supabase.from("experiences").select("*").then(unwrap),
    supabase.from("skills").select("*").then(unwrap),
    supabase.from("certificates").select("*").then(unwrap),
  ]);

  if (!profile) return normalize(seed);
  return normalize({ profile, projects, experiences, skills, certificates });
}

/* ------------------------------------------------------------------ */
/*  Pesan error yang mudah dipahami                                    */
/* ------------------------------------------------------------------ */

export function friendlyError(error) {
  const msg = String(error?.message || error || "");
  if (/Invalid login credentials/i.test(msg)) return "Email atau password salah.";
  if (/Email not confirmed/i.test(msg)) return "Email belum dikonfirmasi. Cek kotak masuk email Anda.";
  if (/Failed to fetch|NetworkError|network/i.test(msg)) return "Tidak ada koneksi internet. Coba lagi.";
  if (/row-level security|permission denied|not authorized/i.test(msg))
    return "Akses ditolak. Pastikan Anda login dengan akun admin.";
  if (/exceeded the maximum allowed size|Payload too large/i.test(msg))
    return `File terlalu besar (maks ${MAX_UPLOAD_MB} MB).`;
  if (/duplicate key/i.test(msg)) return "Data dengan nama yang sama sudah ada.";
  if (/translations/i.test(msg) && /column|schema cache/i.test(msg))
    return "Database belum mendukung dua bahasa. Jalankan file supabase/migration-bahasa.sql di Supabase SQL Editor.";
  if (/category/i.test(msg) && /column|schema cache/i.test(msg))
    return "Database belum mendukung kelompok skill. Jalankan file supabase/migration-kategori-skill.sql di Supabase SQL Editor.";
  if (/'(interests|timezone|role|year)' column/i.test(msg))
    return "Database belum mendukung isian minat/peran/tahun. Jalankan file supabase/migration-minat.sql di Supabase SQL Editor.";
  if (/JWT expired|session/i.test(msg)) return "Sesi login habis. Silakan login ulang.";
  return msg || "Terjadi kesalahan. Coba lagi.";
}

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */

export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  return Boolean(data);
}

export async function listRows(table) {
  return unwrap(await supabase.from(table).select("*").order("sort_order"));
}

/** Simpan satu baris: update jika sudah punya id, insert jika baru. */
export async function saveRow(table, row) {
  const { id, ...fields } = row;
  const query = id
    ? supabase.from(table).update(fields).eq("id", id)
    : supabase.from(table).insert(fields);
  return unwrap(await query.select().single());
}

export async function deleteRow(table, id) {
  unwrap(await supabase.from(table).delete().eq("id", id));
}

/** Simpan urutan baru (index array = sort_order). */
export async function saveOrder(table, rows) {
  const results = await Promise.all(
    rows.map((row, index) => supabase.from(table).update({ sort_order: index }).eq("id", row.id)),
  );
  results.forEach(unwrap);
}

export async function getProfile() {
  const data = unwrap(await supabase.from("profile").select("*").eq("id", 1).maybeSingle());
  return data || { ...seed.profile };
}

export async function saveProfile(profile) {
  return unwrap(await supabase.from("profile").upsert({ ...profile, id: 1 }).select().single());
}

/* ---------- Project ---------- */

export async function listProjects() {
  const data = unwrap(
    await supabase.from("projects").select("*, media:project_media(*)").order("sort_order"),
  );
  return data.map((p) => ({ ...p, media: [...(p.media || [])].sort(byOrder) }));
}

export async function getProject(id) {
  const data = unwrap(
    await supabase.from("projects").select("*, media:project_media(*)").eq("id", id).maybeSingle(),
  );
  if (!data) return null;
  return { ...data, media: [...(data.media || [])].sort(byOrder) };
}

async function uniqueSlug(title, ignoreId) {
  const base = slugify(title) || "project";
  const rows = unwrap(await supabase.from("projects").select("id, slug").like("slug", `${base}%`));
  const taken = new Set(rows.filter((r) => r.id !== ignoreId).map((r) => r.slug));
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

const PROJECT_FIELDS = [
  "title", "summary", "description", "category", "role", "year", "tags", "demo_url",
  "source_url", "display_mode", "featured", "published", "sort_order", "translations",
];

/**
 * Simpan project beserta daftar medianya. Media yang dihapus dari daftar
 * juga dihapus dari database dan penyimpanan file.
 */
export async function saveProject(project, media, removedMedia = []) {
  const fields = Object.fromEntries(PROJECT_FIELDS.map((k) => [k, project[k]]));
  fields.slug = await uniqueSlug(project.title, project.id);

  let saved;
  if (project.id) {
    saved = unwrap(await supabase.from("projects").update(fields).eq("id", project.id).select().single());
  } else {
    const count = unwrap(await supabase.from("projects").select("id")).length;
    saved = unwrap(
      await supabase.from("projects").insert({ ...fields, sort_order: count }).select().single(),
    );
  }

  const removedIds = removedMedia.map((m) => m.id).filter(Boolean);
  if (removedIds.length) {
    unwrap(await supabase.from("project_media").delete().in("id", removedIds));
    await removeFiles(removedMedia.map((m) => m.url));
  }

  if (media.length) {
    const rows = media.map((m, index) => ({
      id: m.id || crypto.randomUUID(),
      project_id: saved.id,
      type: m.type,
      url: m.url,
      caption: m.caption || "",
      sort_order: index,
    }));
    unwrap(await supabase.from("project_media").upsert(rows));
  }
  return saved;
}

export async function deleteProject(project) {
  unwrap(await supabase.from("projects").delete().eq("id", project.id));
  await removeFiles((project.media || []).map((m) => m.url));
}

/* ---------- File ---------- */

const PUBLIC_PREFIX = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

/** Upload file ke Supabase Storage dan kembalikan URL publiknya. */
export async function uploadFile(file, folder = "uploads") {
  const ready = file.type.startsWith("image/") ? await compressImage(file) : file;
  if (ready.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(
      `File "${file.name}" terlalu besar (maks ${MAX_UPLOAD_MB} MB). Untuk video panjang, upload ke YouTube lalu tempel link-nya.`,
    );
  }
  const ext = (ready.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, ready, { contentType: ready.type, cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Hapus file hasil upload (URL di luar Supabase diabaikan). Gagal hapus tidak menghentikan proses. */
export async function removeFiles(urls) {
  const paths = urls
    .filter((u) => typeof u === "string" && u.includes(PUBLIC_PREFIX))
    .map((u) => decodeURIComponent(u.split(PUBLIC_PREFIX)[1].split("?")[0]));
  if (!paths.length) return;
  await supabase.storage.from(MEDIA_BUCKET).remove(paths);
}

/* ---------- Impor data awal ---------- */

export async function isDatabaseEmpty() {
  const [profile, projects] = await Promise.all([
    supabase.from("profile").select("id").limit(1).then(unwrap),
    supabase.from("projects").select("id").limit(1).then(unwrap),
  ]);
  return profile.length === 0 && projects.length === 0;
}

/** Salin isi website lama (src/data/seed.json) ke database. */
export async function importSeed() {
  const strip = (row) => {
    const copy = { ...row };
    delete copy.id;
    return copy;
  };
  unwrap(await supabase.from("profile").upsert({ ...seed.profile, id: 1 }));
  if (seed.experiences.length) unwrap(await supabase.from("experiences").insert(seed.experiences.map(strip)));
  if (seed.skills.length) unwrap(await supabase.from("skills").insert(seed.skills.map(strip)));
  if (seed.certificates.length) unwrap(await supabase.from("certificates").insert(seed.certificates.map(strip)));
  for (const { media, ...project } of seed.projects) {
    const saved = unwrap(await supabase.from("projects").insert(strip(project)).select().single());
    if (media?.length) {
      unwrap(
        await supabase
          .from("project_media")
          .insert(media.map((m) => ({ ...strip(m), project_id: saved.id }))),
      );
    }
  }
}
