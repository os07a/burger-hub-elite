-- 1) Add image_url column to employee_docs
ALTER TABLE public.employee_docs
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2) Create public storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-docs', 'employee-docs', true)
ON CONFLICT (id) DO NOTHING;

-- 3) Storage policies
CREATE POLICY "Public can view employee-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-docs');

CREATE POLICY "Admins can upload employee-docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update employee-docs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete employee-docs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-docs' AND public.has_role(auth.uid(), 'admin'));