/**
 * Search, category and year filtering for the articles page, done in the
 * browser. Drives the strip in ArticleFilters.astro and the list around it,
 * which has to provide:
 *   li[data-category][data-year][data-search]  one per article
 *   [data-shown]                               the visible count
 *   [data-empty]                               the "nothing matches" message
 */

const input = document.querySelector<HTMLInputElement>("[data-search]")!;
const cards = [...document.querySelectorAll<HTMLElement>("li[data-category]")];
const allCategories =
	document.querySelector<HTMLButtonElement>("[data-category-all]")!;
const categoryButtons = [
	...document.querySelectorAll<HTMLButtonElement>("[data-category-filter]"),
];
const yearButtons = [
	...document.querySelectorAll<HTMLButtonElement>("[data-year-filter]"),
];
const shown = document.querySelector<HTMLElement>("[data-shown]")!;
const empty = document.querySelector<HTMLElement>("[data-empty]")!;

const normalize = (text: string) =>
	text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
const index = new Map(
	cards.map((card) => [card, normalize(card.dataset.search ?? "")]),
);

const knownCategories = categoryButtons.map((b) => b.dataset.categoryFilter!);
const knownYears = yearButtons.map((b) => b.dataset.yearFilter!);

const params = new URLSearchParams(location.search);
const categories = new Set(
	(params.get("category") ?? "")
		.split(",")
		.filter((c) => knownCategories.includes(c)),
);
let year = knownYears.includes(params.get("year") ?? "")
	? params.get("year")!
	: "all";

function render() {
	const query = normalize(input.value.trim());
	let count = 0;
	for (const card of cards) {
		const visible =
			(categories.size === 0 || categories.has(card.dataset.category!)) &&
			(year === "all" || card.dataset.year === year) &&
			(!query || index.get(card)!.includes(query));
		card.hidden = !visible;
		if (visible) count++;
	}
	shown.textContent = String(count);
	empty.hidden = count > 0;

	allCategories.setAttribute("aria-pressed", String(categories.size === 0));
	for (const button of categoryButtons) {
		button.setAttribute(
			"aria-pressed",
			String(categories.has(button.dataset.categoryFilter!)),
		);
	}
	for (const button of yearButtons) {
		button.setAttribute("aria-pressed", String(button.dataset.yearFilter === year));
	}

	const selection = [
		categories.size ? `category=${[...categories].join(",")}` : "",
		year !== "all" ? `year=${year}` : "",
	].filter(Boolean);
	history.replaceState(
		null,
		"",
		location.pathname + (selection.length ? `?${selection.join("&")}` : ""),
	);
}

input.addEventListener("input", render);
allCategories.addEventListener("click", () => {
	categories.clear();
	render();
});
for (const button of categoryButtons) {
	button.addEventListener("click", () => {
		const category = button.dataset.categoryFilter!;
		if (!categories.delete(category)) categories.add(category);
		render();
	});
}
for (const button of yearButtons) {
	button.addEventListener("click", () => {
		year = button.dataset.yearFilter!;
		render();
	});
}

render();
