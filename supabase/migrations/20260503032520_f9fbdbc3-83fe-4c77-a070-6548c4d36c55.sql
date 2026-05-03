-- 1) Extend suppliers
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS tax_number text,
  ADD COLUMN IF NOT EXISTS last_invoice_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_suppliers_tax_number ON public.suppliers(tax_number);
CREATE INDEX IF NOT EXISTS idx_suppliers_name_lower ON public.suppliers(lower(name));

-- 2) Extend invoices
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS subtotal numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS confidence_score numeric;

-- 3) Extend whatsapp_invoice_intake (rename later not needed; keep table)
ALTER TABLE public.whatsapp_invoice_intake
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supplier_name text,
  ADD COLUMN IF NOT EXISTS amount numeric,
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS processing_time_ms integer;

-- Allow from_phone to be nullable for non-whatsapp sources
ALTER TABLE public.whatsapp_invoice_intake ALTER COLUMN from_phone DROP NOT NULL;
-- Allow media_id to be nullable for non-whatsapp sources
ALTER TABLE public.whatsapp_invoice_intake ALTER COLUMN media_id DROP NOT NULL;

-- 4) New table: invoice_line_items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  inventory_item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  matched_automatically boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_inventory ON public.invoice_line_items(inventory_item_id);

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view line_items" ON public.invoice_line_items;
CREATE POLICY "Authenticated can view line_items"
  ON public.invoice_line_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert line_items" ON public.invoice_line_items;
CREATE POLICY "Admins can insert line_items"
  ON public.invoice_line_items FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update line_items" ON public.invoice_line_items;
CREATE POLICY "Admins can update line_items"
  ON public.invoice_line_items FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete line_items" ON public.invoice_line_items;
CREATE POLICY "Admins can delete line_items"
  ON public.invoice_line_items FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER TABLE public.invoice_line_items REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'invoice_line_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_line_items;
  END IF;
END$$;