const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateToMedicalSchool() {
    try {
        console.log('🏥 Cập nhật assignments để gán vào Trường Y Dược...\n');

        // 1. Cập nhật assignment đầu tiên thành Hiệu trưởng Trường Y Dược
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 28,
                position_id = 8,
                assignment_type = 'admin',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1);
        `;
        console.log('✅ Cập nhật Hiệu trưởng Trường Y Dược');

        // 2. Cập nhật assignment thứ 2 thành Phó Hiệu trưởng Trường Y Dược
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 28,
                position_id = 9,
                assignment_type = 'admin',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1 OFFSET 1);
        `;
        console.log('✅ Cập nhật Phó Hiệu trưởng Trường Y Dược');

        // 3. Cập nhật assignment thứ 3 thành Trưởng khoa Dược
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 29,
                position_id = 1,
                assignment_type = 'admin',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1 OFFSET 2);
        `;
        console.log('✅ Cập nhật Trưởng khoa Dược');

        // 4. Cập nhật assignment thứ 4 thành Trưởng khoa Điều dưỡng
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 30,
                position_id = 1,
                assignment_type = 'admin',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1 OFFSET 3);
        `;
        console.log('✅ Cập nhật Trưởng khoa Điều dưỡng');

        // 5. Cập nhật assignment thứ 5 thành Giảng viên Khoa Dược
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 29,
                position_id = 5,
                assignment_type = 'academic',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1 OFFSET 4);
        `;
        console.log('✅ Cập nhật Giảng viên Khoa Dược');

        // 6. Cập nhật assignment thứ 6 thành Giảng viên Khoa Điều dưỡng
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 30,
                position_id = 5,
                assignment_type = 'academic',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1 OFFSET 5);
        `;
        console.log('✅ Cập nhật Giảng viên Khoa Điều dưỡng');

        // 7. Cập nhật assignment thứ 7 thành Giảng viên Khoa Dược
        await prisma.$executeRaw`
            UPDATE hr.org_assignment 
            SET 
                org_unit_id = 29,
                position_id = 5,
                assignment_type = 'academic',
                updated_at = NOW()
            WHERE id = (SELECT id FROM hr.org_assignment ORDER BY id LIMIT 1 OFFSET 6);
        `;
        console.log('✅ Cập nhật Giảng viên Khoa Dược');

        // 8. Kiểm tra kết quả
        console.log('\n📋 Kiểm tra kết quả:');
        const results = await prisma.$queryRaw`
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
        `;

        results.forEach(result => {
            console.log(`  - ${result.full_name} -> ${result.org_unit_name} (${result.position_title})`);
        });

        console.log('\n🎉 Hoàn thành! Đã cập nhật assignments cho Trường Y Dược');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateToMedicalSchool();

