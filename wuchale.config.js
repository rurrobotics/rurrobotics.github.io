// @ts-check
import { adapter as astro } from "@wuchale/astro";
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
	},
});
