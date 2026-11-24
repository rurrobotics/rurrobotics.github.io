import vocatives from "./vokativi/imena.json" with { type: "json" };

const CYRILLIC_TO_LATIN: Record<string, string> = {
	а: "a",
	б: "b",
	в: "v",
	г: "g",
	д: "d",
	ђ: "đ",
	е: "e",
	ж: "ž",
	з: "z",
	и: "i",
	ј: "j",
	к: "k",
	л: "l",
	љ: "lj",
	м: "m",
	н: "n",
	њ: "nj",
	о: "o",
	п: "p",
	р: "r",
	с: "s",
	т: "t",
	ћ: "ć",
	у: "u",
	ф: "f",
	х: "h",
	ц: "c",
	ч: "č",
	џ: "dž",
	ш: "š",
};

const LATIN_TO_CYRILLIC = Object.fromEntries(
	Object.entries(CYRILLIC_TO_LATIN).map(([cyrillic, latin]) => [
		latin,
		cyrillic,
	]),
);

const toLatin = (word: string) =>
	[...word].map((char) => CYRILLIC_TO_LATIN[char] ?? char).join("");

// "nj", "lj" and "dž" are one letter in Cyrillic.
const toCyrillic = (word: string) =>
	word.replace(
		/dž|lj|nj|./g,
		(letter) => LATIN_TO_CYRILLIC[letter] ?? letter,
	);

// "Milos" for "Miloš", "Djordje" for "Đorđe".
const stripDiacritics = (word: string) =>
	word
		.replaceAll("đ", "dj")
		.replaceAll("č", "c")
		.replaceAll("ć", "c")
		.replaceAll("š", "s")
		.replaceAll("ž", "z");

const capitalize = (word: string) =>
	word.charAt(0).toLocaleUpperCase() + word.slice(1);

// Lowercase name -> [name, vocative], looked up exactly and without diacritics.
const exact = new Map<string, [string, string]>();
const loose = new Map<string, [string, string]>();
for (const [name, vocative] of Object.entries(vocatives)) {
	const key = name.toLowerCase();
	exact.set(key, [name, vocative]);
	if (!loose.has(stripDiacritics(key))) {
		loose.set(stripDiacritics(key), [name, vocative]);
	}
}

function vocativeOfWord(word: string): string {
	const isCyrillic = /[\u0400-\u04FF]/.test(word);
	const latin = isCyrillic ? toLatin(word.toLowerCase()) : word.toLowerCase();

	const exactMatch = exact.get(latin);
	// Cyrillic always has the right letters; only Latin can lack diacritics.
	const match =
		exactMatch ??
		(isCyrillic ? undefined : loose.get(stripDiacritics(latin)));
	if (!match) return word;

	const [, vocative] = match;
	if (!isCyrillic) {
		// Someone who left the diacritics out gets a reply without them too.
		return exactMatch
			? vocative
			: capitalize(stripDiacritics(vocative.toLowerCase()));
	}

	// Keep what they typed up to where the vocative starts to differ, and
	// write only the new ending in Cyrillic.
	const lower = vocative.toLowerCase();
	let common = 0;
	while (
		common < latin.length &&
		common < lower.length &&
		latin[common] === lower[common]
	) {
		common++;
	}
	const typed = word.toLowerCase();
	let latinLength = 0;
	for (let i = 0; i <= typed.length; i++) {
		if (latinLength === common) {
			return capitalize(
				typed.slice(0, i) + toCyrillic(lower.slice(common)),
			);
		}
		latinLength += (CYRILLIC_TO_LATIN[typed[i]] ?? typed[i] ?? "").length;
	}
	return capitalize(toCyrillic(lower));
}

/**
 * The vocative of the first name in `fullName`, in the script it was written
 * in. A name that is not in the list comes back as it was typed.
 */
export function vocativeFirstName(fullName: string): string {
	const firstName = fullName.trim().split(/\s+/)[0] ?? "";
	return firstName.split("-").map(vocativeOfWord).join("-");
}
