ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_id
  ON public.whatsapp_messages(customer_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_meta_message_id
  ON public.whatsapp_messages(meta_message_id);
