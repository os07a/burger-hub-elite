-- 1) إضافة الأعمدة الجديدة
ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'outbound',
  ADD COLUMN IF NOT EXISTS from_phone text,
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_type text,
  ADD COLUMN IF NOT EXISTS read_by_user_at timestamp with time zone;

-- 2) فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_sent
  ON public.whatsapp_messages (to_phone, from_phone, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction
  ON public.whatsapp_messages (direction, sent_at DESC);

-- 3) تحديث سياسة العرض: السماح للمصادقين بمشاهدة كل الرسائل
DROP POLICY IF EXISTS "Users can view their own whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Admins can view all whatsapp messages" ON public.whatsapp_messages;

CREATE POLICY "Authenticated can view all whatsapp messages"
  ON public.whatsapp_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- 4) السماح بتحديث read_by_user_at للمصادقين (لتحديد الرسائل كمقروءة)
CREATE POLICY "Authenticated can update whatsapp messages read state"
  ON public.whatsapp_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5) Realtime
ALTER TABLE public.whatsapp_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'whatsapp_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages';
  END IF;
END $$;