export interface SectionNotchOptions {
	/** Container holding the links; the notch is positioned relative to it. */
	nav: HTMLElement;
	/** Element moved and sized over the active link(s). */
	notch: HTMLElement;
	/** Attribute on a link naming the id of the section it tracks. */
	sectionAttribute?: string;
	/** Viewport band that decides which sections count as visible. */
	rootMargin?: string;
	/** How long to wait for a clicked section before giving up on it. */
	jumpTimeout?: number;
}

/** Tracks the section(s) in view with `notch`: slides while scrolling, wipes on a click. Returns a disposer. */
export function sectionNotch({
	nav,
	notch,
	sectionAttribute = "data-section",
	rootMargin = "-20% 0px -70% 0px",
	jumpTimeout = 1000,
}: SectionNotchOptions): () => void {
	const idOf = (link: HTMLElement) =>
		link.getAttribute(sectionAttribute) ?? "";

	const targets = [
		...nav.querySelectorAll<HTMLElement>(`[${sectionAttribute}]`),
	]
		.map((link) => ({ link, section: document.getElementById(idOf(link)) }))
		.filter((entry): entry is { link: HTMLElement; section: HTMLElement } =>
			Boolean(entry.section),
		);

	if (targets.length === 0) return () => {};

	const active = new Set<Element>();
	let shown = "";
	let jumping = false;
	let timer: number | undefined;

	const hide = () => {
		shown = "";
		notch.dataset.visible = "false";
	};

	const draw = () => {
		if (jumping) return;

		const visible = targets.filter(({ section }) => active.has(section));

		if (visible.length === 0) return hide();

		const rects = visible.map(({ link }) => link.getBoundingClientRect());
		const bar = nav.getBoundingClientRect();
		const left = Math.min(...rects.map((r) => r.left)) - bar.left;
		const width = Math.max(...rects.map((r) => r.right)) - bar.left - left;

		const sections = visible.map(({ link }) => idOf(link)).join();
		const snap = shown === "" || sections === shown;
		shown = sections;

		if (snap) notch.style.transitionProperty = "none";
		notch.style.left = `${left}px`;
		notch.style.width = `${width}px`;
		if (snap) {
			void notch.offsetWidth;
			notch.style.transitionProperty = "";
		}
		notch.dataset.visible = "true";
	};

	const settle = () => {
		removeEventListener("scrollend", settle);
		clearTimeout(timer);
		jumping = false;
		draw();
	};

	const onClick = (event: MouseEvent) => {
		const target = event.target as Element | null;
		const link = target?.closest<HTMLElement>(`[${sectionAttribute}]`);
		if (!link) return;
		if (shown.split(",").includes(idOf(link))) return;

		jumping = true;
		hide();
		clearTimeout(timer);
		addEventListener("scrollend", settle);
		timer = window.setTimeout(settle, jumpTimeout);
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) active.add(entry.target);
				else active.delete(entry.target);
			}
			draw();
		},
		{ rootMargin },
	);

	targets.forEach(({ section }) => observer.observe(section));

	const resize = new ResizeObserver(draw);
	resize.observe(nav);

	nav.addEventListener("click", onClick);
	document.fonts?.ready.then(draw);

	return () => {
		clearTimeout(timer);
		removeEventListener("scrollend", settle);
		nav.removeEventListener("click", onClick);
		observer.disconnect();
		resize.disconnect();
	};
}
