import * as main from "./locales/main.loader.js";
import { runWithLocale, loadLocales } from "wuchale/load-utils/server";
import { locales, defaultLocale } from "./locales/config.js";
import { securityHeaders } from "./lib/security-headers.js";

loadLocales(main.key, main.loadCount, main.loadCatalog, locales);

export async function onRequest(context, next) {
	// Error pages have no `lang` param, so read the locale off the URL's
	// first segment; on-demand pages can be asked for any `lang`, so fall
	// back for unknown ones.
	const lang = context.params.lang ?? context.url.pathname.split("/")[1];
	const locale = locales.includes(lang) ? lang : defaultLocale;
	const response = await runWithLocale(locale, next);

	// The static pages get these from public/_headers. The dev server needs
	// inline scripts and a websocket that the policy would block.
	if (import.meta.env.PROD) {
		for (const [name, value] of Object.entries(securityHeaders)) {
			response.headers.set(name, value);
		}
	}
	return response;
}
