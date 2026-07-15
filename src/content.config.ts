import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
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

export const collections = { articles };
