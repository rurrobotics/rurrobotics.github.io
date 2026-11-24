import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import type { Locale } from "@locales/config.js";

export interface GalleryPhoto {
	src: ImageMetadata;
	alt: string;
}

export interface GalleryEvent {
	title: string;
	photos: GalleryPhoto[];
}

/**
 * Every photo in `src/assets/gallery/<year>-<event>/`, grouped by that folder,
 * newest first (folders sort by their year prefix) and photos in filename
 * order. Each folder needs a `metadata.toml` with the heading and an alt text
 * for every photo (see the collection in `content.config.ts`); a folder
 * without one, or a photo without alt text, fails the build.
 */
export async function getGalleryEvents(
	locale: Locale,
): Promise<GalleryEvent[]> {
	const modules = import.meta.glob<{ default: ImageMetadata }>(
		"/src/assets/gallery/*/*.jpg",
		{ eager: true },
	);
	const captions = new Map(
		(await getCollection("gallery")).map((entry) => [entry.id, entry.data]),
	);

	const byFolder = new Map<string, [string, ImageMetadata][]>();
	for (const [path, module] of Object.entries(modules)) {
		const [, folder] = path.match(/\/gallery\/([^/]+)\//) ?? [];
		if (!folder) continue;
		byFolder.set(folder, [
			...(byFolder.get(folder) ?? []),
			[path, module.default],
		]);
	}

	return [...byFolder]
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([folder, entries]) => {
			const meta = captions.get(folder);
			if (!meta)
				throw new Error(
					`Missing src/assets/gallery/${folder}/metadata.toml`,
				);
			return {
				title: meta.title[locale],
				photos: entries
					.sort(([a], [b]) => a.localeCompare(b))
					.map(([path, src]) => {
						const name = path
							.split("/")
							.pop()!
							.replace(/\.jpg$/, "");
						const alt = meta.photos[name]?.[locale];
						if (!alt) {
							throw new Error(
								`No alt text for ${name}.jpg: add [photos.${name}] to src/assets/gallery/${folder}/metadata.toml`,
							);
						}
						return { src, alt };
					}),
			};
		});
}
