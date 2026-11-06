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

export const EVENT_TIME_ZONE = "Europe/Belgrade";

export type ArticleCategory = Article["data"]["category"];

export const CATEGORY_COLORS = {
	meetup: "primary",
	lecture: "accent",
	news: "tertiary",
	writeup: "secondary",
} as const satisfies Record<ArticleCategory, string>;

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

export function getArticles(locale: Locale, event: true): Promise<EventArticle[]>;
export function getArticles(
	locale: Locale,
	event?: boolean | null,
): Promise<Article[]>;
export async function getArticles(
	locale: Locale,
	event?: boolean | null,
): Promise<Article[]> {
	const entries = await getCollection("articles", ({ id, data }) => {
		const isLocale = parseArticleId(id).locale === locale;
		const isWanted = event == null || isEventCategory(data.category) === event;
		return isLocale && isWanted && (import.meta.env.DEV || !data.draft);
	});
	return entries.sort(
		(a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
	);
}
