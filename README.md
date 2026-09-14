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