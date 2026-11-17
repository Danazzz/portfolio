-- =====================================================================
--  Migrasi: minat & zona waktu (beranda), peran & tahun proyek
--  Hanya perlu dijalankan jika database dibuat SEBELUM fitur ini ada.
--  Database baru cukup memakai schema.sql (sudah termasuk kolom ini).
--  Cara pakai: Supabase → SQL Editor → tempel → Run. Aman dijalankan ulang.
-- =====================================================================

alter table public.profile add column if not exists interests text[] not null default '{}';
alter table public.profile add column if not exists timezone text not null default '';
alter table public.projects add column if not exists role text not null default '';
alter table public.projects add column if not exists year text not null default '';

-- Muat ulang cache API supaya kolom baru langsung dikenali.
notify pgrst, 'reload schema';
