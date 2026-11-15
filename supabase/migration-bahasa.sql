-- =====================================================================
--  Migrasi: fitur dua bahasa (English + Bahasa Indonesia)
--  Hanya perlu dijalankan jika database dibuat SEBELUM fitur ini ada.
--  Database baru cukup memakai schema.sql (sudah termasuk kolom ini).
--  Cara pakai: Supabase → SQL Editor → tempel → Run. Aman dijalankan ulang.
-- =====================================================================

alter table public.profile add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.projects add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.experiences add column if not exists translations jsonb not null default '{}'::jsonb;

-- Muat ulang cache API supaya kolom baru langsung dikenali.
notify pgrst, 'reload schema';
