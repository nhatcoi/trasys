const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNewAssignments() {
    try {
        console.log('🏥 Tạo assignments mới cho Trường Y Dược...\n');

        // 1. Lấy existing employees
        const employees = await prisma.employee.findMany({
            include: {
                user: true
            },
            take: 4
        });

        console.log('📋 Found employees:');
        employees.forEach((emp, index) => {
            console.log(`  ${index + 1}. ${emp.user?.full_name} (ID: ${emp.id})`);
        });

        // 2. Tạo assignments mới cho Trường Y Dược
        const newAssignments = [
            {
                employeeId: employees[0].id,
                orgUnitId: BigInt(28), // Trường Y Dược
                positionId: BigInt(8), // RECTOR
                assignmentType: 'admin',
                description: 'Hiệu trưởng Trường Y Dược'
            },
            {
                employeeId: employees[1].id,
                orgUnitId: BigInt(28), // Trường Y Dược
                positionId: BigInt(9), // VICE_RECTOR
                assignmentType: 'admin',
                description: 'Phó Hiệu trưởng Trường Y Dược'
            },
            {
                employeeId: employees[2].id,
                orgUnitId: BigInt(29), // Khoa Dược
                positionId: BigInt(1), // HEAD_FAC
                assignmentType: 'admin',
                description: 'Trưởng khoa Dược'
            },
            {
                employeeId: employees[3].id,
                orgUnitId: BigInt(30), // Khoa Điều dưỡng
                positionId: BigInt(1), // HEAD_FAC
                assignmentType: 'admin',
                description: 'Trưởng khoa Điều dưỡng'
            }
        ];

        console.log('\n🔄 Tạo assignments mới...');
        for (const assignment of newAssignments) {
            try {
                await prisma.orgAssignment.create({
                    data: {
                        employee_id: assignment.employeeId,
                        org_unit_id: assignment.orgUnitId,
                        position_id: assignment.positionId,
                        assignment_type: assignment.assignmentType,
                        is_primary: true,
                        allocation: 1.0,
                        start_date: new Date('2020-01-01')
                    }
                });
                console.log(`✅ ${assignment.description}: ${employees.find(emp => emp.id === assignment.employeeId)?.user?.full_name}`);
            } catch (error) {
                console.log(`❌ Lỗi ${assignment.description}: ${error.message}`);
            }
        }

        // 3. Thêm giảng viên cho Khoa Dược
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
                await prisma.orgAssignment.create({
                    data: {
                        employee_id: lecturer.id,
                        org_unit_id: BigInt(29), // Khoa Dược
                        position_id: BigInt(5), // LECTURER
                        assignment_type: 'academic',
                        is_primary: true,
                        allocation: 1.0,
                        start_date: new Date('2020-01-01')
                    }
                });
                console.log(`✅ Giảng viên Khoa Dược: ${lecturer.user?.full_name}`);
            } catch (error) {
                console.log(`❌ Lỗi giảng viên Khoa Dược: ${error.message}`);
            }
        }

        // 4. Thêm giảng viên cho Khoa Điều dưỡng
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
                await prisma.orgAssignment.create({
                    data: {
                        employee_id: lecturer.id,
                        org_unit_id: BigInt(30), // Khoa Điều dưỡng
                        position_id: BigInt(5), // LECTURER
                        assignment_type: 'academic',
                        is_primary: true,
                        allocation: 1.0,
                        start_date: new Date('2020-01-01')
                    }
                });
                console.log(`✅ Giảng viên Khoa Điều dưỡng: ${lecturer.user?.full_name}`);
            } catch (error) {
                console.log(`❌ Lỗi giảng viên Khoa Điều dưỡng: ${error.message}`);
            }
        }

        // 5. Kiểm tra kết quả
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

        console.log('\n🎉 Hoàn thành! Đã tạo assignments mới cho Trường Y Dược');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createNewAssignments();

