ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'ready_made'
CHECK (product_type IN ('primary', 'ready_made'));

CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);