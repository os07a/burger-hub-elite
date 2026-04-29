-- Enable realtime for pos_receipt_items so menu analysis updates live
ALTER TABLE public.pos_receipt_items REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_receipt_items;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
