// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import { locales, defaultLocale } from "./src/i18n/ui";

// https://astro.build/config
export default defineConfig({
	trailingSlash: "always",
	redirects: {
		"/": `/${defaultLocale}/`,
	},
	i18n: {
		locales: Object.keys(locales),
		defaultLocale: defaultLocale,
		routing: {
			prefixDefaultLocale: true,
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
