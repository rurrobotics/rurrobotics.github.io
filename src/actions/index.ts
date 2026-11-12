import { ActionError, defineAction } from "astro:actions";
import {
	SUPABASE_PUBLISHABLE_KEY,
	SUPABASE_URL,
	TURNSTILE_SECRET_KEY,
} from "astro:env/server";
import { z } from "astro/zod";
import { createClient } from "@supabase/supabase-js";
import { defaultLocale } from "@locales/config.js";
import type { Database } from "@/supabase.types";

/** Asks Cloudflare whether the Turnstile token came from a solved challenge. */
async function isHuman(token: string, ip: string): Promise<boolean> {
	const response = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
			method: "POST",
			body: new URLSearchParams({
				secret: TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: ip,
			}),
		},
	);
	const { success } = (await response.json()) as { success: boolean };
	return success;
}

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
			// Added by the Turnstile widget; missing when JS is off.
			"cf-turnstile-response": z.string().default(""),
		}),
		handler: async (
			{ "cf-turnstile-response": token, ...application },
			{ clientAddress, currentLocale, logger },
		) => {
			if (!(await isHuman(token, clientAddress))) {
				throw new ActionError({ code: "FORBIDDEN" });
			}

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
