import { defaultLocale } from "@locales/config.js";

export const getContactEmail = (currentLocale?: string) =>
	(currentLocale ?? defaultLocale) === "en" ? "contact@rurrobotics.com" : "kontakt@rurrobotics.com";
