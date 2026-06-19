-- Create an explicit policy for authenticated users
create policy "Allow auth users full access" 
on public.officers for all 
to authenticated 
using (true) 
with check (true);