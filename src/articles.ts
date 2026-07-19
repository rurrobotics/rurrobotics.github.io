import { getCollection, type CollectionEntry } from "astro:content";
import { locales, type Locale } from "./locales/config.js";

export type Article = CollectionEntry<"articles">;

export function parseArticleId(id: string): { locale: Locale; slug: string } {
	const sep = id.indexOf("/");
	const rawLocale = id.slice(0, sep);
	const locale =
		locales.find((l) => l.toLowerCase() === rawLocale.toLowerCase()) ??
		(rawLocale as Locale);
	return { locale, slug: id.slice(sep + 1) };
}

export function articleSlug(entry: Article): string {
	return parseArticleId(entry.id).slug;
}

export async function getArticles(locale: Locale): Promise<Article[]> {
	const entries = await getCollection("articles", ({ id, data }) => {
		const isLocale = parseArticleId(id).locale === locale;
		return isLocale && (import.meta.env.DEV || !data.draft);
	});
	return entries.sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
}

export type ArticleCategory = Article["data"]["category"];

export const EVENT_CATEGORIES = ["meetup", "lecture"] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export function isEventCategory(
	category: ArticleCategory,
): category is EventCategory {
	return (EVENT_CATEGORIES as readonly ArticleCategory[]).includes(category);
}

export type EventArticle = Article & {
	data: Extract<Article["data"], { category: EventCategory }>;
};

export async function getEventArticles(locale: Locale): Promise<EventArticle[]> {
	const entries = await getArticles(locale);
	return entries.filter((entry): entry is EventArticle =>
		isEventCategory(entry.data.category),
	);
}
