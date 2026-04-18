ALTER TABLE public.daily_sales
  ADD COLUMN IF NOT EXISTS gross_sales numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refunds numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discounts numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_sales numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cogs numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_profit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS margin numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxes numeric NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS daily_sales_date_unique_idx
  ON public.daily_sales (date);

CREATE UNIQUE INDEX IF NOT EXISTS pos_receipts_receipt_number_unique_idx
  ON public.pos_receipts (receipt_number);