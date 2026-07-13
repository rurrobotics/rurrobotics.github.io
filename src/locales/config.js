/** @typedef {('en'|'sr-Cyrl'|'sr')} Locale */

/** @type {[Locale, ...Locale[]]} */
export const locales = ["en", "sr-Cyrl", "sr"];

/** @type {Locale} */
export const defaultLocale = "sr";

export const localeTags = {
	en: "en",
	"sr-Cyrl": "sr-Cyrl-RS",
	sr: "sr-Latn-RS",
};
