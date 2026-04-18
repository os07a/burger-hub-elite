-- Partner shares: every share = 1,000 SAR ownership unit
CREATE TABLE public.partner_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name text NOT NULL,
  shares_count integer NOT NULL DEFAULT 0,
  share_value numeric NOT NULL DEFAULT 1000,
  category text NOT NULL,
  committed_date date,
  paid_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view partner_shares" ON public.partner_shares
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert partner_shares" ON public.partner_shares
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update partner_shares" ON public.partner_shares
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete partner_shares" ON public.partner_shares
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_partner_shares_updated_at
  BEFORE UPDATE ON public.partner_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Share milestones (capital raise schedule)
CREATE TABLE public.share_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  due_date date NOT NULL,
  shares_required integer NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.share_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view share_milestones" ON public.share_milestones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert share_milestones" ON public.share_milestones
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update share_milestones" ON public.share_milestones
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete share_milestones" ON public.share_milestones
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Monthly distributions (computed snapshots)
CREATE TABLE public.monthly_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL UNIQUE,
  total_revenue numeric NOT NULL DEFAULT 0,
  shares_generated integer NOT NULL DEFAULT 0,
  per_share_amount numeric NOT NULL DEFAULT 0,
  reserved_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view monthly_distributions" ON public.monthly_distributions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert monthly_distributions" ON public.monthly_distributions
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update monthly_distributions" ON public.monthly_distributions
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete monthly_distributions" ON public.monthly_distributions
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed Osama's reserved shares per agreement
INSERT INTO public.partner_shares (partner_name, shares_count, category, committed_date, paid_date, notes) VALUES
  ('أسامة', 30, 'فكرة وتأسيس', '2026-01-01', '2026-01-01', 'قيمة فكرة المشروع والتأسيس'),
  ('أسامة', 40, 'مصروف فعلي', '2026-01-01', '2026-01-01', '20k إيجار + 10k استيل + 10k قيشاني'),
  ('أسامة', 10, 'إشراف عام', '2026-01-01', NULL, '10 أسهم مقابل 6 أشهر إشراف (مؤجلة)'),
  ('أسامة', 6, 'تغذية وصيانة', '2026-01-01', NULL, '6 أسهم مقابل 6 أشهر تغذية وصيانة (مؤجلة)');

-- Seed milestones (capital raise schedule per agreement)
INSERT INTO public.share_milestones (due_date, shares_required, description, status) VALUES
  ('2026-04-01', 50, 'دفعة ما قبل الافتتاح — تكميل تجهيز المحل', 'pending'),
  ('2026-05-01', 12, 'دفعة شهرية — مايو', 'pending'),
  ('2026-06-01', 12, 'دفعة شهرية — يونيو', 'pending'),
  ('2026-07-01', 12, 'دفعة شهرية — يوليو', 'pending'),
  ('2026-08-01', 12, 'دفعة شهرية — أغسطس', 'pending'),
  ('2026-09-01', 12, 'دفعة شهرية — سبتمبر', 'pending'),
  ('2026-10-01', 12, 'دفعة شهرية — أكتوبر', 'pending');