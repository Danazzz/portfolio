import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";

/**
 * Cukup alamat dasar project, mis. "https://abcd1234.supabase.co".
 * Jika yang tertempel alamat Data API (berakhiran "/rest/v1"), akhiran itu dibuang
 * supaya permintaan tidak menjadi "/rest/v1/rest/v1/...".
 */
const url = rawUrl
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/(rest|auth|storage)\/v1$/, "");
const key = (import.meta.env.VITE_SUPABASE_KEY || "").trim();

/** true jika website sudah dihubungkan ke Supabase lewat file .env / GitHub Secrets. */
export const isSupabaseReady = Boolean(url && key);

export const supabase = isSupabaseReady ? createClient(url, key) : null;

export const MEDIA_BUCKET = "media";

/** Jenis kunci: publishable/anon (aman untuk publik) atau secret/service_role (BERBAHAYA). */
const keyKind = (k) => {
  if (!k) return "missing";
  if (k.startsWith("sb_publishable_")) return "publishable";
  if (k.startsWith("sb_secret_")) return "secret";
  try {
    const role = JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role;
    return role === "anon" ? "anon" : role === "service_role" ? "secret" : "unknown";
  } catch {
    return "unknown";
  }
};

/** Info konfigurasi untuk halaman Cek Sistem (tanpa membocorkan kuncinya). */
export const supabaseConfig = {
  rawUrl,
  url,
  urlWasFixed: Boolean(rawUrl) && rawUrl.trim() !== url,
  keyKind: keyKind(key),
};
