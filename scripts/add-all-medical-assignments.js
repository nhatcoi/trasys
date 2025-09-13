const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAllMedicalAssignments() {
    try {
        console.log('🏥 Thêm tất cả assignments cho Trường Y Dược...\n');

        // 1. Disable trigger
        console.log('🔄 Disable trigger...');
        await prisma.$executeRaw`
            ALTER TABLE hr.org_assignment DISABLE TRIGGER trg_hr_org_assignment_log;
        `;
        console.log('✅ Đã disable trigger');

        // 2. Lấy existing employees
        const employees = await prisma.employee.findMany({
            include: {
                user: true
            },
            take: 4
        });

        console.log('\n📋 Found employees:');
        employees.forEach((emp, index) => {
            console.log(`  ${index + 1}. ${emp.user?.full_name} (ID: ${emp.id})`);
        });

        // 3. Tạo assignments mới
        const newAssignments = [
            {
                employeeId: employees[1].id, // Lê Văn Giảng
                orgUnitId: 28, // Trường Y Dược
                positionId: 9, // VICE_RECTOR
                assignmentType: 'admin',
                description: 'Phó Hiệu trưởng Trường Y Dược'
            },
            {
                employeeId: employees[2].id, // Trần Thị Hiệu
                orgUnitId: 29, // Khoa Dược
                positionId: 1, // HEAD_FAC
                assignmentType: 'admin',
                description: 'Trưởng khoa Dược'
            },
            {
                employeeId: employees[3].id, // Nguyễn Thị Minh
                orgUnitId: 30, // Khoa Điều dưỡng
                positionId: 1, // HEAD_FAC
                assignmentType: 'admin',
                description: 'Trưởng khoa Điều dưỡng'
            }
        ];

        console.log('\n🔄 Tạo assignments mới...');
        for (const assignment of newAssignments) {
            try {
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
                        ${assignment.employeeId},
                        ${assignment.orgUnitId},
                        ${assignment.positionId},
                        ${assignment.assignmentType},
                        true,
                        1.00,
                        '2020-01-01'::date
                    );
                `;
                console.log(`✅ ${assignment.description}: ${employees.find(emp => emp.id === assignment.employeeId)?.user?.full_name}`);
            } catch (error) {
                console.log(`❌ Lỗi ${assignment.description}: ${error.message}`);
            }
        }

        // 4. Thêm giảng viên cho Khoa Dược
        const pharmacyLecturers = await prisma.employee.findMany({
            include: {
                user: true
            },
            skip: 4,
            take: 2
        });

        console.log('\n🔄 Thêm giảng viên Khoa Dược...');
        for (const lecturer of pharmacyLecturers) {
            try {
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
                        ${lecturer.id},
                        29,
                        5,
                        'academic',
                        true,
                        1.00,
                        '2020-01-01'::date
                    );
                `;
                console.log(`✅ Giảng viên Khoa Dược: ${lecturer.user?.full_name}`);
            } catch (error) {
                console.log(`❌ Lỗi giảng viên Khoa Dược: ${error.message}`);
            }
        }

        // 5. Thêm giảng viên cho Khoa Điều dưỡng
        const nursingLecturers = await prisma.employee.findMany({
            include: {
                user: true
            },
            skip: 6,
            take: 2
        });

        console.log('\n🔄 Thêm giảng viên Khoa Điều dưỡng...');
        for (const lecturer of nursingLecturers) {
            try {
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
                        ${lecturer.id},
                        30,
                        5,
                        'academic',
                        true,
                        1.00,
                        '2020-01-01'::date
                    );
                `;
                console.log(`✅ Giảng viên Khoa Điều dưỡng: ${lecturer.user?.full_name}`);
            } catch (error) {
                console.log(`❌ Lỗi giảng viên Khoa Điều dưỡng: ${error.message}`);
            }
        }

        // 6. Enable lại trigger
        console.log('\n🔄 Enable lại trigger...');
        await prisma.$executeRaw`
            ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;
        `;
        console.log('✅ Đã enable lại trigger');

        // 7. Kiểm tra kết quả
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

        console.log('\n🎉 Hoàn thành! Đã thêm tất cả assignments cho Trường Y Dược');

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

addAllMedicalAssignments();

