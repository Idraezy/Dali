-- Dali Wears — Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: every statement is idempotent (create-if-not-exists / drop-then-create).

-- =========================================
-- Tables
-- =========================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  category text not null default 'Uncategorized',
  stock integer not null default 0 check (stock >= 0),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  total numeric(12, 2) not null check (total >= 0),
  paystack_reference text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders (id) on delete cascade,
  product_id bigint references public.products (id) on delete set null,
  product_name text not null,
  product_price numeric(12, 2) not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);

-- =========================================
-- Auto-create a profile row whenever someone signs up
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================
-- Helper: is the current user an admin? (SECURITY DEFINER so it can read
-- profiles without recursing into the RLS policy below)
-- =========================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- =========================================
-- Grants: some projects don't pick up the default public-schema privileges
-- automatically, which shows up as "permission denied for table X" even
-- though RLS looks correct. This makes sure anon/authenticated/service_role
-- can reach these tables at all — RLS policies below still decide which
-- *rows* are visible.
-- =========================================

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- =========================================
-- Row Level Security
-- =========================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;

-- profiles: you can see your own row; admins can see everyone's.
-- There is deliberately no UPDATE policy for regular users — promoting an
-- account to admin is a manual step in the SQL editor / table editor, never
-- something a client request can do.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- products: readable by anyone (including logged-out visitors); only admins
-- can create/edit/delete.
drop policy if exists "products_select" on public.products;
create policy "products_select"
  on public.products for select
  using (true);

drop policy if exists "products_write" on public.products;
create policy "products_write"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- orders: a user can see/create their own orders; admins can see (and update,
-- e.g. mark fulfilled) all orders. Flipping status to 'paid' after payment is
-- done server-side with the service role key, which bypasses RLS entirely.
drop policy if exists "orders_select" on public.orders;
create policy "orders_select"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert"
  on public.orders for insert
  with check (user_id = auth.uid());

drop policy if exists "orders_update" on public.orders;
create policy "orders_update"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- order_items: visible/insertable only through an order you're allowed to see.
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "order_items_insert" on public.order_items;
create policy "order_items_insert"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- reviews: anyone can read; only signed-in users can post, and only as
-- themselves; the author (or an admin) can delete.
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select"
  on public.reviews for select
  using (true);

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert"
  on public.reviews for insert
  with check (user_id = auth.uid());

drop policy if exists "reviews_delete" on public.reviews;
create policy "reviews_delete"
  on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

-- =========================================
-- Storage: a public bucket for product photos, writable only by admins
-- =========================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_insert" on storage.objects;
create policy "product_images_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_update" on storage.objects;
create policy "product_images_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- =========================================
-- Wave 2: profile fields, wishlists, announcements, chat, store settings
-- =========================================

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists subscribed_to_updates boolean not null default false;
alter table public.profiles add column if not exists notifications_last_seen_at timestamptz not null default now();

-- Wishlists ---------------------------------------------------------------

create table if not exists public.wishlists (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on public.wishlists (user_id);

alter table public.wishlists enable row level security;

drop policy if exists "wishlists_all" on public.wishlists;
create policy "wishlists_all"
  on public.wishlists for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Announcements (feeds the header notification bell) ----------------------

create table if not exists public.announcements (
  id bigint generated always as identity primary key,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "announcements_select" on public.announcements;
create policy "announcements_select"
  on public.announcements for select
  using (true);

-- Only admins can insert directly; the trigger below (SECURITY DEFINER) is
-- the normal path for new-product announcements.
drop policy if exists "announcements_insert" on public.announcements;
create policy "announcements_insert"
  on public.announcements for insert
  with check (public.is_admin());

create or replace function public.announce_new_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.announcements (message)
  values ('New product added: ' || new.name);
  return new;
end;
$$;

drop trigger if exists on_product_created on public.products;
create trigger on_product_created
  after insert on public.products
  for each row execute function public.announce_new_product();

-- Messages (client <-> admin chat) -----------------------------------------

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  sender text not null check (sender in ('user', 'admin')),
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_id_idx on public.messages (user_id);

alter table public.messages enable row level security;

drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
  on public.messages for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
  on public.messages for insert
  with check (
    (sender = 'user' and user_id = auth.uid())
    or (sender = 'admin' and public.is_admin())
  );

drop policy if exists "messages_update" on public.messages;
create policy "messages_update"
  on public.messages for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- Store settings (single row of contact details the storefront reads) -----

create table if not exists public.store_settings (
  id integer primary key default 1,
  whatsapp_number text not null default '2349164288560',
  contact_email text not null default 'faithlawrence161@gmail.com',
  contact_phone text not null default '+234 (0)916 428 8560',
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id = 1)
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

alter table public.store_settings enable row level security;

drop policy if exists "store_settings_select" on public.store_settings;
create policy "store_settings_select"
  on public.store_settings for select
  using (true);

drop policy if exists "store_settings_update" on public.store_settings;
create policy "store_settings_update"
  on public.store_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================
-- Wave 3: review photos
-- =========================================

alter table public.reviews add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

drop policy if exists "review_images_read" on storage.objects;
create policy "review_images_read"
  on storage.objects for select
  using (bucket_id = 'review-images');

drop policy if exists "review_images_insert" on storage.objects;
create policy "review_images_insert"
  on storage.objects for insert
  with check (bucket_id = 'review-images' and auth.role() = 'authenticated');

-- Re-apply grants so the new tables are reachable too ----------------------

grant all privileges on all tables in schema public to anon, authenticated, service_role;
grant all privileges on all sequences in schema public to anon, authenticated, service_role;
