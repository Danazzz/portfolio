-- =====================================================================
--  Skema database portfolio
--  Cara pakai: buka Supabase → SQL Editor → New query → tempel seluruh
--  isi file ini → Run. Aman dijalankan ulang.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  Admin: hanya user yang terdaftar di tabel ini yang boleh mengubah data
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
--  Tabel konten
-- ---------------------------------------------------------------------
create table if not exists public.profile (
  id int primary key default 1 check (id = 1),
  name text not null default '',
  headline text not null default '',
  location text not null default '',
  about text not null default '',
  avatar_url text not null default '',
  about_image_url text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  gitlab_url text not null default '',
  cv_url text not null default '',
  translations jsonb not null default '{}'::jsonb
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  description text not null default '',
  category text not null default '',
  tags text[] not null default '{}',
  demo_url text not null default '',
  source_url text not null default '',
  display_mode text not null default 'carousel'
    check (display_mode in ('carousel', 'grid', 'single')),
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text not null check (type in ('image', 'video', 'youtube')),
  url text not null,
  caption text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_media_project_idx
  on public.project_media (project_id, sort_order);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organisation text not null default '',
  start_date text not null default '',
  end_date text not null default '',
  highlights text[] not null default '{}',
  sort_order int not null default 0,
  translations jsonb not null default '{}'::jsonb
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '',
  icon_url text not null default '',
  sort_order int not null default 0
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null default '',
  issued_at text not null default '',
  image_url text not null default '',
  credential_url text not null default '',
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------
--  Terjemahan Bahasa Indonesia (aman untuk database yang dibuat sebelum
--  fitur dua bahasa). Isi: {"id": {"summary": "...", "description": "..."}}
-- ---------------------------------------------------------------------
alter table public.profile add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.projects add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.experiences add column if not exists translations jsonb not null default '{}'::jsonb;

-- Kelompok skill (Frontend, Backend, ...) — aman untuk database lama
alter table public.skills add column if not exists category text not null default '';

-- ---------------------------------------------------------------------
--  Hak akses (Row Level Security)
--  Pengunjung: hanya bisa MEMBACA. Admin: bisa menambah/ubah/hapus.
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins enable row level security;
drop policy if exists "admin melihat dirinya" on public.admins;
create policy "admin melihat dirinya" on public.admins
  for select to authenticated using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['profile', 'experiences', 'skills', 'certificates'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "publik membaca" on public.%I', t);
    execute format('create policy "publik membaca" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin mengelola" on public.%I', t);
    execute format(
      'create policy "admin mengelola" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
  end loop;
end $$;

alter table public.projects enable row level security;
drop policy if exists "publik membaca" on public.projects;
create policy "publik membaca" on public.projects
  for select using (published or public.is_admin());
drop policy if exists "admin mengelola" on public.projects;
create policy "admin mengelola" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.project_media enable row level security;
drop policy if exists "publik membaca" on public.project_media;
create policy "publik membaca" on public.project_media
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and (p.published or public.is_admin())
    )
  );
drop policy if exists "admin mengelola" on public.project_media;
create policy "admin mengelola" on public.project_media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
--  Penyimpanan file (foto, video, ikon, sertifikat) — maks 50 MB per file
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800, array['image/*', 'video/*', 'application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- (hapus file butuh izin select + delete)
drop policy if exists "admin lihat media" on storage.objects;
create policy "admin lihat media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin upload media" on storage.objects;
create policy "admin upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin ubah media" on storage.objects;
create policy "admin ubah media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin hapus media" on storage.objects;
create policy "admin hapus media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
--  LANGKAH TERAKHIR (jalankan terpisah setelah membuat user admin di
--  menu Authentication → Users). Ganti email di bawah dengan email Anda:
--
--  insert into public.admins (user_id)
--  select id from auth.users where email = 'email-anda@contoh.com'
--  on conflict do nothing;
-- =====================================================================
