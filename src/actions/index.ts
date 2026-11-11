import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const server = {
	apply: defineAction({
		accept: "form",
		input: z.object({
			name: z.string().trim().min(2),
			email: z.email(),
			phone: z
				.string()
				.trim()
				.regex(/^\+?[0-9 ()/-]{6,20}$/),
			faculty: z.string().trim().min(2),
			year: z.coerce.number().int().min(1).max(6),
		}),
		handler: async () => {
			// TODO: store the application in Supabase.
		},
	}),
};
