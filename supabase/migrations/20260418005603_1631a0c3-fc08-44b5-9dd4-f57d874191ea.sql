-- Create loyalty_customers table
CREATE TABLE public.loyalty_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loyverse_customer_id text NOT NULL UNIQUE,
  name text,
  phone text,
  email text,
  total_visits integer NOT NULL DEFAULT 0,
  total_points numeric NOT NULL DEFAULT 0,
  total_spent numeric NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'regular',
  first_visit timestamp with time zone,
  last_visit timestamp with time zone,
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_loyalty_customers_last_visit ON public.loyalty_customers(last_visit DESC);
CREATE INDEX idx_loyalty_customers_tier ON public.loyalty_customers(tier);

-- Enable RLS
ALTER TABLE public.loyalty_customers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated can view loyalty_customers"
  ON public.loyalty_customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert loyalty_customers"
  ON public.loyalty_customers FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update loyalty_customers"
  ON public.loyalty_customers FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete loyalty_customers"
  ON public.loyalty_customers FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));