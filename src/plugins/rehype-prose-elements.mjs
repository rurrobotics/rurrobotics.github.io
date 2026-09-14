/**
 * Structural markup the prose theme needs but CSS can't produce on its own.
 *
 * This runs on the shared hast, so `.md` and `.mdx` are treated identically —
 * unlike an MDX `components` map, which Astro only forwards for `.mdx`.
 *
 * Must be registered *after* rehypeShiki so the highlighted `<pre>` already
 * carries the `data-language` set by the proseCodeBlock transformer.
 */

const el = (tagName, properties, children = []) => ({
	type: "element",
	tagName,
	properties,
	children,
});

const text = (value) => ({ type: "text", value });

export function rehypeProseElements() {
	return (tree) => transform(tree);
}

function transform(node) {
	if (!node.children) return;

	node.children = node.children.flatMap((child) => {
		if (
			child.type === "element" &&
			child.tagName === "pre" &&
			child.properties?.["data-language"]
		) {
			return [codeBlock(child)];
		}

		// Before recursing: a paragraph holding nothing but an image becomes the
		// figure itself. Descending first would rewrite the image in place and
		// leave a <figure> illegally nested in a <p>.
		if (child.type === "element" && child.tagName === "p") {
			const unwrapped = unwrapImage(child);
			if (unwrapped[0] !== child) return unwrapped;
		}

		// Recurse through every node type, not just elements: in MDX the
		// highlighted block arrives wrapped in a nested `root` node.
		transform(child);

		return [child];
	});
}

/** Wraps a highlighted block in the design's bordered chrome. */
function codeBlock(pre) {
	const language = String(pre.properties["data-language"] ?? "code");
	const wrap = Boolean(pre.properties["data-wrap"]);
	delete pre.properties["data-language"];
	delete pre.properties["data-wrap"];

	// A wrapped block has nothing to scroll, so the design tags it WRAP where a
	// scrolling block offers COPY.
	const affordance = wrap
		? el("span", {}, [text("Wrap")])
		: el(
				"button",
				{
					type: "button",
					"data-copy": true,
					"aria-label": "Copy code",
				},
				[text("Copy")],
			);

	return el(
		"figure",
		{ className: ["code-block"], "data-wrap": wrap || undefined },
		[
			el("figcaption", {}, [
				el("span", {}, [text(language)]),
				affordance,
			]),
			pre,
		],
	);
}

/** Lifts a lone image out of the paragraph remark wraps it in. */
function unwrapImage(paragraph) {
	const meaningful = paragraph.children.filter(
		(child) => child.type !== "text" || child.value.trim(),
	);

	return meaningful.length === 1 && meaningful[0].tagName === "img"
		? [figure(meaningful[0])]
		: [paragraph];
}

/** Promotes alt text to a visible caption. */
function figure(img) {
	const alt = String(img.properties?.alt ?? "");
	return el(
		"figure",
		{},
		alt ? [img, el("figcaption", {}, [text(alt)])] : [img],
	);
}
