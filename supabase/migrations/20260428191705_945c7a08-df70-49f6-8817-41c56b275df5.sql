-- ============================================================
-- المرحلة 1: وحدة الوصفات + الخصم التلقائي من المخزون
-- ============================================================

-- 1) إضافة loyverse_item_id على products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS loyverse_item_id text;

CREATE UNIQUE INDEX IF NOT EXISTS products_loyverse_item_id_key
  ON public.products (loyverse_item_id)
  WHERE loyverse_item_id IS NOT NULL;

-- 2) إضافة loyverse_item_id على pos_receipt_items
ALTER TABLE public.pos_receipt_items
  ADD COLUMN IF NOT EXISTS loyverse_item_id text;

CREATE INDEX IF NOT EXISTS pos_receipt_items_loyverse_item_id_idx
  ON public.pos_receipt_items (loyverse_item_id);

-- 3) جدول product_recipes (مع تأريخ valid_from/valid_to)
CREATE TABLE IF NOT EXISTS public.product_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity_per_unit numeric NOT NULL CHECK (quantity_per_unit > 0),
  unit text NOT NULL,
  waste_percentage numeric NOT NULL DEFAULT 0 CHECK (waste_percentage >= 0 AND waste_percentage <= 100),
  notes text,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- منع تكرار نفس المكون في النسخة النشطة لنفس المنتج
CREATE UNIQUE INDEX IF NOT EXISTS product_recipes_active_unique
  ON public.product_recipes (product_id, inventory_item_id)
  WHERE valid_to IS NULL;

CREATE INDEX IF NOT EXISTS product_recipes_product_active_idx
  ON public.product_recipes (product_id) WHERE valid_to IS NULL;

CREATE TRIGGER trg_product_recipes_updated_at
  BEFORE UPDATE ON public.product_recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view product_recipes"
  ON public.product_recipes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert product_recipes"
  ON public.product_recipes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product_recipes"
  ON public.product_recipes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product_recipes"
  ON public.product_recipes FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 4) جدول inventory_movements
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id uuid NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('sale','purchase','adjustment','waste','opening')),
  quantity numeric NOT NULL,
  reference_id uuid,
  reference_type text,
  cost_at_movement numeric NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_movements_item_created_idx
  ON public.inventory_movements (inventory_item_id, created_at DESC);

CREATE INDEX IF NOT EXISTS inventory_movements_type_created_idx
  ON public.inventory_movements (movement_type, created_at DESC);

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view inventory_movements"
  ON public.inventory_movements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert inventory_movements"
  ON public.inventory_movements FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inventory_movements"
  ON public.inventory_movements FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete inventory_movements"
  ON public.inventory_movements FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 5) جدول unmatched_sales
CREATE TABLE IF NOT EXISTS public.unmatched_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_receipt_item_id uuid,
  loyverse_item_id text,
  item_name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  reason text NOT NULL CHECK (reason IN ('no_loyverse_id','product_not_found','no_active_recipe','missing_ingredient','error')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS unmatched_sales_created_idx
  ON public.unmatched_sales (created_at DESC);

CREATE INDEX IF NOT EXISTS unmatched_sales_reason_idx
  ON public.unmatched_sales (reason);

ALTER TABLE public.unmatched_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view unmatched_sales"
  ON public.unmatched_sales FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can delete unmatched_sales"
  ON public.unmatched_sales FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ملاحظة: لا توجد سياسة INSERT صريحة لـ unmatched_sales ولا inventory_movements (بسبب التريغر)
-- التريغر SECURITY DEFINER سيتجاوز RLS للكتابة.

-- 6) جدول opening_inventory_runs
CREATE TABLE IF NOT EXISTS public.opening_inventory_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date timestamptz NOT NULL DEFAULT now(),
  run_type text NOT NULL CHECK (run_type IN ('opening','adjustment')),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS opening_inventory_runs_date_idx
  ON public.opening_inventory_runs (run_date DESC);

ALTER TABLE public.opening_inventory_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view opening_inventory_runs"
  ON public.opening_inventory_runs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert opening_inventory_runs"
  ON public.opening_inventory_runs FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update opening_inventory_runs"
  ON public.opening_inventory_runs FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete opening_inventory_runs"
  ON public.opening_inventory_runs FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ============================================================
-- 7) دالة الخصم التلقائي + التريغر
-- ============================================================

CREATE OR REPLACE FUNCTION public.deduct_inventory_on_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id uuid;
  v_recipe RECORD;
  v_required_qty numeric;
  v_inv_unit text;
  v_inv_qty numeric;
  v_inv_cost numeric;
  v_factor numeric;
BEGIN
  -- 1) لازم يكون فيه loyverse_item_id
  IF NEW.loyverse_item_id IS NULL OR length(trim(NEW.loyverse_item_id)) = 0 THEN
    INSERT INTO public.unmatched_sales(pos_receipt_item_id, loyverse_item_id, item_name, quantity, reason, details)
    VALUES (NEW.id, NEW.loyverse_item_id, NEW.item_name, NEW.quantity, 'no_loyverse_id', '{}'::jsonb);
    RETURN NEW;
  END IF;

  -- 2) ابحث عن المنتج
  SELECT id INTO v_product_id
  FROM public.products
  WHERE loyverse_item_id = NEW.loyverse_item_id
  LIMIT 1;

  IF v_product_id IS NULL THEN
    INSERT INTO public.unmatched_sales(pos_receipt_item_id, loyverse_item_id, item_name, quantity, reason, details)
    VALUES (NEW.id, NEW.loyverse_item_id, NEW.item_name, NEW.quantity, 'product_not_found', '{}'::jsonb);
    RETURN NEW;
  END IF;

  -- 3) لف على مكونات الوصفة النشطة
  FOR v_recipe IN
    SELECT pr.*, ii.unit AS inv_unit, ii.quantity AS inv_qty, ii.cost_per_unit AS inv_cost, ii.name AS inv_name
    FROM public.product_recipes pr
    JOIN public.inventory_items ii ON ii.id = pr.inventory_item_id
    WHERE pr.product_id = v_product_id AND pr.valid_to IS NULL
  LOOP
    -- تحويل الوحدة (جرام→كجم، مل→لتر)
    v_factor := 1;
    IF lower(v_recipe.unit) = 'جرام' AND lower(v_recipe.inv_unit) IN ('كجم','kg') THEN
      v_factor := 1.0/1000.0;
    ELSIF lower(v_recipe.unit) = 'مل' AND lower(v_recipe.inv_unit) IN ('لتر','l') THEN
      v_factor := 1.0/1000.0;
    ELSIF lower(v_recipe.unit) = 'كجم' AND lower(v_recipe.inv_unit) IN ('جرام','g') THEN
      v_factor := 1000.0;
    ELSIF lower(v_recipe.unit) = 'لتر' AND lower(v_recipe.inv_unit) IN ('مل','ml') THEN
      v_factor := 1000.0;
    END IF;

    v_required_qty := v_recipe.quantity_per_unit * NEW.quantity * v_factor * (1 + v_recipe.waste_percentage/100.0);

    -- فحص النقص (لكن نُكمل الخصم)
    IF v_recipe.inv_qty < v_required_qty THEN
      INSERT INTO public.unmatched_sales(pos_receipt_item_id, loyverse_item_id, item_name, quantity, reason, details)
      VALUES (NEW.id, NEW.loyverse_item_id, NEW.item_name, NEW.quantity, 'missing_ingredient',
        jsonb_build_object(
          'ingredient', v_recipe.inv_name,
          'required', v_required_qty,
          'available', v_recipe.inv_qty,
          'shortage', v_required_qty - v_recipe.inv_qty
        ));
    END IF;

    -- خصم من المخزون
    UPDATE public.inventory_items
    SET quantity = quantity - v_required_qty,
        updated_at = now()
    WHERE id = v_recipe.inventory_item_id;

    -- تسجيل الحركة
    INSERT INTO public.inventory_movements(
      inventory_item_id, movement_type, quantity, reference_id, reference_type, cost_at_movement, notes
    ) VALUES (
      v_recipe.inventory_item_id, 'sale', -v_required_qty, NEW.id, 'pos_receipt_item',
      v_recipe.inv_cost, NULL
    );
  END LOOP;

  -- لو ما لقى وصفة نشطة (الـ FOR loop ما عمل أي iteration)
  IF NOT FOUND THEN
    INSERT INTO public.unmatched_sales(pos_receipt_item_id, loyverse_item_id, item_name, quantity, reason, details)
    VALUES (NEW.id, NEW.loyverse_item_id, NEW.item_name, NEW.quantity, 'no_active_recipe', '{}'::jsonb);
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- لا تُكسر مزامنة Loyverse مهما حصل
  INSERT INTO public.unmatched_sales(pos_receipt_item_id, loyverse_item_id, item_name, quantity, reason, details)
  VALUES (NEW.id, NEW.loyverse_item_id, NEW.item_name, NEW.quantity, 'error',
    jsonb_build_object('error', SQLERRM, 'sqlstate', SQLSTATE));
  RETURN NEW;
END;
$$;

-- ربط التريغر
DROP TRIGGER IF EXISTS deduct_inventory_trigger ON public.pos_receipt_items;
CREATE TRIGGER deduct_inventory_trigger
  AFTER INSERT ON public.pos_receipt_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_inventory_on_sale();

-- ⚠️ التريغر معطّل افتراضياً
ALTER TABLE public.pos_receipt_items DISABLE TRIGGER deduct_inventory_trigger;

-- ============================================================
-- 8) دالة الإدارة لتفعيل/إيقاف التريغر (للأدمن فقط، تُستدعى من edge function)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_inventory_trigger(p_enabled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  IF p_enabled THEN
    EXECUTE 'ALTER TABLE public.pos_receipt_items ENABLE TRIGGER deduct_inventory_trigger';
  ELSE
    EXECUTE 'ALTER TABLE public.pos_receipt_items DISABLE TRIGGER deduct_inventory_trigger';
  END IF;

  RETURN jsonb_build_object('enabled', p_enabled);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_inventory_trigger_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled boolean;
BEGIN
  SELECT (tgenabled <> 'D') INTO v_enabled
  FROM pg_trigger
  WHERE tgname = 'deduct_inventory_trigger'
    AND tgrelid = 'public.pos_receipt_items'::regclass;

  RETURN jsonb_build_object('enabled', COALESCE(v_enabled, false));
END;
$$;