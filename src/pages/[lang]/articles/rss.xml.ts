import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { articleSlug, getArticles } from "@lib/articles";
import { localeTags, type Locale } from "@locales/config.js";

export { getStaticPaths } from "@locales/utils";

export const GET: APIRoute = async ({ params, site }) => {
	const locale = params.lang as Locale;
	const articles = await getArticles(locale);

	return rss({
		title: "RUR Robotics: events & articles",
		description: "Meetups, lectures, news and writeups from the club.",
		site: new URL(`/${locale}/articles/`, site),
		items: articles.map((article) => ({
			title: article.data.title,
			description: article.data.description,
			pubDate: article.data.date,
			author: article.data.author,
			categories: [article.data.category],
			// @wc-ignore
			link: `/${locale}/articles/${articleSlug(article)}/`,
		})),
		customData: `<language>${localeTags[locale]}</language>`,
		trailingSlash: true,
	});
};
