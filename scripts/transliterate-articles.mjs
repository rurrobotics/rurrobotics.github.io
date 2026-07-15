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
const SRC = resolve(root, "src/content/articles/sr-Cyrl");
const DEST = resolve(root, "src/content/articles/sr");

rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });

let sources;
try {
	sources = readdirSync(SRC).filter((f) => /\.mdx?$/.test(f));
} catch {
	console.log(`no source articles in ${SRC}, nothing to transliterate`);
	process.exit(0);
}

for (const file of sources) {
	const content = readFileSync(resolve(SRC, file), "utf8");
	writeFileSync(resolve(DEST, file), transliterate(content));
}

console.log(`transliterated ${sources.length} article(s) ${SRC} -> ${DEST}`);
