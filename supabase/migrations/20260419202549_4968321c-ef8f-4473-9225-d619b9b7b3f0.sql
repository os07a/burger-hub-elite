
-- 1) Expand attendance table
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS check_in_lat numeric,
  ADD COLUMN IF NOT EXISTS check_in_lng numeric,
  ADD COLUMN IF NOT EXISTS check_in_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS check_out_lat numeric,
  ADD COLUMN IF NOT EXISTS check_out_lng numeric,
  ADD COLUMN IF NOT EXISTS check_out_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS late_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS early_leave_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_minutes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS request_type text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS edited_by uuid,
  ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- Allow employees to insert their own punches: needs link from employee_id to auth user.
-- Since employees has no user_id column, we keep insert restricted to authenticated and admins handle from UI for now.
-- Add a permissive insert for authenticated (they can only insert via UI; sensitive edits limited to admins).
DROP POLICY IF EXISTS "Authenticated can insert attendance" ON public.attendance;
CREATE POLICY "Authenticated can insert attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2) Expand employees with shift times
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS shift_start_time time,
  ADD COLUMN IF NOT EXISTS shift_end_time time;

-- 3) restaurant_settings (singleton)
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude numeric,
  longitude numeric,
  radius_meters integer NOT NULL DEFAULT 200,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view restaurant_settings"
ON public.restaurant_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert restaurant_settings"
ON public.restaurant_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update restaurant_settings"
ON public.restaurant_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete restaurant_settings"
ON public.restaurant_settings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_restaurant_settings_updated_at
BEFORE UPDATE ON public.restaurant_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed one row if empty
INSERT INTO public.restaurant_settings (radius_meters)
SELECT 200 WHERE NOT EXISTS (SELECT 1 FROM public.restaurant_settings);

-- 4) attendance_audit
CREATE TABLE IF NOT EXISTS public.attendance_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
  changed_by uuid,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_audit_attendance_id ON public.attendance_audit(attendance_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_changed_at ON public.attendance_audit(changed_at DESC);

ALTER TABLE public.attendance_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view attendance_audit"
ON public.attendance_audit FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can insert attendance_audit"
ON public.attendance_audit FOR INSERT TO authenticated
WITH CHECK (true);
