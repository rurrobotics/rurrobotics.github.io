export interface ImageZoomOptions {
	/** Attribute marking a zoomable element: an `<img>`, or a button or link wrapping one. */
	attribute?: string;
	/** Attribute on a zoomable holding the URL of a larger version; defaults to the image shown. */
	sourceAttribute?: string;
}

/**
 * Opens a zoomable image over the page when it is clicked. Delegated from the
 * document, so zoomables added later work too. The image is shown in a modal
 * `<dialog>`, which brings Escape to close, focus trapping, an inert page
 * behind it and focus restored to the clicked element. A click anywhere on the
 * overlay closes it. Returns a disposer.
 *
 * Mark the element, ideally a `<button>` so the keyboard can reach it:
 *   <button data-zoom data-zoom-src="/big.jpg"><img src="/small.jpg" alt="..." /></button>
 */
export function imageZoom({
	attribute = "data-zoom",
	sourceAttribute = "data-zoom-src",
}: ImageZoomOptions = {}): () => void {
	const dialog = document.createElement("dialog");
	dialog.className =
		"fixed inset-0 m-0 hidden size-full max-h-none max-w-none cursor-zoom-out items-center justify-center bg-transparent p-4 outline-none backdrop:bg-black/90 open:flex sm:p-10";

	const image = document.createElement("img");
	image.className = "max-h-full max-w-full object-contain";
	dialog.append(image);

	const lockScroll = (locked: boolean) => {
		document.documentElement.style.overflow = locked ? "hidden" : "";
	};

	const open = (zoomable: HTMLElement) => {
		const source =
			zoomable instanceof HTMLImageElement
				? zoomable
				: zoomable.querySelector("img");
		const src =
			zoomable.getAttribute(sourceAttribute) ??
			source?.currentSrc ??
			source?.src;
		if (!src) return;

		image.src = src;
		image.alt = source?.alt ?? "";
		dialog.setAttribute("aria-label", image.alt);
		document.body.append(dialog);
		dialog.showModal();
		lockScroll(true);
	};

	const onClick = (event: MouseEvent) => {
		const zoomable = (event.target as Element).closest<HTMLElement>(
			`[${attribute}]`,
		);
		if (!zoomable || dialog.open) return;
		event.preventDefault();
		open(zoomable);
	};

	const onDialogClick = () => dialog.close();

	const onClose = () => {
		lockScroll(false);
		dialog.remove();
		image.removeAttribute("src");
	};

	document.addEventListener("click", onClick);
	dialog.addEventListener("click", onDialogClick);
	dialog.addEventListener("close", onClose);

	return () => {
		document.removeEventListener("click", onClick);
		dialog.removeEventListener("click", onDialogClick);
		dialog.removeEventListener("close", onClose);
		if (dialog.open) dialog.close();
		dialog.remove();
	};
}
