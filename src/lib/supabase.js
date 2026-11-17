import { createClient } from "@supabase/supabase-js";

/**
 * Cukup alamat dasar project, mis. "https://abcd1234.supabase.co".
 * Jika yang tertempel alamat Data API (berakhiran "/rest/v1"), akhiran itu dibuang
 * supaya permintaan tidak menjadi "/rest/v1/rest/v1/...".
 */
const url = (import.meta.env.VITE_SUPABASE_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/(rest|auth|storage)\/v1$/, "");
const key = (import.meta.env.VITE_SUPABASE_KEY || "").trim();

/** true jika website sudah dihubungkan ke Supabase lewat file .env / GitHub Secrets. */
export const isSupabaseReady = Boolean(url && key);

export const supabase = isSupabaseReady ? createClient(url, key) : null;

export const MEDIA_BUCKET = "media";
