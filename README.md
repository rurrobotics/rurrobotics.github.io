# RUR Robotics

Website for the RUR Robotics faculty club. Astro + Svelte (shadcn-svelte), i18n via wuchale (`en`, `sr-Cyrl`, `sr` — Latin auto-transliterated from Cyrillic).

## Usage

```sh
npm install          # install deps
npm run dev          # start dev server
npm run build        # extract i18n + build to dist/

npm run i18n         # extract strings (wuchale) + transliterate sr-Cyrl -> sr
npm run translit     # transliterate only

npx shadcn-svelte@latest add <name>   # add a UI component (lands in src/shadcn/)
```

## Supabase

The join form saves to Supabase; everything lives in `supabase/` and is applied from the terminal.

```sh
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push                                 # apply supabase/migrations/
npm run db:types                                     # regenerate src/supabase.types.ts
npx supabase functions deploy application-emails --use-api
```

One-time secrets (not in repo):

```sh
# Vault, read by the trigger that calls the email function
npx supabase db query --linked "select vault.create_secret('https://<ref>.supabase.co', 'project_url')"
npx supabase db query --linked "select vault.create_secret('<random>', 'application_emails_secret')"

# Edge Function: the same random value, and the Zoho login that sends as join@rurrobotics.com
npx supabase secrets set APPLICATION_EMAILS_SECRET=<random> SMTP_USER=<zoho user> SMTP_PASSWORD=<zoho app password>

# Worker
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Local dev reads `.env` instead of the Worker secrets; use Cloudflare's Turnstile test keys there.

## TODO

### Articles page

- Translations for `COPY`/`COPIED`
- Redo style for blockquote
- Redo style for inline code

### Navbar

- Redesign the locale switcher
- Animations for mobile

### Performance

- Trim the fonts (about 106 KB for the Latin subsets): drop JetBrains Mono, which only labels use, or subset the fonts further
- Serve photos as AVIF with a WebP fallback (`<Picture>`), about 25-30% smaller, once the gallery grows. It slows builds down
