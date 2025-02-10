create table if not exists budgetapp_sessions (
  id uuid default gen_random_uuid() primary key,
  source_id uuid references budgetapp_sources(id),
  status text not null default 'active',
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table budgetapp_sessions enable row level security;

create policy "Users can view sessions for their sources"
  on budgetapp_sessions for select
  using (
    source_id in (
      select source_id from budgetapp_source_permissions
      where user_id = auth.uid()
    )
  );

create policy "Users can create sessions for their sources"
  on budgetapp_sessions for insert
  with check (
    source_id in (
      select source_id from budgetapp_source_permissions
      where user_id = auth.uid()
    )
  );

create policy "Users can update sessions for their sources"
  on budgetapp_sessions for update
  using (
    source_id in (
      select source_id from budgetapp_source_permissions
      where user_id = auth.uid()
    )
  );

-- Add session_id to bills table
alter table budgetapp_bills add column if not exists session_id uuid references budgetapp_sessions(id);

-- Add trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_budgetapp_sessions_updated_at
  before update on budgetapp_sessions
  for each row
  execute function update_updated_at_column();
