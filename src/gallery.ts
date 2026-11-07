import type { ImageMetadata } from "astro";

export interface GalleryYear {
	year: string;
	photos: ImageMetadata[];
}

/**
 * Every photo in `src/assets/gallery/<year>/`, grouped by that year folder,
 * newest year first and photos in filename order. Drop a photo in the right
 * folder and it shows up; a new year is just a new folder.
 */
export function getGalleryYears(): GalleryYear[] {
	const modules = import.meta.glob<{ default: ImageMetadata }>(
		"/src/assets/gallery/*/*.jpg",
		{ eager: true },
	);

	const byYear = new Map<string, [string, ImageMetadata][]>();
	for (const [path, module] of Object.entries(modules)) {
		const [, year] = path.match(/\/gallery\/([^/]+)\//) ?? [];
		if (!year) continue;
		byYear.set(year, [...(byYear.get(year) ?? []), [path, module.default]]);
	}

	return [...byYear]
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([year, entries]) => ({
			year,
			photos: entries
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([, photo]) => photo),
		}));
}
