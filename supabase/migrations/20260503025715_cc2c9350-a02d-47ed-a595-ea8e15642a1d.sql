create table if not exists public.whatsapp_allowed_senders (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_allowed_senders enable row level security;

create policy "Authenticated can view allowed_senders"
  on public.whatsapp_allowed_senders for select
  to authenticated using (true);

create policy "Admins can insert allowed_senders"
  on public.whatsapp_allowed_senders for insert
  to authenticated with check (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update allowed_senders"
  on public.whatsapp_allowed_senders for update
  to authenticated using (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete allowed_senders"
  on public.whatsapp_allowed_senders for delete
  to authenticated using (has_role(auth.uid(), 'admin'::app_role));