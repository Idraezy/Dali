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
