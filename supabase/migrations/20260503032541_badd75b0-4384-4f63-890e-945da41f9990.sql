ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS supplier_name text,
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_from text,
  ADD COLUMN IF NOT EXISTS ai_extracted jsonb;

CREATE INDEX IF NOT EXISTS idx_invoices_needs_review ON public.invoices(needs_review) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS idx_invoices_source ON public.invoices(source);