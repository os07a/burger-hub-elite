-- 1. إضافة عمود image_url + account + recipient + month_label إلى جدول الفواتير
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS account text,
  ADD COLUMN IF NOT EXISTS recipient text,
  ADD COLUMN IF NOT EXISTS month_label text,
  ADD COLUMN IF NOT EXISTS doc_type text DEFAULT 'invoice';

-- 2. إنشاء bucket لصور الفواتير (خاص)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-images', 'invoice-images', false)
ON CONFLICT (id) DO NOTHING;

-- 3. سياسات RLS للـ bucket
CREATE POLICY "Authenticated can view invoice images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'invoice-images');

CREATE POLICY "Admins can upload invoice images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoice-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invoice images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'invoice-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invoice images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'invoice-images' AND has_role(auth.uid(), 'admin'::app_role));