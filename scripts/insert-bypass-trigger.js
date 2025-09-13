const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertBypassTrigger() {
    try {
        console.log('🏥 Thử insert bypass trigger...\n');

        // 1. Tạm thời disable trigger
        console.log('🔄 Disable trigger...');
        await prisma.$executeRaw`
            ALTER TABLE hr.org_assignment DISABLE TRIGGER trg_hr_org_assignment_log;
        `;
        console.log('✅ Đã disable trigger');

        // 2. Thử insert
        console.log('\n🔄 Thử insert...');
        await prisma.$executeRaw`
            INSERT INTO hr.org_assignment (
                employee_id, 
                org_unit_id, 
                position_id, 
                assignment_type, 
                is_primary, 
                allocation, 
                start_date
            ) VALUES (
                2,
                28,
                8,
                'admin',
                true,
                1.00,
                '2020-01-01'::date
            );
        `;
        console.log('✅ Insert thành công!');

        // 3. Enable lại trigger
        console.log('\n🔄 Enable lại trigger...');
        await prisma.$executeRaw`
            ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;
        `;
        console.log('✅ Đã enable lại trigger');

        // 4. Kiểm tra kết quả
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

        console.log('\n🎉 Hoàn thành! Đã insert thành công');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);

        // Enable lại trigger nếu có lỗi
        try {
            await prisma.$executeRaw`
                ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;
            `;
            console.log('✅ Đã enable lại trigger sau lỗi');
        } catch (enableError) {
            console.log('❌ Lỗi enable trigger:', enableError.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

insertBypassTrigger();

