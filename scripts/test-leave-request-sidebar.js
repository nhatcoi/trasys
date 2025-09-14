const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLeaveRequestSidebar() {
    try {
        console.log('🧪 Test sidebar permissions cho leave requests...\n');

        const testUsers = ['admin', 'rector', 'dean_ict', 'lecturer_1', 'staff_1', 'student_1'];

        for (const username of testUsers) {
            console.log(`🔍 Test user: ${username}`);

            const user = await prisma.user.findFirst({
                where: { username },
                include: {
                    user_role: {
                        include: {
                            roles: {
                                include: {
                                    role_permission: {
                                        include: {
                                            permissions: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!user) {
                console.log(`  ❌ Không tìm thấy user: ${username}`);
                continue;
            }

            // Lấy permissions
            const permissions = user.user_role.flatMap(ur =>
                ur.roles.role_permission.map(rp => rp.permissions.code)
            );

            console.log(`  👤 User: ${user.full_name}`);
            console.log(`  🎭 Roles: ${user.user_role.map(ur => ur.roles.name).join(', ')}`);

            // Test sidebar menu items cho leave requests
            const leaveRequestMenuItems = [
                { key: 'leave-requests', permission: 'hr.leave_requests.view' },
                { key: 'leave-requests-history', permission: 'hr.leave_requests.history' },
                { key: 'employee-changes-history', permission: 'hr.employee_changes.history' }
            ];

            console.log(`  📋 Leave Request menu items:`);
            leaveRequestMenuItems.forEach(item => {
                const hasPermission = permissions.includes(item.permission);
                console.log(`    ${hasPermission ? '✅' : '❌'} ${item.key}: ${item.permission}`);
            });

            // Test CRUD permissions
            const crudPermissions = [
                { key: 'create', permission: 'hr.leave_requests.create' },
                { key: 'update', permission: 'hr.leave_requests.update' },
                { key: 'delete', permission: 'hr.leave_requests.delete' },
                { key: 'approve', permission: 'hr.leave_requests.approve' }
            ];

            console.log(`  📋 CRUD permissions:`);
            crudPermissions.forEach(item => {
                const hasPermission = permissions.includes(item.permission);
                console.log(`    ${hasPermission ? '✅' : '❌'} ${item.key}: ${item.permission}`);
            });

            console.log('');
        }

        console.log('✅ Test hoàn thành!');
        console.log('\n📋 Tóm tắt sidebar permissions:');
        console.log('  👑 ADMIN: Full quyền (tất cả menu items + CRUD)');
        console.log('  🎓 RECTOR: Xem + duyệt + lịch sử');
        console.log('  👨‍🏫 LECTURER/STAFF/STUDENT: Xem + tạo/sửa/xóa đơn của mình + lịch sử');
        console.log('  📊 Lịch sử sửa đổi: Chỉ ADMIN và RECTOR có quyền xem');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLeaveRequestSidebar();
