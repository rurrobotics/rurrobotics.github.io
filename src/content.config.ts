import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
	loader: glob({
		pattern: "**/*.{md,mdx}",
		base: "./src/content/articles",
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.coerce.date(),
			author: z.string().optional(),
			hero: image().optional(),
			draft: z.boolean().default(false),
		}),
});

const projects = defineCollection({
	loader: file("./src/content/projects.toml"),
	schema: z.object({
		name: z.string(),
		description: z.record(z.string(), z.string()).default({}),
		url: z.url(),
		tags: z.array(z.string()).default([]),
		order: z.number().optional(),
	}),
});

export const collections = { articles, projects };
