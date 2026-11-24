import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import gettextParser from "gettext-parser";
import { transliterate } from "./transliterate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "src/locales/sr-Cyrl.po");
const DEST = resolve(root, "src/locales/sr.po");

/** @type {Record<string, string[]>} */
const OVERRIDES = {};

const catalog = gettextParser.po.parse(readFileSync(SRC));
catalog.headers.Language = "sr";
catalog.headers["Content-Type"] = "text/plain; charset=utf-8";

delete catalog.obsolete;

for (const context of Object.values(catalog.translations)) {
	for (const entry of Object.values(context)) {
		if (!entry.msgid) continue; // header entry
		entry.msgstr =
			OVERRIDES[entry.msgid] ??
			entry.msgstr.map((value) => transliterate(value));
	}
}

writeFileSync(DEST, gettextParser.po.compile(catalog, { foldLength: 0 }));
console.log(`transliterated ${SRC} -> ${DEST}`);
