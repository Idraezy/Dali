# Dali Wears — Fullstack Setup

Everything code-related is already built. This is the checklist of manual steps
you need to do once (in Supabase, Telegram, Paystack, and Vercel dashboards) to
bring the site online.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project. Pick any name/region.
2. Once it's ready, go to **Project Settings → API**. You'll need:
   - `Project URL` → this is `VITE_SUPABASE_URL`
   - `anon public` key → this is `VITE_SUPABASE_ANON_KEY`
   - `service_role` key (click "Reveal") → this is `SUPABASE_SERVICE_ROLE_KEY`
     (**never** put this one in `VITE_`-prefixed vars or client code — it bypasses
     all security rules)

## 2. Run the database schema

1. In Supabase, open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. This creates all tables, security rules, and the `product-images` storage bucket.
   It's safe to re-run if you ever need to.

## 3. Create your Telegram bot

1. In Telegram, message **[@BotFather](https://t.me/BotFather)** → `/newbot` → follow the
   prompts (pick a name and a username ending in `bot`).
2. BotFather replies with a token like `123456789:AAExampleTokenHere`. This is
   `TELEGRAM_BOT_TOKEN`.
3. Send your new bot any message (e.g. "hi") so it can see your chat.
4. Visit this URL in your browser (with your real token):
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
5. In the JSON response, find `"chat":{"id":123456789,...}` — that number is
   `TELEGRAM_CHAT_ID`.

## 4. Create a Paystack account

1. Sign up at [paystack.com](https://paystack.com) (test mode is fine to start).
2. Go to **Settings → API Keys & Webhooks**. You'll need:
   - `Public Key` → `VITE_PAYSTACK_PUBLIC_KEY`
   - `Secret Key` → `PAYSTACK_SECRET_KEY`

## 5. Set environment variables

**Locally:** copy `.env.local.example` to `.env.local` and fill in every value
from steps 1–4.

**On Vercel:** Project → Settings → Environment Variables, add the same 7
variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
`VITE_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`) for Production (and Preview,
if you want previews to work too).

## 6. Seed the product catalog

The old hardcoded product list has been removed from the code. To carry over
the current catalog (instead of starting from an empty shop), run once:

```bash
npm run seed
```

This uploads the existing product photos to Supabase Storage and creates the
matching rows in the `products` table. After this, all product management
happens through `/admin` — this script doesn't need to run again.

## 7. Create your account and become admin

1. Run the site (see "Running locally" below) and sign up for an account
   through the normal `/signup` page, using the email you want as the store
   owner/admin.
2. In Supabase, go to **Table Editor → profiles**, find the row with your
   email, and set `is_admin` to `true`.
3. Log out and back in (or just refresh) — you'll now see an "Admin" link in
   the header leading to `/admin`.

## Running locally

Because this project now has serverless API functions under `/api` (for
Telegram and Paystack verification), plain `vite dev` won't run them. Use the
Vercel CLI instead so both the frontend and the API routes work together:

```bash
npm install -g vercel   # one-time
vercel dev
```

`vercel dev` reads `.env.local` automatically. Plain `npm run dev` still works
for UI-only work, but signup/login notifications and Paystack verification
will fail with 404s since there's no server for `/api/*` in that mode.

## What each moving part does

- **Supabase Postgres** — products, orders, order items, reviews, profiles.
  Row Level Security enforces who can read/write what (see `supabase/schema.sql`).
- **Supabase Auth** — signup/login. A database trigger auto-creates a
  `profiles` row for every new user.
- **Supabase Storage** — product photos uploaded from `/admin`.
- **`/api/notify-telegram`** — called after every successful login/signup;
  verifies the session server-side, then messages your bot.
- **`/api/paystack-verify`** — called after a Paystack popup succeeds;
  re-verifies the payment with Paystack's servers (never trusts the client),
  then marks the order paid and notifies Telegram.
