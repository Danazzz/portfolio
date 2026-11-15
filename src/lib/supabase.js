import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

/** true jika website sudah dihubungkan ke Supabase lewat file .env / GitHub Secrets. */
export const isSupabaseReady = Boolean(url && key);

export const supabase = isSupabaseReady ? createClient(url, key) : null;

export const MEDIA_BUCKET = "media";
