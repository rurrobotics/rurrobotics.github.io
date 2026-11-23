-- Deletes applications 12 months after they were sent, as the privacy policy
-- promises (src/content/legal/*/privacy.md). Runs daily at 03:00 UTC, so a row
-- is gone within a day of turning 12 months old.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
	'delete-old-applications',
	'0 3 * * *',
	$$delete from public.applications where created_at < now() - interval '12 months'$$
);
