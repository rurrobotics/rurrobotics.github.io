import { defaultLocale, locales, type Locale } from "./config.js";

export const getStaticPaths = () =>
	locales.map((lang) => ({ params: { lang } }));

/** Narrows `Astro.currentLocale` (any string) to one of our locales. */
export const pageLocale = (currentLocale: string | undefined): Locale =>
	(currentLocale ?? defaultLocale) as Locale;
