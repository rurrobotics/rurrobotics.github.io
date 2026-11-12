import { ActionError, defineAction } from "astro:actions";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "astro:env/server";
import { z } from "astro/zod";
import { createClient } from "@supabase/supabase-js";
import { defaultLocale } from "@locales/config.js";
import type { Database } from "@/supabase.types";

export const server = {
	apply: defineAction({
		accept: "form",
		// The limits match the checks on the `applications` table.
		input: z.object({
			name: z.string().trim().min(2).max(100),
			email: z.email().max(254),
			phone: z
				.string()
				.trim()
				.regex(/^\+?[0-9 ()/-]{6,20}$/),
			faculty: z.string().trim().min(2).max(100),
			year: z.coerce.number().int().min(1).max(6),
		}),
		handler: async (application, { currentLocale, logger }) => {
			// The publishable key may only insert applications (see the migration).
			const supabase = createClient<Database>(
				SUPABASE_URL,
				SUPABASE_PUBLISHABLE_KEY,
				{
					auth: { persistSession: false },
				},
			);
			const { error } = await supabase.from("applications").insert({
				...application,
				locale: currentLocale ?? defaultLocale,
			});
			if (error) {
				// Only the code: the message can echo the applicant's data.
				logger.error(
					`Saving an application failed with ${error.code}.`,
				);
				throw new ActionError({ code: "INTERNAL_SERVER_ERROR" });
			}
		},
	}),
};
