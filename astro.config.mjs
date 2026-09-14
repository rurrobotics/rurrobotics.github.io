// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import { wuchale } from "wuchale/vite";

import { locales, defaultLocale, localeTags } from "./src/locales/config.js";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import rehypeShiki from "@shikijs/rehype";

import { unified } from "@astrojs/markdown-remark";

import { rehypeProseElements } from "./src/plugins/rehype-prose-elements.mjs";

/**
 * Hands the language and the `wrap` fence flag to rehypeProseElements, which
 * builds the header bar, and drops Shiki's own background so the block renders
 * on the page background rather than the theme's own.
 *
 * Write ```js wrap to soft-wrap a block instead of scrolling it.
 *
 * @type {import("shiki").ShikiTransformer}
 */
const proseCodeBlock = {
	pre(node) {
		node.properties["data-language"] = this.options.lang;
		if (/(^|\s)wrap(\s|$)/.test(this.options.meta?.__raw ?? "")) {
			node.properties["data-wrap"] = "true";
		}
		node.properties.style = String(node.properties.style ?? "").replace(
			/background-color:[^;]*;?/g,
			"",
		);
	},
};

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
			rehypePlugins: [
				[
					rehypeShiki,
					{
						theme: "github-light",
						transformers: [proseCodeBlock],
					},
				],
				rehypeProseElements,
			],
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
