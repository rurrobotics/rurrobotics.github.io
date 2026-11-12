import * as main from "./locales/main.loader.js";
import { runWithLocale, loadLocales } from "wuchale/load-utils/server";
import { locales, defaultLocale } from "./locales/config.js";

loadLocales(main.key, main.loadCount, main.loadCatalog, locales);

export function onRequest(context, next) {
	// Error pages have no `lang` param, so read the locale off the URL's
	// first segment; on-demand pages can be asked for any `lang`, so fall
	// back for unknown ones.
	const lang = context.params.lang ?? context.url.pathname.split("/")[1];
	const locale = locales.includes(lang) ? lang : defaultLocale;
	return runWithLocale(locale, next);
}
