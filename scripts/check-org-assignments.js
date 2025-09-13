const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrgAssignments() {
    try {
        console.log('🔍 Kiểm tra org_assignments để xem employees ở vị trí nào...\n');

        // 1. Select tất cả org_assignments với thông tin đầy đủ
        const assignments = await prisma.$queryRaw`
            SELECT 
                oa.id,
                oa.employee_id,
                oa.org_unit_id,
                oa.position_id,
                oa.assignment_type,
                oa.is_primary,
                oa.allocation,
                oa.start_date,
                oa.end_date,
                e.employee_no,
                u.full_name,
                u.username,
                u.email,
                ou.name as org_unit_name,
                ou.code as org_unit_code,
                jp.title as position_title,
                jp.code as position_code,
                jp.job_family
            FROM hr.org_assignment oa
            JOIN hr.employees e ON oa.employee_id = e.id
            JOIN public.users u ON e.user_id = u.id
            JOIN public.org_units ou ON oa.org_unit_id = ou.id
            LEFT JOIN hr.job_positions jp ON oa.position_id = jp.id
            ORDER BY oa.id;
        `;

        console.log('📋 Tất cả org_assignments:');
        console.log('='.repeat(120));
        assignments.forEach((assignment, index) => {
            console.log(`${index + 1}. ${assignment.full_name} (${assignment.username})`);
            console.log(`   - Employee ID: ${assignment.employee_id}`);
            console.log(`   - Employee No: ${assignment.employee_no}`);
            console.log(`   - Email: ${assignment.email}`);
            console.log(`   - Org Unit: ${assignment.org_unit_name} (${assignment.org_unit_code}) - ID: ${assignment.org_unit_id}`);
            console.log(`   - Position: ${assignment.position_title || 'No position'} (${assignment.position_code || 'No code'}) - ID: ${assignment.position_id}`);
            console.log(`   - Job Family: ${assignment.job_family || 'No family'}`);
            console.log(`   - Assignment Type: ${assignment.assignment_type}`);
            console.log(`   - Is Primary: ${assignment.is_primary}`);
            console.log(`   - Allocation: ${assignment.allocation}`);
            console.log(`   - Start Date: ${assignment.start_date}`);
            console.log(`   - End Date: ${assignment.end_date || 'No end date'}`);
            console.log('-'.repeat(120));
        });

        // 2. Thống kê theo org_unit
        console.log('\n📊 Thống kê theo org_unit:');
        const orgStats = await prisma.$queryRaw`
            SELECT 
                ou.name as org_unit_name,
                ou.code as org_unit_code,
                COUNT(*) as employee_count,
                STRING_AGG(DISTINCT jp.title, ', ') as positions
            FROM hr.org_assignment oa
            JOIN public.org_units ou ON oa.org_unit_id = ou.id
            LEFT JOIN hr.job_positions jp ON oa.position_id = jp.id
            GROUP BY ou.id, ou.name, ou.code
            ORDER BY employee_count DESC;
        `;

        orgStats.forEach(stat => {
            console.log(`  - ${stat.org_unit_name} (${stat.org_unit_code}): ${stat.employee_count} employees`);
            console.log(`    Positions: ${stat.positions || 'No positions'}`);
        });

        // 3. Thống kê theo position
        console.log('\n📊 Thống kê theo position:');
        const positionStats = await prisma.$queryRaw`
            SELECT 
                jp.title as position_title,
                jp.code as position_code,
                jp.job_family,
                COUNT(*) as employee_count,
                STRING_AGG(DISTINCT ou.name, ', ') as org_units
            FROM hr.org_assignment oa
            LEFT JOIN hr.job_positions jp ON oa.position_id = jp.id
            JOIN public.org_units ou ON oa.org_unit_id = ou.id
            GROUP BY jp.id, jp.title, jp.code, jp.job_family
            ORDER BY employee_count DESC;
        `;

        positionStats.forEach(stat => {
            console.log(`  - ${stat.position_title || 'No position'} (${stat.position_code || 'No code'}): ${stat.employee_count} employees`);
            console.log(`    Job Family: ${stat.job_family || 'No family'}`);
            console.log(`    Org Units: ${stat.org_units || 'No org units'}`);
        });

        // 4. Kiểm tra Trường Y Dược
        console.log('\n🏥 Kiểm tra Trường Y Dược (ID: 28, 29, 30):');
        const medicalAssignments = await prisma.$queryRaw`
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

        if (medicalAssignments.length > 0) {
            medicalAssignments.forEach(assignment => {
                console.log(`  - ${assignment.full_name} -> ${assignment.org_unit_name} (${assignment.position_title || 'No position'})`);
            });
        } else {
            console.log('  ❌ Không có employees nào trong Trường Y Dược');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkOrgAssignments();

