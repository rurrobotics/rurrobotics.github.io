// The bindings in wrangler.jsonc that the code uses. Add one here when you add
// one there.
declare module "cloudflare:workers" {
	export const env: {
		/** The `ratelimits` binding for the join form. */
		JOIN_LIMITER: {
			limit(options: { key: string }): Promise<{ success: boolean }>;
		};
	};
}
