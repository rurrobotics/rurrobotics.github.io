// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import { wuchale } from "wuchale/vite";

import { locales, defaultLocale, localeTags } from "./src/locales/config.js";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
	site: "https://rurrobotics.rs/",
	trailingSlash: "always",
	redirects: {
		"/": `/${defaultLocale}/`,
	},
	i18n: {
		locales,
		defaultLocale,
		routing: {
			prefixDefaultLocale: true,
		},
	},
	vite: {
		plugins: [tailwindcss(), wuchale()],
	},
	integrations: [
		sitemap({
			i18n: {
				defaultLocale,
				locales: localeTags,
			},
		}),
		mdx(),
	],
});
