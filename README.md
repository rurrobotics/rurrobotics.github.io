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

## TODO

### Articles page
- Translations for `COPY`/`COPIED`
- Redo style for blockquote
- Redo style for inline code

### Navbar
- Redesign the locale switcher
- Animations for mobile

### Performance
- Put Cloudflare (free plan) in front of the site: GitHub Pages serves gzip only with a short cache lifetime, while the hashed files in `_astro/` can be cached for a year. Add a cache rule for `/_astro/*` and enable Brotli
- Trim the fonts (about 106 KB for the Latin subsets): drop JetBrains Mono, which only labels use, or subset the fonts further
- Serve photos as AVIF with a WebP fallback (`<Picture>`), about 25-30% smaller, once the gallery grows. It slows builds down
