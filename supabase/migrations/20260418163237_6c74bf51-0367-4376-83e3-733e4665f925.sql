-- Items per receipt from Loyverse
CREATE TABLE IF NOT EXISTS public.pos_receipt_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  receipt_date DATE NOT NULL,
  item_name TEXT NOT NULL,
  variant_name TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  gross_total NUMERIC NOT NULL DEFAULT 0,
  net_total NUMERIC NOT NULL DEFAULT 0,
  cost_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_receipt_items_date ON public.pos_receipt_items(receipt_date);
CREATE INDEX IF NOT EXISTS idx_pos_receipt_items_receipt ON public.pos_receipt_items(receipt_number);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pos_receipt_items ON public.pos_receipt_items(receipt_number, item_name, COALESCE(variant_name, ''));

ALTER TABLE public.pos_receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view pos_receipt_items"
ON public.pos_receipt_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert pos_receipt_items"
ON public.pos_receipt_items FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pos_receipt_items"
ON public.pos_receipt_items FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pos_receipt_items"
ON public.pos_receipt_items FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));