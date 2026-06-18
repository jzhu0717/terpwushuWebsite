-- 1. Grant table privileges for the practices table
grant select on table public.practices to anon;
grant select, insert, update, delete on table public.practices to authenticated;
grant select, insert, update, delete on table public.practices to service_role;

-- 2. Grant sequence privileges (so the auto-incrementing ID doesn't block inserts)
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- 3. Turn Row Level Security (RLS) back on to keep it safe
alter table public.practices enable row level security;