import { ui, defaultLocale } from "./ui";
import { transliterate } from "./transliterate";

type Key = keyof (typeof ui)[typeof defaultLocale];

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/");
	if (lang in ui) return lang as keyof typeof ui;
	return defaultLocale;
}

export function useTranslations(lang: keyof typeof ui) {
	if (lang === "sr") {
		return function t(key: Key) {
			return ui.sr[key] || transliterate(ui["sr-Cyrl"][key]);
		};
	}
	return function t(key: Key) {
		return ui[lang][key] || ui[defaultLocale][key];
	};
}
