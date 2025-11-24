import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = (request) => {
	const sitemapURL = new URL(
		"sitemap-index.xml",
		import.meta.env.DEV ? request.url.origin : request.site,
	);
	return new Response(getRobotsTxt(sitemapURL));
};
