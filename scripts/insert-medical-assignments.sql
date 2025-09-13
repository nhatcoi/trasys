-- Lệnh INSERT cho Trường Y Dược
-- Disable trigger trước khi insert
ALTER TABLE hr.org_assignment DISABLE TRIGGER trg_hr_org_assignment_log;

-- Insert assignments cho Trường Y Dược
INSERT INTO hr.org_assignment (employee_id, org_unit_id, position_id, assignment_type, is_primary, allocation, start_date) VALUES
-- Hiệu trưởng Trường Y Dược
(2, 28, 8, 'admin', true, 1.00, '2020-01-01'),

-- Phó Hiệu trưởng Trường Y Dược  
(3, 28, 9, 'admin', true, 1.00, '2020-01-01'),

-- Trưởng khoa Dược
(4, 29, 1, 'admin', true, 1.00, '2020-01-01'),

-- Trưởng khoa Điều dưỡng
(5, 30, 1, 'admin', true, 1.00, '2020-01-01'),

-- Giảng viên Khoa Dược
(6, 29, 5, 'academic', true, 1.00, '2020-01-01'),
(7, 29, 5, 'academic', true, 1.00, '2020-01-01'),

-- Giảng viên Khoa Điều dưỡng
(8, 30, 5, 'academic', true, 1.00, '2020-01-01'),
(9, 30, 5, 'academic', true, 1.00, '2020-01-01');

-- Enable lại trigger
ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;

-- Kiểm tra kết quả
SELECT 
    oa.id,
    e.employee_no,
    u.full_name,
    ou.name as org_unit_name,
    jp.title as position_title,
    oa.assignment_type
FROM hr.org_assignment oa
JOIN hr.employees e ON oa.employee_id = e.id
JOIN public.users u ON e.user_id = u.id
JOIN public.org_units ou ON oa.org_unit_id = ou.id
LEFT JOIN hr.job_positions jp ON oa.position_id = jp.id
WHERE ou.id IN (28, 29, 30)
ORDER BY ou.id, oa.id;

