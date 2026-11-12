-- Applications sent through the join form on the website.
create table public.applications (
	id bigint generated always as identity primary key,
	created_at timestamptz not null default now(),
	name text not null check (char_length(name) between 2 and 100),
	email text not null check (char_length(email) <= 254),
	phone text not null check (char_length(phone) <= 20),
	faculty text not null check (char_length(faculty) between 2 and 100),
	year smallint not null check (year between 1 and 6),
	locale text not null check (locale in ('en', 'sr', 'sr-Cyrl'))
);

-- The website inserts with the publishable key, as the `anon` role. It may add
-- applications but not read, change or delete them.
alter table public.applications enable row level security;

grant insert on public.applications to anon;

create policy "Anyone can apply"
	on public.applications
	for insert
	to anon
	with check (true);
