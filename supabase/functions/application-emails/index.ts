// Called by the trigger on `applications` inserts (see the migration). Sends the
// applicant a confirmation in their language and the team a notification.
import nodemailer from "npm:nodemailer@10.2.1";

const FROM = "RUR Robotics <join@rurrobotics.com>";
const TEAM = "kontakt@rurrobotics.com";

type Locale = "en" | "sr" | "sr-Cyrl";

interface Application {
	name: string;
	email: string;
	phone: string;
	faculty: string;
	year: number;
	locale: Locale;
	created_at: string;
}

const confirmations: Record<
	Locale,
	(name: string) => { subject: string; text: string }
> = {
	en: (name) => ({
		subject: "We received your application",
		text: `Hi ${name},\n\nThanks for applying to RUR Robotics! We got your application and will email you when the selection round starts.\n\nRUR Robotics\nhttps://rurrobotics.com/en/`,
	}),
	sr: (name) => ({
		subject: "Primili smo tvoju prijavu",
		text: `Zdravo ${name},\n\nHvala na prijavi za RUR Robotiku! Primili smo je i javićemo ti se mejlom kada počne krug selekcije.\n\nRUR Robotika\nhttps://rurrobotics.com/sr/`,
	}),
	"sr-Cyrl": (name) => ({
		subject: "Примили смо твоју пријаву",
		text: `Здраво ${name},\n\nХвала на пријави за РУР Роботику! Примили смо је и јавићемо ти се мејлом када почне круг селекције.\n\nРУР Роботика\nhttps://rurrobotics.com/sr-Cyrl/`,
	}),
};

const transport = nodemailer.createTransport({
	host: "smtp.zoho.eu",
	// Supabase blocks outgoing SMTP on 25 and 587.
	port: 465,
	secure: true,
	auth: {
		user: Deno.env.get("SMTP_USER"),
		pass: Deno.env.get("SMTP_PASSWORD"),
	},
});

Deno.serve(async (request) => {
	// The trigger sends this secret; anyone else calling the URL is turned away.
	const secret = Deno.env.get("APPLICATION_EMAILS_SECRET");
	if (
		!secret ||
		request.headers.get("Authorization") !== `Bearer ${secret}`
	) {
		return new Response("Unauthorized", { status: 401 });
	}

	const { record: application } = (await request.json()) as {
		record: Application;
	};

	await transport.sendMail({
		from: FROM,
		to: application.email,
		replyTo: TEAM,
		...(confirmations[application.locale] ?? confirmations.en)(
			application.name,
		),
	});

	await transport.sendMail({
		from: FROM,
		to: TEAM,
		replyTo: application.email,
		subject: `Nova prijava: ${application.name}`,
		text: [
			`Ime: ${application.name}`,
			`Imejl: ${application.email}`,
			`Telefon: ${application.phone}`,
			`Fakultet: ${application.faculty}`,
			`Godina: ${application.year}`,
			`Jezik: ${application.locale}`,
			`Poslato: ${application.created_at}`,
		].join("\n"),
	});

	return new Response(null, { status: 204 });
});
