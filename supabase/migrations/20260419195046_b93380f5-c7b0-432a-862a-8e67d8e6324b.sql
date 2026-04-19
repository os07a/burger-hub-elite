-- Phase 1: Extend employees table
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS national_id TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS hire_date DATE,
  ADD COLUMN IF NOT EXISTS contract_type TEXT,
  ADD COLUMN IF NOT EXISTS contract_start DATE,
  ADD COLUMN IF NOT EXISTS contract_end DATE,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS direct_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS basic_salary NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowances JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS work_days JSONB NOT NULL DEFAULT '["sun","mon","tue","wed","thu"]'::jsonb,
  ADD COLUMN IF NOT EXISTS shift_hours NUMERIC,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add reminder field to employee_docs
ALTER TABLE public.employee_docs
  ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER NOT NULL DEFAULT 30;

-- Phase 2: Five new related tables

-- 1. Qualifications
CREATE TABLE IF NOT EXISTS public.employee_qualifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL, -- degree | certificate | course | experience
  title TEXT NOT NULL,
  institution TEXT,
  year INTEGER,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employee_qualifications"
  ON public.employee_qualifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employee_qualifications"
  ON public.employee_qualifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update employee_qualifications"
  ON public.employee_qualifications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete employee_qualifications"
  ON public.employee_qualifications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Leaves
CREATE TABLE IF NOT EXISTS public.employee_leaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL, -- annual | sick | emergency | unpaid
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employee_leaves"
  ON public.employee_leaves FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employee_leaves"
  ON public.employee_leaves FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update employee_leaves"
  ON public.employee_leaves FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete employee_leaves"
  ON public.employee_leaves FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Penalties
CREATE TABLE IF NOT EXISTS public.employee_penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'warning', -- warning | deduction | final_warning
  penalty_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employee_penalties"
  ON public.employee_penalties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employee_penalties"
  ON public.employee_penalties FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update employee_penalties"
  ON public.employee_penalties FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete employee_penalties"
  ON public.employee_penalties FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Rewards
CREATE TABLE IF NOT EXISTS public.employee_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  reward_type TEXT NOT NULL DEFAULT 'cash', -- cash | recognition
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employee_rewards"
  ON public.employee_rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employee_rewards"
  ON public.employee_rewards FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update employee_rewards"
  ON public.employee_rewards FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete employee_rewards"
  ON public.employee_rewards FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Evaluations
CREATE TABLE IF NOT EXISTS public.employee_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period TEXT NOT NULL DEFAULT 'monthly', -- monthly | quarterly | yearly
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  strengths TEXT,
  weaknesses TEXT,
  goals TEXT,
  evaluator TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view employee_evaluations"
  ON public.employee_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert employee_evaluations"
  ON public.employee_evaluations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update employee_evaluations"
  ON public.employee_evaluations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete employee_evaluations"
  ON public.employee_evaluations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emp_qualifications_employee ON public.employee_qualifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_leaves_employee ON public.employee_leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_penalties_employee ON public.employee_penalties(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_rewards_employee ON public.employee_rewards(employee_id);
CREATE INDEX IF NOT EXISTS idx_emp_evaluations_employee ON public.employee_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_contract_end ON public.employees(contract_end);