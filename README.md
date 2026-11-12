# RUR Robotics

Website for the RUR Robotics faculty club. Astro on Cloudflare Workers, i18n via wuchale (`en`, `sr-Cyrl`, `sr` — Latin transliterated from Cyrillic). The join form saves applications to Supabase, which emails the applicant and the team.

## Usage

Needs Node 22.23.4 or newer.

```sh
npm install                 # install deps
npm run dev                 # start dev server
npm run build               # build to dist/

npm run wuchale             # extract strings into src/locales/*.po
npm run translit:po         # fill sr.po from sr-Cyrl.po
npm run translit:articles   # transliterate articles
```

Translate new strings in `sr-Cyrl.po`, then run `npm run translit:po`; don't edit `sr.po` by hand.

## Services

| Service              | What it does                                               | Configured in               |
| -------------------- | ---------------------------------------------------------- | --------------------------- |
| Cloudflare Workers   | Hosts the site and runs the join form action               | `wrangler.jsonc`, dashboard |
| Cloudflare Turnstile | Bot check on the join form                                 | dashboard                   |
| Supabase             | Stores applications, sends emails through an Edge Function | `supabase/`, dashboard      |
| Zoho Mail            | SMTP account that sends as `join@rurrobotics.com`          | Zoho admin                  |

### Values and where they live

| Name                         | Kind   | Where it's set                             | Read by                       |
| ---------------------------- | ------ | ------------------------------------------ | ----------------------------- |
| `SUPABASE_URL`               | public | `vars` in `wrangler.jsonc`                 | Worker                        |
| `TURNSTILE_SITE_KEY`         | public | `vars` in `wrangler.jsonc`                 | Worker (join form widget)     |
| `SUPABASE_PUBLISHABLE_KEY`   | secret | Worker secret                              | Worker                        |
| `TURNSTILE_SECRET_KEY`       | secret | Worker secret                              | Worker                        |
| `project_url`                | secret | Supabase Vault                             | `applications` trigger        |
| `application_emails_secret`  | secret | Supabase Vault                             | `applications` trigger        |
| `APPLICATION_EMAILS_SECRET`  | secret | Edge Function secret (same value as above) | `application-emails` function |
| `SMTP_USER`, `SMTP_PASSWORD` | secret | Edge Function secrets                      | `application-emails` function |

Local dev reads the Worker secrets from `.env` (git-ignored) and the public values from `wrangler.jsonc`.

## Setting up from scratch

Do these in order: Supabase first (the Worker needs its URL and key), then Zoho, then Turnstile, then Cloudflare. The same steps apply when moving any one service to another account. See [Moving to another account](#moving-to-another-account).

### 1. Supabase

1. Create a project in the Supabase dashboard (Postgres 17, matching `supabase/config.toml`). Note its project ref, the `<ref>` in `https://<ref>.supabase.co`.
2. Link the repo and apply the schema:

    ```sh
    npx supabase login
    npx supabase link --project-ref <ref>
    npx supabase db push        # applies supabase/migrations/: the applications table, RLS and the email trigger
    npm run db:types            # regenerates src/lib/supabase.types.ts
    ```

3. Store the two values the trigger reads in the Vault. Generate the shared secret once (for example `openssl rand -hex 32`) and keep it for step 5:

    ```sh
    npx supabase db query --linked "select vault.create_secret('https://<ref>.supabase.co', 'project_url')"
    npx supabase db query --linked "select vault.create_secret('<random>', 'application_emails_secret')"
    ```

4. Deploy the email function. `--use-api` deploys without Docker. `verify_jwt = false` in `config.toml` is picked up automatically; the function checks the shared secret itself.

    ```sh
    npx supabase functions deploy application-emails --use-api
    ```

5. Give the function its secrets (the Zoho values come from the next section):

    ```sh
    npx supabase secrets set APPLICATION_EMAILS_SECRET=<random> SMTP_USER=<zoho user> SMTP_PASSWORD=<zoho app password>
    ```

6. In the dashboard under **Project Settings → API Keys**, copy the **publishable** key (`sb_publishable_…`). It goes to the Worker. Thanks to RLS it can only insert applications, never read them.

### 2. Zoho Mail

The function sends through `smtp.zoho.eu:465` (Supabase blocks ports 25 and 587). The sender `join@rurrobotics.com` and the team inbox `kontakt@rurrobotics.com` are hardcoded in `supabase/functions/application-emails/index.ts`.

1. Make sure `join@rurrobotics.com` exists as a mailbox, or as an alias of the account you log in with, so Zoho allows sending as it.
2. With two-factor auth on, create an **app password** for that account (My Account → Security → App Passwords).
3. `SMTP_USER` is the account's login address, `SMTP_PASSWORD` the app password. Set them with step 5 above.
4. Keep Zoho's SPF and DKIM records in the domain's DNS so the emails don't land in spam.

If the account moves to a non-EU Zoho data center, change `host` in the function and redeploy it.

### 3. Cloudflare Turnstile

1. In the Cloudflare dashboard go to **Turnstile → Add widget**. Add the hostname `rurrobotics.com` and choose the **Managed** mode.
2. Put the **site key** in `vars.TURNSTILE_SITE_KEY` in `wrangler.jsonc` and commit it.
3. Keep the **secret key** for the next section.

For local dev, use Cloudflare's test keys in `.env`: they always pass.

```sh
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

### 4. Cloudflare Workers

The Worker is called `rurrobotics` (`name` in `wrangler.jsonc`). It serves `dist/` through the `ASSETS` binding and renders the join form action on demand. Sessions are off, so it needs no KV namespace.

1. Set `vars.SUPABASE_URL` in `wrangler.jsonc` to `https://<ref>.supabase.co`.
2. Connect the GitHub repo under **Workers & Pages → Create → Import a repository** (Workers Builds):
    - production branch: `stable`
    - build command: `npm run build`
    - deploy command: `npx wrangler deploy`

    The build uses Node 22, taken from `.node-version`. To deploy by hand instead, run `npm run build && npx wrangler deploy`.

3. Add the secrets. Run this after the first deploy, since the Worker has to exist:

    ```sh
    npx wrangler login
    npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
    npx wrangler secret put TURNSTILE_SECRET_KEY
    ```

4. Under the Worker's **Settings → Domains & Routes**, add `rurrobotics.com` as a custom domain. The domain's DNS must be on the same Cloudflare account.

### 5. Local `.env`

```sh
SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

## Moving to another account

**Supabase.** Before switching, export the data: `npx supabase db dump --linked --data-only -f applications.sql`. Then:

1. Do all of section 1 on the new project.
2. Load the data with `psql "<new connection string>" -f applications.sql`.
3. Update `SUPABASE_URL` in `wrangler.jsonc`.
4. Run `npx wrangler secret put SUPABASE_PUBLISHABLE_KEY` with the new key.
5. Deploy.

**Cloudflare.**

1. Move the domain's DNS zone to the new account.
2. Create a new Turnstile widget and put its site key in `wrangler.jsonc`.
3. Do section 4 again, including both Worker secrets.
4. If the Worker name changes, update `name` in `wrangler.jsonc`.

**Zoho.** Make a new app password and update the function's secrets:

```sh
npx supabase secrets set SMTP_USER=<user> SMTP_PASSWORD=<app password>
```

If the sender or team addresses change, edit `FROM` / `TEAM` in the function and redeploy it.

**Rotating the shared email secret.** Change the Vault value and the function secret together, or the emails stop:

```sh
npx supabase db query --linked "select vault.update_secret((select id from vault.secrets where name = 'application_emails_secret'), '<new>')"
npx supabase secrets set APPLICATION_EMAILS_SECRET=<new>
```

## Checking it works

Send a test application through `/sr/join/`, then check:

- the row appears in the `applications` table
- both emails arrive: the confirmation to the applicant and the notification to `kontakt@`

If no emails arrive:

- look at the function's logs in the Supabase dashboard
- check `select * from net._http_response order by id desc limit 5;` for the trigger's request

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
