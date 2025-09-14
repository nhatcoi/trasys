const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function importSimpleData() {
    try {
        console.log('🚀 Bắt đầu import data đơn giản...\n');

        // 1. Tạo Users với roles
        console.log('👥 Tạo users...');

        const users = [
            { username: 'admin', full_name: 'Admin System', email: 'admin@phenikaa.edu.vn', role: 'ADMIN' },
            { username: 'rector', full_name: 'GS.TS. Nguyễn Văn Hiệu trưởng', email: 'rector@phenikaa.edu.vn', role: 'RECTOR' },
            { username: 'dean_ict', full_name: 'PGS.TS. Trần Văn Trưởng ICT', email: 'dean.ict@phenikaa.edu.vn', role: 'DEAN' },
            { username: 'dean_se', full_name: 'TS. Lê Thị Trưởng SE', email: 'dean.se@phenikaa.edu.vn', role: 'DEAN' },
            { username: 'lecturer_1', full_name: 'TS. Nguyễn Văn Giảng viên 1', email: 'lecturer1@phenikaa.edu.vn', role: 'LECTURER' },
            { username: 'lecturer_2', full_name: 'THS. Trần Thị Giảng viên 2', email: 'lecturer2@phenikaa.edu.vn', role: 'LECTURER' },
            { username: 'staff_1', full_name: 'Nguyễn Văn Nhân viên 1', email: 'staff1@phenikaa.edu.vn', role: 'STAFF' },
            { username: 'student_1', full_name: 'Lê Văn Sinh viên 1', email: 'student1@phenikaa.edu.vn', role: 'STUDENT' },
        ];

        const createdUsers = {};

        for (const userData of users) {
            // Tạo user
            const hashedPassword = await bcrypt.hash('123456', 10);

            const user = await prisma.user.upsert({
                where: { username: userData.username },
                update: {
                    full_name: userData.full_name,
                    email: userData.email,
                    password_hash: hashedPassword
                },
                create: {
                    username: userData.username,
                    full_name: userData.full_name,
                    email: userData.email,
                    password_hash: hashedPassword,
                    status: 'ACTIVE'
                }
            });

            createdUsers[userData.username] = user;
            console.log(`  ✅ User: ${userData.full_name} (${userData.username})`);

            // Tạo employee cho users có role khác STUDENT
            if (userData.role !== 'STUDENT') {
                let employee = await prisma.employee.findFirst({
                    where: { user_id: user.id }
                });

                if (!employee) {
                    employee = await prisma.employee.create({
                        data: {
                            user_id: user.id,
                            employee_no: `EMP${user.id.toString().padStart(4, '0')}`,
                            employment_type: userData.role.includes('LECTURER') ? 'lecturer' : 'staff',
                            status: 'ACTIVE',
                            hired_at: new Date()
                        }
                    });
                    console.log(`    👤 Created employee: ${employee.employee_no}`);
                }
            }
        }

        // 2. Assign roles to users
        console.log('\n🎭 Assign roles to users...');

        const roleAssignments = [
            { username: 'admin', role: 'ADMIN' },
            { username: 'rector', role: 'RECTOR' },
            { username: 'dean_ict', role: 'DEAN' },
            { username: 'dean_se', role: 'DEAN' },
            { username: 'lecturer_1', role: 'LECTURER' },
            { username: 'lecturer_2', role: 'LECTURER' },
            { username: 'staff_1', role: 'STAFF' },
            { username: 'student_1', role: 'STUDENT' },
        ];

        for (const assignment of roleAssignments) {
            const user = createdUsers[assignment.username];
            const role = await prisma.roles.findFirst({
                where: { code: assignment.role }
            });

            if (user && role) {
                await prisma.user_role.upsert({
                    where: {
                        user_id_role_id: {
                            user_id: user.id,
                            role_id: role.id
                        }
                    },
                    update: {},
                    create: {
                        user_id: user.id,
                        role_id: role.id
                    }
                });

                console.log(`  ✅ ${user.full_name} → ${role.name}`);
            }
        }

        console.log('\n🎉 Hoàn thành import data đơn giản!');
        console.log('\n🔑 Test accounts:');
        console.log('  👑 Admin: admin / 123456');
        console.log('  🎓 Rector: rector / 123456');
        console.log('  🏫 Dean ICT: dean_ict / 123456');
        console.log('  🏫 Dean SE: dean_se / 123456');
        console.log('  👨‍🏫 Lecturer 1: lecturer_1 / 123456');
        console.log('  👨‍🏫 Lecturer 2: lecturer_2 / 123456');
        console.log('  👨‍💼 Staff: staff_1 / 123456');
        console.log('  🎓 Student: student_1 / 123456');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importSimpleData();
