-- After each new application, call the `application-emails` Edge Function to
-- email the applicant and the team. pg_net sends the request after the insert
-- commits, so a slow or failing mail server never blocks the form.
--
-- Reads two Vault secrets, set once from the terminal (see the README):
--   project_url                https://<ref>.supabase.co
--   application_emails_secret  shared with the function's APPLICATION_EMAILS_SECRET
create extension if not exists pg_net;

create function public.send_application_emails()
returns trigger
language plpgsql
-- Runs as the owner, since the `anon` role that inserts can't read the Vault.
security definer
set search_path = ''
as $$
begin
	perform net.http_post(
		url := (
			select decrypted_secret from vault.decrypted_secrets
			where name = 'project_url'
		) || '/functions/v1/application-emails',
		headers := jsonb_build_object(
			'Content-Type', 'application/json',
			'Authorization', 'Bearer ' || (
				select decrypted_secret from vault.decrypted_secrets
				where name = 'application_emails_secret'
			)
		),
		body := jsonb_build_object('record', to_jsonb(new))
	);
	return new;
end;
$$;

-- Only the trigger should run it.
revoke execute on function public.send_application_emails()
	from public, anon, authenticated;

create trigger send_application_emails
	after insert on public.applications
	for each row execute function public.send_application_emails();
