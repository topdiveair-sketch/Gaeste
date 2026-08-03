-- Bereits im Supabase-Projekt veqlrabxvwurwnezjstg ausgeführt.
create extension if not exists pgcrypto;

create table if not exists public.chronicle_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 100),
  body text not null check (char_length(body) between 10 and 4000),
  category text not null check (category in ('welterbesteig','donauradweg','heuriger','ausflug','windis','marillen','fruehstueck','sonstiges')),
  author_name text check (char_length(author_name) <= 60),
  photo_urls text[] not null default '{}' check (cardinality(photo_urls) <= 10),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint published_date_required check (status <> 'published' or published_at is not null)
);

alter table public.chronicle_entries enable row level security;
revoke all on public.chronicle_entries from anon, authenticated;
grant select, insert on public.chronicle_entries to anon;
grant select, insert, update on public.chronicle_entries to authenticated;

create policy "Guests can submit pending stories" on public.chronicle_entries
for insert to anon, authenticated with check (status='pending' and published_at is null and likes=0 and cardinality(photo_urls)<=10);
create policy "Published stories are public" on public.chronicle_entries
for select to anon using (status='published');
create policy "Chronicle admin can read all" on public.chronicle_entries
for select to authenticated using (lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com');
create policy "Chronicle admin can moderate" on public.chronicle_entries
for update to authenticated
using (lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com')
with check (lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com' and status in ('pending','published','rejected'));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('chronicle-photos','chronicle-photos',true,8388608,array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif','image/bmp','image/tiff'])
on conflict (id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif','image/bmp','image/tiff'];

create policy "Guests can upload chronicle photos" on storage.objects
for insert to anon, authenticated with check (bucket_id='chronicle-photos' and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','gif','avif','heic','heif','bmp','tif','tiff'));
-- Storage returns the new object after INSERT, so anonymous uploads also need SELECT.
create policy "Guests can read uploaded chronicle photos" on storage.objects
for select to anon, authenticated using (bucket_id='chronicle-photos' and lower(storage.extension(name)) in ('jpg','jpeg','png','webp','gif','avif','heic','heif','bmp','tif','tiff'));
create policy "Chronicle admin can delete photos" on storage.objects
for delete to authenticated using (bucket_id='chronicle-photos' and lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com');
-- Bereits im Supabase-Projekt veqlrabxvwurwnezjstg ausgeführt.
create extension if not exists pgcrypto;

create table if not exists public.chronicle_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 100),
  body text not null check (char_length(body) between 10 and 4000),
  category text not null check (category in ('welterbesteig','donauradweg','heuriger','ausflug','windis','marillen','fruehstueck','sonstiges')),
  author_name text check (char_length(author_name) <= 60),
  photo_urls text[] not null default '{}' check (cardinality(photo_urls) <= 10),
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  likes integer not null default 0 check (likes >= 0),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  constraint published_date_required check (status <> 'published' or published_at is not null)
);

alter table public.chronicle_entries enable row level security;
revoke all on public.chronicle_entries from anon, authenticated;
grant select, insert on public.chronicle_entries to anon;
grant select, update on public.chronicle_entries to authenticated;

create policy "Guests can submit pending stories" on public.chronicle_entries
for insert to anon with check (status='pending' and published_at is null and likes=0 and cardinality(photo_urls)<=10);
create policy "Published stories are public" on public.chronicle_entries
for select to anon using (status='published');
create policy "Chronicle admin can read all" on public.chronicle_entries
for select to authenticated using (lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com');
create policy "Chronicle admin can moderate" on public.chronicle_entries
for update to authenticated
using (lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com')
with check (lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com' and status in ('pending','published','rejected'));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('chronicle-photos','chronicle-photos',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

create policy "Guests can upload chronicle photos" on storage.objects
for insert to anon with check (bucket_id='chronicle-photos' and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));
-- Storage returns the new object after INSERT, so anonymous uploads also need SELECT.
create policy "Guests can read uploaded chronicle photos" on storage.objects
for select to anon using (bucket_id='chronicle-photos' and lower(storage.extension(name)) in ('jpg','jpeg','png','webp'));
create policy "Chronicle admin can delete photos" on storage.objects
for delete to authenticated using (bucket_id='chronicle-photos' and lower(coalesce(auth.jwt()->>'email',''))='topdiveair@gmail.com');
