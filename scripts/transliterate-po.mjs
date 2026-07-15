import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import gettextParser from "gettext-parser";
import { transliterate } from "./transliterate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "src/locales/sr-Cyrl.po");
const DEST = resolve(root, "src/locales/sr.po");

const catalog = gettextParser.po.parse(readFileSync(SRC));
catalog.headers.Language = "sr";
catalog.headers["Content-Type"] = "text/plain; charset=utf-8";

const existing = existsSync(DEST)
	? gettextParser.po.parse(readFileSync(DEST)).translations
	: {};

for (const [ctxt, context] of Object.entries(catalog.translations)) {
	for (const entry of Object.values(context)) {
		if (!entry.msgid) continue; // header entry
		const current = existing[ctxt]?.[entry.msgid]?.msgstr ?? [];
		entry.msgstr = entry.msgstr.map((value, i) =>
			current[i]?.trim() ? current[i] : transliterate(value),
		);
	}
}

writeFileSync(DEST, gettextParser.po.compile(catalog));
console.log(`transliterated ${SRC} -> ${DEST}`);
