const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping roles to employment types
const roleToEmploymentType = {
    ADMIN: 'staff',
    HEAD_FACULTY: 'lecturer',
    LECTURER: 'lecturer',
    STAFF: 'staff',
    STUDENT: 'adjunct' // Students might be adjunct employees
};

// Employment types for different roles
const employmentTypes = {
    ADMIN: 'ADMINISTRATIVE',
    HEAD_FACULTY: 'ACADEMIC',
    LECTURER: 'ACADEMIC',
    STAFF: 'ADMINISTRATIVE',
    STUDENT: 'STUDENT_WORKER'
};

async function createEmployeesForAccounts() {
    try {
        console.log('🚀 Bắt đầu tạo employee records cho accounts...\n');

        // Lấy danh sách roles
        const roles = await prisma.roles.findMany();
        console.log('📋 Danh sách roles:');
        roles.forEach(role => console.log(`- ${role.code}: ${role.name}`));
        console.log('');

        let totalCreated = 0;

        for (const role of roles) {
            if (role.code === 'STUDENT') {
                console.log(`\n🔹 Bỏ qua role STUDENT (không cần tạo employee record)`);
                continue;
            }

            console.log(`\n🔹 Xử lý role: ${role.code}`);

            // Lấy tất cả users có role này
            const userRoles = await prisma.user_role.findMany({
                where: { role_id: role.id },
                include: {
                    users: true
                }
            });

            console.log(`📊 Tìm thấy ${userRoles.length} users với role ${role.code}`);

            for (const userRole of userRoles) {
                const user = userRole.users;

                try {
                    // Kiểm tra đã có employee record chưa
                    const existingEmployee = await prisma.employee.findFirst({
                        where: { user_id: user.id }
                    });

                    if (existingEmployee) {
                        console.log(`⚠️  User ${user.username} đã có employee record, bỏ qua...`);
                        continue;
                    }

                    // Tạo employee record
                    const employee = await prisma.employee.create({
                        data: {
                            user_id: user.id,
                            employee_no: generateEmployeeNo(role.code, user.id),
                            employment_type: roleToEmploymentType[role.code] || 'FULL_TIME',
                            status: 'ACTIVE',
                            hired_at: new Date(),
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });

                    console.log(`✅ Đã tạo employee record: ${user.username} (${user.full_name}) - Employee ID: ${employee.id}`);
                    totalCreated++;

                } catch (error) {
                    console.log(`❌ Lỗi khi tạo employee cho ${user.username}:`, error.message);
                }
            }
        }

        console.log(`\n🎉 Hoàn thành! Đã tạo ${totalCreated} employee records mới.`);

        // Hiển thị thống kê
        console.log('\n📊 Thống kê employees:');
        const totalEmployees = await prisma.employee.count();
        const activeEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' }
        });
        console.log(`- Tổng số employees: ${totalEmployees}`);
        console.log(`- Active employees: ${activeEmployees}`);

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

function generateEmployeeNo(roleCode, userId) {
    const prefix = {
        ADMIN: 'ADM',
        HEAD_FACULTY: 'HK',
        LECTURER: 'GV',
        STAFF: 'NV'
    }[roleCode] || 'EMP';

    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${userId.toString().padStart(3, '0')}${timestamp}`;
}

// Chạy script
createEmployeesForAccounts();
