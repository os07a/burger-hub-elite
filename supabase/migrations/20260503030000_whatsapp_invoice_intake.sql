-- Allowed WhatsApp senders (operators trusted to send invoices)
CREATE TABLE IF NOT EXISTS public.whatsapp_allowed_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.whatsapp_allowed_senders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view allowed senders" ON public.whatsapp_allowed_senders;
CREATE POLICY "Authenticated can view allowed senders"
  ON public.whatsapp_allowed_senders FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert allowed senders" ON public.whatsapp_allowed_senders;
CREATE POLICY "Admins can insert allowed senders"
  ON public.whatsapp_allowed_senders FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update allowed senders" ON public.whatsapp_allowed_senders;
CREATE POLICY "Admins can update allowed senders"
  ON public.whatsapp_allowed_senders FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete allowed senders" ON public.whatsapp_allowed_senders;
CREATE POLICY "Admins can delete allowed senders"
  ON public.whatsapp_allowed_senders FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Extend invoices for AI-imported records
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS supplier_name TEXT,
  ADD COLUMN IF NOT EXISTS ai_extracted JSONB,
  ADD COLUMN IF NOT EXISTS whatsapp_from TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_needs_review ON public.invoices(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_invoices_source ON public.invoices(source);

-- Realtime for new invoices
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
ALTER TABLE public.invoices REPLICA IDENTITY FULL;
