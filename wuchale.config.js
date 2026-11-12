// @ts-check
import { adapter as astro } from "@wuchale/astro";
import { adapter as vanilla } from "wuchale/adapter-vanilla";
import { defineConfig } from "wuchale";
import { locales } from "./src/locales/config.js";

export default defineConfig({
	locales,
	fallback: {
		"sr-Cyrl": "en",
		sr: "en",
	},
	adapters: {
		main: astro(),
		// The RSS feeds. Shares the .po files with `main`; the
		// middleware's runWithLocale picks the locale.
		endpoints: vanilla({ files: "src/pages/**/rss.xml.ts", loader: "server" }),
	},
});
