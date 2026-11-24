import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";
import { locales } from "./locales/config.js";

const localized = z.record(z.enum(locales), z.string());

const articles = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/articles",
	}),
	schema: ({ image }) => {
		const base = z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.coerce.date(),
			author: z.string().optional(),
			hero: image().optional(),
			draft: z.boolean().default(false),
		});
		return z.discriminatedUnion("category", [
			base.extend({
				category: z.literal("meetup"),
				eventDate: z.coerce.date(),
			}),
			base.extend({
				category: z.literal("lecture"),
				eventDate: z.coerce.date(),
			}),
			base.extend({ category: z.literal("news") }),
			base.extend({ category: z.literal("writeup") }),
		]);
	},
});

const projects = defineCollection({
	loader: file("./src/content/projects.toml"),
	schema: z.object({
		name: z.string(),
		description: localized,
		url: z.url(),
		tags: z.array(z.string()).default([]),
		order: z.number().optional(),
	}),
});

const legal = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		updated: z.coerce.date(),
	}),
});

const gallery = defineCollection({
	loader: glob({
		pattern: "*/metadata.toml",
		base: "./src/assets/gallery",
		generateId: ({ entry }) => entry.split("/")[0],
	}),
	schema: z.object({
		title: localized,
		photos: z.record(z.string(), localized),
	}),
});

export const collections = { articles, projects, legal, gallery };
