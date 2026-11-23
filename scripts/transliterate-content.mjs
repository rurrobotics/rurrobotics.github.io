import {
	readdirSync,
	readFileSync,
	writeFileSync,
	rmSync,
	mkdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { transliterate } from "./transliterate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const COLLECTIONS = ["articles", "legal"];

for (const collection of COLLECTIONS) {
	const src = resolve(root, "src/content", collection, "sr-Cyrl");
	const dest = resolve(root, "src/content", collection, "sr");

	let sources;
	try {
		sources = readdirSync(src).filter((f) => /\.mdx?$/.test(f));
	} catch {
		console.log(`no source files in ${src}, skipping`);
		continue;
	}

	rmSync(dest, { recursive: true, force: true });
	mkdirSync(dest, { recursive: true });

	for (const file of sources) {
		const content = readFileSync(resolve(src, file), "utf8");
		const latin = transliterate(content).replaceAll(
			"](/sr-Cyrl/",
			"](/sr/",
		);
		writeFileSync(resolve(dest, file), latin);
	}

	console.log(`transliterated ${sources.length} file(s) ${src} -> ${dest}`);
}
