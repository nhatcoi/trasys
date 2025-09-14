const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSimplifiedSidebar() {
    try {
        console.log('🧪 Test sidebar đã được đơn giản hóa...\n');

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

            // Test sidebar menu items (đã đơn giản hóa)
            const menuItems = [
                { key: 'dashboard', permission: 'hr.dashboard.view' },
                { key: 'hr-management', permission: 'hr.employees.view' },
                { key: 'rbac', permission: 'hr.roles.view' },
                { key: 'profile', permission: 'hr.profile.view' }
            ];

            console.log(`  📋 Sidebar menu items:`);
            menuItems.forEach(item => {
                const hasPermission = permissions.includes(item.permission);
                console.log(`    ${hasPermission ? '✅' : '❌'} ${item.key}: ${item.permission}`);
            });

            // Test HR Management submenu
            if (permissions.includes('hr.employees.view')) {
                console.log(`  📋 HR Management submenu:`);
                const hrSubmenu = [
                    { key: 'employees', permission: 'hr.employees.view' },
                    { key: 'qualifications', permission: 'hr.qualifications.view' },
                    { key: 'employments', permission: 'hr.employments.view' },
                    { key: 'performance-reviews', permission: 'hr.performance_reviews.view' },
                    { key: 'employee-logs', permission: 'hr.employee_logs.view' }
                ];

                hrSubmenu.forEach(item => {
                    const hasPermission = permissions.includes(item.permission);
                    console.log(`    ${hasPermission ? '✅' : '❌'} ${item.key}: ${item.permission}`);
                });
            }

            // Test RBAC submenu
            if (permissions.includes('hr.roles.view')) {
                console.log(`  📋 RBAC submenu:`);
                const rbacSubmenu = [
                    { key: 'roles', permission: 'hr.roles.view' },
                    { key: 'permissions', permission: 'hr.permissions.view' },
                    { key: 'role-permissions', permission: 'hr.role_permissions.view' },
                    { key: 'user-roles', permission: 'hr.user_roles.view' }
                ];

                rbacSubmenu.forEach(item => {
                    const hasPermission = permissions.includes(item.permission);
                    console.log(`    ${hasPermission ? '✅' : '❌'} ${item.key}: ${item.permission}`);
                });
            }

            console.log('');
        }

        console.log('✅ Test hoàn thành!');
        console.log('\n📋 Sidebar đã được đơn giản hóa:');
        console.log('  ❌ Đã bỏ: Tổng quan Đại học, Cơ cấu Tổ chức, Giảng viên, Báo cáo');
        console.log('  ✅ Còn lại: Dashboard, Quản lý Nhân sự, Phân quyền (Admin), Hồ sơ');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSimplifiedSidebar();
