-- =====================================================================
--  Migrasi: menu Research (tabel penelitian / publikasi)
--  Hanya perlu dijalankan jika database dibuat SEBELUM fitur ini ada.
--  Database baru cukup memakai schema.sql (sudah termasuk tabel ini).
--  Cara pakai: Supabase → SQL Editor → tempel → Run. Aman dijalankan ulang.
-- =====================================================================

create table if not exists public.research (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text not null default '',
  venue text not null default '',
  year text not null default '',
  status text not null default 'published'
    check (status in ('published', 'under_review', 'ongoing')),
  abstract text not null default '',
  doi_url text not null default '',
  pdf_url text not null default '',
  keywords text[] not null default '{}',
  published boolean not null default true,
  sort_order int not null default 0,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

grant select on public.research to anon, authenticated;
grant insert, update, delete on public.research to authenticated;

alter table public.research enable row level security;
drop policy if exists "publik membaca" on public.research;
create policy "publik membaca" on public.research
  for select using (published or public.is_admin());
drop policy if exists "admin mengelola" on public.research;
create policy "admin mengelola" on public.research
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Muat ulang cache API supaya tabel baru langsung dikenali.
notify pgrst, 'reload schema';
