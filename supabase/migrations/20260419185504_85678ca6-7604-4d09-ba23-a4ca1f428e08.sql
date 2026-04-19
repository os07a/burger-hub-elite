CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_phone TEXT NOT NULL,
  body TEXT NOT NULL,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  meta_message_id TEXT,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all whatsapp messages"
ON public.whatsapp_messages FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own whatsapp messages"
ON public.whatsapp_messages FOR SELECT
TO authenticated
USING (auth.uid() = sent_by);

CREATE POLICY "Authenticated can insert whatsapp messages"
ON public.whatsapp_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sent_by);

CREATE POLICY "Admins can delete whatsapp messages"
ON public.whatsapp_messages FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_whatsapp_messages_sent_at ON public.whatsapp_messages(sent_at DESC);
CREATE INDEX idx_whatsapp_messages_sent_by ON public.whatsapp_messages(sent_by);