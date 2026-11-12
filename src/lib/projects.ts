import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;

export async function getProjects(): Promise<Project[]> {
	const entries = await getCollection("projects");
	return entries.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));
}
