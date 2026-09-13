# Dali Mobile — Setup

The app code is done. This is the checklist to get it running and built into an
installable Android APK.

## 1. Environment variables

Copy `.env.example` to `.env` and fill in:

- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` —
  the same public-safe values already in `my-project/.env.local` (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`, `VITE_PAYSTACK_PUBLIC_KEY`). Never put the service-role or
  Paystack **secret** keys here — this app only ever talks to Supabase with the anon key,
  same as the website's browser code.
- `EXPO_PUBLIC_API_BASE_URL` — the deployed website's URL (e.g. `https://daliwears.vercel.app`).
  The mobile app has no backend of its own; it calls the website's `/api/*` functions
  (Telegram notify, Paystack initialize/verify) over HTTPS. **The website must be deployed
  to Vercel before this app can log in, chat, or take payments** — if you haven't deployed
  it yet, do that first, then come back and set this value.

## 2. Run it during development

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS or Android) to run it on your phone instantly —
no build needed for day-to-day development. Every change hot-reloads.

## 3. Build an installable Android APK (EAS Build)

1. Create a free account at [expo.dev](https://expo.dev) if you don't have one.
2. Log in from the terminal: `npx eas login` (or hand me an access token — see below).
3. Set the same env vars as EAS Secrets so the cloud build can see them:
   ```bash
   npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "..."
   npx eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
   npx eas secret:create --scope project --name EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY --value "..."
   npx eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "..."
   ```
4. Build: `npx eas build --platform android --profile preview`
5. When it finishes, EAS gives you a download link (and a QR code) for the `.apk` — download
   it to your Android phone and install it directly (you'll need to allow "install from
   unknown sources" once, since it's not from the Play Store).

**To let me run the build instead:** generate a token at expo.dev → account settings →
Access Tokens, and give it to me as `EXPO_TOKEN`. I can then run
`EXPO_TOKEN=... npx eas build --platform android --profile preview --non-interactive`
from here.

## Why there's no iOS build option here

Apple requires a paid Apple Developer account ($99/year) before **any** installable iOS
build exists — even ad-hoc, non-App-Store installs need a registered device + provisioning
profile tied to that account. This isn't an Expo limitation; there's no free path to an
installable iOS app. Once you have (or want) an Apple Developer account, the same `eas
build --platform ios --profile preview` command works and I can walk you through the device
registration step.

## What's shared with the website

Same Supabase project — same products, accounts, orders, wishlist, chat, and reviews.
Anything the admin adds/changes on the website (products, order status, chat replies)
shows up here too, and vice versa. The admin dashboard itself isn't part of this app —
that stays web-only at `/admin`.
