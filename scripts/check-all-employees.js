const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllEmployees() {
    try {
        console.log('🔍 Kiểm tra tất cả employees...\n');

        // 1. Lấy tất cả employees
        const employees = await prisma.employee.findMany({
            include: {
                user: true
            }
        });

        console.log('📋 Tất cả employees:');
        employees.forEach((emp, index) => {
            console.log(`  ${index + 1}. ID: ${emp.id} - ${emp.user?.full_name} (${emp.employee_no})`);
        });

        // 2. Lấy tất cả org_units
        const orgUnits = await prisma.orgUnit.findMany({
            where: {
                id: {
                    in: [BigInt(28), BigInt(29), BigInt(30)]
                }
            }
        });

        console.log('\n📋 Org Units Y Dược:');
        orgUnits.forEach(unit => {
            console.log(`  - ID: ${unit.id} - ${unit.name} (${unit.code})`);
        });

        // 3. Lấy tất cả job_positions
        const positions = await prisma.jobPosition.findMany({
            where: {
                id: {
                    in: [BigInt(1), BigInt(5), BigInt(8), BigInt(9)]
                }
            }
        });

        console.log('\n📋 Job Positions:');
        positions.forEach(pos => {
            console.log(`  - ID: ${pos.id} - ${pos.title} (${pos.code})`);
        });

        console.log('\n💡 Lệnh INSERT với ID cụ thể:');
        console.log(`
-- Disable trigger
ALTER TABLE hr.org_assignment DISABLE TRIGGER trg_hr_org_assignment_log;

-- Insert với ID cụ thể
INSERT INTO hr.org_assignment (employee_id, org_unit_id, position_id, assignment_type, is_primary, allocation, start_date) VALUES
-- Hiệu trưởng Trường Y Dược
(${employees[0]?.id || 2}, 28, 8, 'admin', true, 1.00, '2020-01-01'),

-- Phó Hiệu trưởng Trường Y Dược  
(${employees[1]?.id || 3}, 28, 9, 'admin', true, 1.00, '2020-01-01'),

-- Trưởng khoa Dược
(${employees[2]?.id || 4}, 29, 1, 'admin', true, 1.00, '2020-01-01'),

-- Trưởng khoa Điều dưỡng
(${employees[3]?.id || 5}, 30, 1, 'admin', true, 1.00, '2020-01-01'),

-- Giảng viên Khoa Dược
(${employees[4]?.id || 6}, 29, 5, 'academic', true, 1.00, '2020-01-01'),
(${employees[5]?.id || 7}, 29, 5, 'academic', true, 1.00, '2020-01-01'),

-- Giảng viên Khoa Điều dưỡng
(${employees[6]?.id || 8}, 30, 5, 'academic', true, 1.00, '2020-01-01'),
(${employees[7]?.id || 9}, 30, 5, 'academic', true, 1.00, '2020-01-01');

-- Enable lại trigger
ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;
        `);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllEmployees();

