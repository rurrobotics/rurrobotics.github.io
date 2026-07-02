import type { GetStaticPaths } from "astro";
import { locales } from "./ui";

export const langStaticPaths = (() => {
	return Object.keys(locales).map((lang) => ({ params: { lang } }));
}) satisfies GetStaticPaths;
