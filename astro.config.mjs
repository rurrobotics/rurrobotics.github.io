// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import { wuchale } from "wuchale/vite";

import { locales, defaultLocale, localeTags } from "./src/locales/config.js";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import rehypeShiki from "@shikijs/rehype";

import { unified } from "@astrojs/markdown-remark";

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
	markdown: {
		syntaxHighlight: false,
		processor: unified({
			rehypePlugins: [[rehypeShiki, { theme: "monokai" }]],
		}),
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
