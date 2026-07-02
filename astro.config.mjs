// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import { locales, defaultLocale, localeTags } from "./src/i18n/ui";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://rurrobotics.rs/",
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
	integrations: [
		sitemap({
			i18n: {
				defaultLocale,
				locales: localeTags,
			},
		}),
	],
});
