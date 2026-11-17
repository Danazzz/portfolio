import { MEDIA_BUCKET, supabase, supabaseConfig } from "../lib/supabase";
import { errorKind, missingName } from "../lib/errors";
import { friendlyError, migrationFor } from "../lib/api";

/** Tabel + kolom yang dibutuhkan website. Kolom baru ditaruh di sini supaya ketahuan bila migrasi belum jalan. */
export const TABLE_SPECS = [
  { table: "profile", label: "Profil", columns: ["id", "name", "translations", "interests", "timezone"] },
  { table: "projects", label: "Proyek", columns: ["id", "title", "category", "role", "year", "translations"] },
  { table: "project_media", label: "Media proyek", columns: ["id", "url"] },
  { table: "experiences", label: "Pengalaman", columns: ["id", "translations"] },
  { table: "skills", label: "Skill", columns: ["id", "category"] },
  { table: "certificates", label: "Sertifikat", columns: ["id"] },
  { table: "research", label: "Penelitian", columns: ["id", "title", "status", "keywords", "published", "translations"] },
];

// Hasil cek sudah tampil di layar, jadi tidak perlu ikut masuk log error.
const QUIET = { log: false };

const ok = (label, detail) => ({ label, status: "ok", detail });
const warn = (label, detail, fix) => ({ label, status: "warn", detail, fix });
const fail = (label, detail, fix, error) => ({ label, status: "fail", detail, fix, error });

function checkUrl() {
  const label = "Alamat Supabase (VITE_SUPABASE_URL)";
  const { url, rawUrl, urlWasFixed } = supabaseConfig;
  if (!url) return fail(label, "Belum diisi.", "Isi secret VITE_SUPABASE_URL di GitHub → Settings → Secrets → Actions.");
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url))
    return fail(label, `Format tidak dikenali: ${url}`, "Gunakan alamat seperti https://abcd1234.supabase.co (Project Settings → Data API).");
  if (urlWasFixed)
    return warn(
      label,
      `Tertulis "${rawUrl.trim()}", dipakai sebagai ${url}.`,
      `Website tetap jalan, tapi sebaiknya secret diisi persis: ${url}`,
    );
  return ok(label, url);
}

function checkKey() {
  const label = "Kunci Supabase (VITE_SUPABASE_KEY)";
  switch (supabaseConfig.keyKind) {
    case "publishable":
      return ok(label, "Publishable key — aman untuk website publik.");
    case "anon":
      return ok(label, "Anon key (legacy) — aman untuk website publik.");
    case "secret":
      return fail(
        label,
        "Ini SECRET / service_role key! Kunci ini membuka seluruh database dan sekarang terlihat oleh siapa pun.",
        "Segera ganti secret dengan Publishable key, lalu buat ulang (rotate) secret key di Supabase → Project Settings → API Keys.",
      );
    case "missing":
      return fail(label, "Belum diisi.", "Isi secret VITE_SUPABASE_KEY dengan Publishable key.");
    default:
      return warn(label, "Format kunci tidak dikenali.", "Pastikan memakai Publishable key (diawali sb_publishable_).");
  }
}

async function checkConnection() {
  const label = "Koneksi ke database";
  const res = await supabase.from("profile").select("id").limit(1);
  if (!res.error) return ok(label, "Terhubung.");
  const error = { ...res.error, status: res.status };
  return fail(label, friendlyError(error, "Cek Sistem", QUIET), null, error);
}

async function checkTable({ table, label, columns }) {
  // GET (bukan HEAD) supaya pesan error-nya ikut terbawa, mis. nama kolom yang hilang.
  const res = await supabase.from(table).select(columns.join(","), { count: "exact" }).limit(1);
  if (!res.error) return ok(`Tabel ${label}`, `${res.count ?? 0} baris`);
  const error = { ...res.error, status: res.status };
  if (errorKind(error) === "schema") {
    const name = missingName(error);
    const isColumn = name && name !== table;
    return fail(
      `Tabel ${label}`,
      isColumn ? `Kolom "${name}" belum ada.` : "Tabel belum dibuat.",
      `Jalankan supabase/${migrationFor(isColumn ? name : table)} di Supabase → SQL Editor.`,
      error,
    );
  }
  return fail(`Tabel ${label}`, friendlyError(error, "Cek Sistem", QUIET), null, error);
}

async function checkAdmin() {
  const label = "Akun admin";
  const { data: session } = await supabase.auth.getSession();
  const email = session.session?.user?.email;
  const res = await supabase.rpc("is_admin");
  if (res.error) return fail(label, friendlyError({ ...res.error, status: res.status }, "Cek Sistem", QUIET), "Jalankan supabase/schema.sql.", res.error);
  return res.data
    ? ok(label, `${email} terdaftar sebagai admin.`)
    : fail(label, `${email} belum terdaftar sebagai admin.`, "Jalankan perintah insert into public.admins … (lihat bagian akhir schema.sql).");
}

async function checkStorage() {
  const label = `Penyimpanan file (bucket "${MEDIA_BUCKET}")`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).list("", { limit: 1 });
  if (!error) return ok(label, "Siap dipakai.");
  return fail(label, friendlyError(error, "Cek Sistem", QUIET), "Jalankan supabase/schema.sql untuk membuat bucket & aturannya.", error);
}

/** Jalankan semua pemeriksaan; `onResult` dipanggil tiap satu selesai supaya tampil bertahap. */
export async function runSystemCheck(onResult) {
  const steps = [
    async () => checkUrl(),
    async () => checkKey(),
    checkConnection,
    ...TABLE_SPECS.map((spec) => () => checkTable(spec)),
    checkAdmin,
    checkStorage,
  ];
  const results = [];
  for (const step of steps) {
    let result;
    try {
      result = await step();
    } catch (e) {
      result = fail("Pemeriksaan gagal dijalankan", friendlyError(e, "Cek Sistem", QUIET), null, e);
    }
    results.push(result);
    onResult([...results]);
  }
  return results;
}
