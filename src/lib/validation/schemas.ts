import { z } from "zod";

/**
 * مخططات Zod مركزية للنماذج الحساسة — OWASP A03 (Injection) & A04 (Insecure Design)
 * تُستخدم مع react-hook-form عبر zodResolver.
 */

const trimmedString = (max: number, label = "هذا الحقل") =>
  z
    .string()
    .trim()
    .max(max, { message: `${label} طويل جداً (الحد ${max})` });

const requiredString = (max: number, label = "هذا الحقل") =>
  trimmedString(max, label).min(1, { message: `${label} مطلوب` });

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .nullable();

const nonNegativeNumber = (label = "القيمة") =>
  z.coerce
    .number({ invalid_type_error: `${label} يجب أن تكون رقم` })
    .min(0, { message: `${label} لا يمكن أن تكون سالبة` })
    .max(1e9, { message: `${label} كبيرة جداً` });

const saudiPhoneOptional = z
  .string()
  .trim()
  .max(20)
  .regex(/^(\+?966|0)?5\d{8}$/i, { message: "رقم جوال سعودي غير صالح" })
  .optional()
  .or(z.literal(""))
  .nullable();

const ibanOptional = z
  .string()
  .trim()
  .max(34)
  .regex(/^SA\d{22}$/i, { message: "IBAN سعودي غير صالح (SA + 22 رقم)" })
  .optional()
  .or(z.literal(""))
  .nullable();

const emailOptional = z
  .string()
  .trim()
  .max(255)
  .email({ message: "بريد إلكتروني غير صالح" })
  .optional()
  .or(z.literal(""))
  .nullable();

/* ============== Product ============== */
export const productSchema = z.object({
  name: requiredString(200, "اسم المنتج"),
  category: optionalString(100),
  price: nonNegativeNumber("السعر"),
  cost: nonNegativeNumber("التكلفة"),
  description: optionalString(2000),
  image_url: optionalString(2048),
  loyverse_item_id: optionalString(100),
  product_type: z.enum(["ready_made", "with_recipe"]).default("ready_made"),
  is_active: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;

/* ============== Inventory Item ============== */
export const inventoryItemSchema = z.object({
  name: requiredString(200, "اسم المكوّن"),
  category: optionalString(100),
  unit: requiredString(20, "الوحدة"),
  quantity: nonNegativeNumber("الكمية"),
  min_quantity: nonNegativeNumber("الحد الأدنى"),
  cost_per_unit: nonNegativeNumber("تكلفة الوحدة"),
  supplier: optionalString(200),
});
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

/* ============== Employee ============== */
export const employeeSchema = z.object({
  name: requiredString(150, "الاسم"),
  role: requiredString(100, "الوظيفة"),
  phone: saudiPhoneOptional,
  national_id: z
    .string()
    .trim()
    .regex(/^\d{10}$/, { message: "رقم الهوية يجب أن يكون 10 أرقام" })
    .optional()
    .or(z.literal(""))
    .nullable(),
  nationality: optionalString(50),
  address: optionalString(500),
  emergency_contact: optionalString(100),
  basic_salary: nonNegativeNumber("الراتب الأساسي"),
  salary: nonNegativeNumber("الراتب الإجمالي"),
  bank_name: optionalString(100),
  iban: ibanOptional,
  department: optionalString(100),
  job_title: optionalString(100),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;

/* ============== Supplier ============== */
export const supplierSchema = z.object({
  name: requiredString(200, "اسم المورد"),
  category: optionalString(100),
  contact_name: optionalString(150),
  phone: saudiPhoneOptional,
  email: emailOptional,
  payment_terms: optionalString(200),
  notes: optionalString(2000),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
});
export type SupplierInput = z.infer<typeof supplierSchema>;

/* ============== Invoice ============== */
export const invoiceSchema = z.object({
  invoice_number: optionalString(100),
  doc_type: optionalString(50),
  amount: nonNegativeNumber("المبلغ"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "تاريخ غير صالح" }),
  status: optionalString(50),
  recipient: optionalString(200),
  account: optionalString(100),
  month_label: optionalString(50),
  notes: optionalString(2000),
  image_url: optionalString(2048),
  supplier_id: z.string().uuid().optional().nullable().or(z.literal("")),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

/* ============== Employee Doc ============== */
export const employeeDocSchema = z.object({
  doc_type: requiredString(50, "نوع المستند"),
  label: requiredString(150, "اسم المستند"),
  doc_number: optionalString(100),
  issue_date: optionalString(20),
  expiry_date: optionalString(20),
  reminder_days_before: z.coerce.number().int().min(0).max(365).default(30),
  details: optionalString(1000),
  image_url: optionalString(2048),
});
export type EmployeeDocInput = z.infer<typeof employeeDocSchema>;

/* ============== Recipe Ingredient ============== */
export const recipeIngredientSchema = z.object({
  inventory_item_id: z.string().uuid({ message: "اختر مكوّن صالح" }),
  quantity_per_unit: z.coerce
    .number()
    .positive({ message: "الكمية يجب أن تكون أكبر من صفر" })
    .max(10000),
  unit: requiredString(20, "الوحدة"),
  waste_percentage: z.coerce.number().min(0).max(100).default(0),
  notes: optionalString(500),
});
export type RecipeIngredientInput = z.infer<typeof recipeIngredientSchema>;
