-- منع تنفيذ الدالتين من anon والمستخدمين العموميين
REVOKE EXECUTE ON FUNCTION public.set_inventory_trigger(boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_inventory_trigger_status() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.set_inventory_trigger(boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_inventory_trigger_status() TO authenticated;