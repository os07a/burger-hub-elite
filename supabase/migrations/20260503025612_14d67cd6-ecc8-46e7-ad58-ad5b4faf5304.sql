create table if not exists public.whatsapp_invoice_intake (
  id uuid primary key default gen_random_uuid(),
  from_phone text not null,
  meta_message_id text,
  media_id text not null,
  image_url text,
  status text not null default 'processing',
  invoice_id uuid,
  supplier_name text,
  amount numeric,
  error_message text,
  processing_time_ms integer,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wa_intake_created_at on public.whatsapp_invoice_intake(created_at desc);
create index if not exists idx_wa_intake_status on public.whatsapp_invoice_intake(status);

alter table public.whatsapp_invoice_intake enable row level security;

create policy "Authenticated can view wa_intake"
  on public.whatsapp_invoice_intake for select
  to authenticated using (true);

create policy "Admins can insert wa_intake"
  on public.whatsapp_invoice_intake for insert
  to authenticated with check (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can update wa_intake"
  on public.whatsapp_invoice_intake for update
  to authenticated using (has_role(auth.uid(), 'admin'::app_role));

create policy "Admins can delete wa_intake"
  on public.whatsapp_invoice_intake for delete
  to authenticated using (has_role(auth.uid(), 'admin'::app_role));

create trigger update_wa_intake_updated_at
  before update on public.whatsapp_invoice_intake
  for each row execute function public.update_updated_at_column();

alter publication supabase_realtime add table public.whatsapp_invoice_intake;
alter table public.whatsapp_invoice_intake replica identity full;