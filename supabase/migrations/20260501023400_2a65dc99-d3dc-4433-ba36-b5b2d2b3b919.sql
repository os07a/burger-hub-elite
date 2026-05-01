-- Fix existing employee data
UPDATE public.employees
SET name='محمد ميراز محمد سراج',
    national_id='2631396682',
    nationality='بنجلاديش',
    role='عامل تعبئة وتغليف',
    role_short='تعبئة',
    job_title='عامل تعبئة وتغليف',
    department='مطبخ',
    salary=1500,
    basic_salary=1500,
    birth_date='2001-06-03'
WHERE id='4eac9cc7-d06a-4595-b773-5affb4c2ee2e';

-- Add iqama documents for the 3 employees
-- Hijri 1447/09/08 ≈ 2026-02-26 ; Hijri 1447/08/16 ≈ 2026-02-04
INSERT INTO public.employee_docs (employee_id, label, doc_type, doc_number, issue_date, expiry_date, status, status_variant, image_url, details) VALUES
('4eac9cc7-d06a-4595-b773-5affb4c2ee2e', 'الإقامة', 'iqama', '2631396682', '1447/09/08 هـ', '1447/09/08 هـ (تقريباً 26 فبراير 2026)', 'سارية', 'success', 'miraz/iqama.png', 'محمد ميراز محمد سراج — بنجلاديش'),
('af5380e6-9006-4ca0-bc10-bf488c11964c', 'الإقامة', 'iqama', '2629306669', '1447/08/16 هـ', '1447/08/16 هـ (تقريباً 4 فبراير 2026)', 'سارية', 'success', 'arman/iqama.png', 'محمد أرمان أوسين أوسين — بنجلاديش'),
('22762efc-a7c7-4a9a-87ff-15e6a2c7ce90', 'الإقامة', 'iqama', '2586653103', NULL, '17 نوفمبر 2026', 'سارية', 'success', 'mirajul/iqama.png', 'محمد ميراجول الإسلام — بنجلاديش');