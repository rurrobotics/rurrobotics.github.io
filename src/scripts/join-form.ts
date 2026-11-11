import { z } from "astro/zod";

export const applicationSchema = z.object({
	name: z.string().trim().min(2),
	email: z.email(),
	phone: z.string().trim().regex(/^\+?[0-9 ()/-]{6,20}$/),
	faculty: z.string().trim().min(2),
	year: z.coerce.number().int().min(1).max(6),
});

/**
 * Progressive enhancement for the join form. Without JS the browser validates
 * with the HTML constraints and posts the form, and the endpoint redirects back
 * to `#sent` or `#error`. With JS, zod validates first and shows the translated
 * message under each bad field (the `#<name>-error` elements), then the form is
 * sent in the background. The endpoint must validate again. Returns a disposer.
 */
export function joinForm(form: HTMLFormElement): () => void {
	// Zod's messages replace the browser's, so turn the native ones off.
	form.noValidate = true;

	const onSubmit = async (event: SubmitEvent) => {
		event.preventDefault();

		const parsed = applicationSchema.safeParse(
			Object.fromEntries(new FormData(form)),
		);
		const invalid = new Set(
			parsed.success ? [] : parsed.error.issues.map((i) => String(i.path[0])),
		);
		for (const input of form.querySelectorAll<HTMLInputElement>("input[name]")) {
			const error = form.querySelector<HTMLElement>(`#${input.name}-error`);
			if (!error) continue; // e.g. the hidden locale field
			const bad = invalid.has(input.name);
			input.setAttribute("aria-invalid", String(bad));
			error.hidden = !bad;
		}
		if (!parsed.success) {
			form.querySelector<HTMLInputElement>(`[name=${[...invalid][0]}]`)?.focus();
			return;
		}

		const button = form.querySelector<HTMLButtonElement>("[type=submit]");
		if (button) button.disabled = true;

		let ok = false;
		try {
			const response = await fetch(form.action, {
				method: "POST",
				headers: { Accept: "application/json" },
				body: new URLSearchParams(
					new FormData(form) as unknown as Record<string, string>,
				),
			});
			ok = response.ok;
		} catch {}

		if (ok) form.reset();
		if (button) button.disabled = false;
		location.hash = ok ? "sent" : "error";
	};

	form.addEventListener("submit", onSubmit);
	return () => form.removeEventListener("submit", onSubmit);
}
