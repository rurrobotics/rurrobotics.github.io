import * as main from "./locales/main.loader.js";
import { runWithLocale, loadLocales } from "wuchale/load-utils/server";
import { locales, defaultLocale } from "./locales/config.js";

loadLocales(main.key, main.loadCount, main.loadCatalog, locales);

export function onRequest(context, next) {
	const locale = context.params.lang ?? defaultLocale;
	return runWithLocale(locale, next);
}
