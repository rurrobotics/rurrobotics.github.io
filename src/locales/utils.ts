import { locales } from "./config.js";

export const getStaticPaths = () =>
	locales.map((lang) => ({ params: { lang } }));