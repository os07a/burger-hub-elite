CREATE TABLE public.pos_receipts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number text NOT NULL UNIQUE,
  receipt_date date NOT NULL,
  created_at_pos timestamp with time zone,
  receipt_type text NOT NULL DEFAULT 'SALE',
  total numeric NOT NULL DEFAULT 0,
  cash numeric NOT NULL DEFAULT 0,
  card numeric NOT NULL DEFAULT 0,
  delivery numeric NOT NULL DEFAULT 0,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_pos_receipts_date ON public.pos_receipts(receipt_date DESC);
CREATE INDEX idx_pos_receipts_created_at_pos ON public.pos_receipts(created_at_pos DESC);

ALTER TABLE public.pos_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view pos_receipts"
  ON public.pos_receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert pos_receipts"
  ON public.pos_receipts FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pos_receipts"
  ON public.pos_receipts FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pos_receipts"
  ON public.pos_receipts FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));