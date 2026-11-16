-- =====================================================================
--  Migrasi: kelompok skill (Frontend, Backend, Database, ...)
--  Hanya perlu dijalankan jika database dibuat SEBELUM fitur ini ada.
--  Database baru cukup memakai schema.sql (sudah termasuk kolom ini).
--  Cara pakai: Supabase → SQL Editor → tempel → Run. Aman dijalankan ulang.
-- =====================================================================

alter table public.skills add column if not exists category text not null default '';

-- Muat ulang cache API supaya kolom baru langsung dikenali.
notify pgrst, 'reload schema';
