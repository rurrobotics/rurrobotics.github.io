import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import gettextParser from "gettext-parser";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "src/locales/sr-Cyrl.po");
const DEST = resolve(root, "src/locales/sr.po");

const map = {
	А: "A", Б: "B", В: "V", Г: "G", Д: "D", Ђ: "Đ", Е: "E", Ж: "Ž",
	З: "Z", И: "I", Ј: "J", К: "K", Л: "L", Љ: "Lj", М: "M", Н: "N",
	Њ: "Nj", О: "O", П: "P", Р: "R", С: "S", Т: "T", Ћ: "Ć", У: "U",
	Ф: "F", Х: "H", Ц: "C", Ч: "Č", Џ: "Dž", Ш: "Š",
	а: "a", б: "b", в: "v", г: "g", д: "d", ђ: "đ", е: "e", ж: "ž",
	з: "z", и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n",
	њ: "nj", о: "o", п: "p", р: "r", с: "s", т: "t", ћ: "ć", у: "u",
	ф: "f", х: "h", ц: "c", ч: "č", џ: "dž", ш: "š",
};

function transliterate(text) {
	let out = "";
	for (const char of text) out += map[char] ?? char;
	return out;
}

const catalog = gettextParser.po.parse(readFileSync(SRC));
catalog.headers.Language = "sr";
catalog.headers["Content-Type"] = "text/plain; charset=utf-8";

for (const context of Object.values(catalog.translations)) {
	for (const entry of Object.values(context)) {
		if (!entry.msgid) continue; // header entry
		entry.msgstr = entry.msgstr.map(transliterate);
	}
}

writeFileSync(DEST, gettextParser.po.compile(catalog));
console.log(`transliterated ${SRC} -> ${DEST}`);
