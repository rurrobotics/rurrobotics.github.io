import type { Locale } from "@locales/config.js";
import oswaldLatin from "@fontsource-variable/oswald/files/oswald-latin-wght-normal.woff2?url";
import oswaldLatinExt from "@fontsource-variable/oswald/files/oswald-latin-ext-wght-normal.woff2?url";
import oswaldCyrillic from "@fontsource-variable/oswald/files/oswald-cyrillic-wght-normal.woff2?url";
import golosLatin from "@fontsource-variable/golos-text/files/golos-text-latin-wght-normal.woff2?url";
import golosLatinExt from "@fontsource-variable/golos-text/files/golos-text-latin-ext-wght-normal.woff2?url";
import golosCyrillic from "@fontsource-variable/golos-text/files/golos-text-cyrillic-wght-normal.woff2?url";
import monoLatin from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url";
import monoLatinExt from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2?url";
import monoCyrillic from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-cyrillic-wght-normal.woff2?url";

const latin = [oswaldLatin, golosLatin, monoLatin];
const latinExt = [oswaldLatinExt, golosLatinExt, monoLatinExt];
const cyrillic = [oswaldCyrillic, golosCyrillic, monoCyrillic];

/**
 * The font files a page in each locale needs straight away, to preload so the
 * browser doesn't wait for the CSS to find them. The font CSS only downloads a
 * subset when the page uses its characters, so list just the ones every page
 * of that locale does: Serbian Latin needs the extended set for č, ć, š, ž, đ;
 * Serbian Cyrillic needs Cyrillic plus the Latin used for brand names.
 */
export const preloadedFonts: Record<Locale, string[]> = {
	en: latin,
	sr: [...latin, ...latinExt],
	"sr-Cyrl": [...cyrillic, ...latin],
};
