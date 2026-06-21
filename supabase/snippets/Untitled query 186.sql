-- 1. Allow anyone (public visitors and logged-in users) to view the archives
create policy "Allow public read access"
on public.tournament_archives
for select
to anon, authenticated
using (true);

-- 2. Allow logged-in admins (authenticated) to insert new entries
create policy "Allow authenticated insert"
on public.tournament_archives
for insert
to authenticated
with check (true);

-- 3. Allow logged-in admins (authenticated) to update existing entries
create policy "Allow authenticated update"
on public.tournament_archives
for update
to authenticated
using (true)
with check (true);

-- 4. Allow logged-in admins (authenticated) to delete entries
create policy "Allow authenticated delete"
on public.tournament_archives
for delete
to authenticated
using (true);