/**
 * The security headers every page gets. `scripts/generate-headers.mjs` writes
 * them to `public/_headers` for the static pages, and the middleware sets the
 * same ones on the pages the Worker renders (the join form and the error
 * pages), so edit them here and nowhere else.
 *
 * The policy relies on there being no inline scripts or styles, only
 * `style=""` attributes: `astro.config.mjs` stops Vite from inlining small
 * assets. Turnstile on the join form is the only third party.
 */
const turnstile = "https://challenges.cloudflare.com";

const policy = [
	["default-src", "'self'"],
	["script-src", `'self' ${turnstile}`],
	["style-src", "'self'"],
	["style-src-attr", "'unsafe-inline'"],
	["img-src", "'self'"],
	["font-src", "'self'"],
	["connect-src", `'self' ${turnstile}`],
	["frame-src", turnstile],
	["form-action", "'self'"],
	["base-uri", "'self'"],
	["object-src", "'none'"],
	["frame-ancestors", "'none'"],
];

/** @type {Record<string, string>} */
export const securityHeaders = {
	"Content-Security-Policy": policy
		.map(([directive, sources]) => `${directive} ${sources}`)
		.join("; "),
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy":
		"camera=(), microphone=(), geolocation=(), payment=(), usb=()",
	// frame-ancestors covers modern browsers; this is for the old ones.
	"X-Frame-Options": "DENY",
};
