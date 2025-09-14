const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addLeaveRequestPermissions() {
    try {
        console.log('🔐 Thêm permissions cho leave requests...\n');

        // Danh sách permissions cần thêm
        const permissions = [
            { code: 'hr.leave_requests.view', name: 'Xem đơn xin nghỉ' },
            { code: 'hr.leave_requests.create', name: 'Tạo đơn xin nghỉ' },
            { code: 'hr.leave_requests.update', name: 'Cập nhật đơn xin nghỉ' },
            { code: 'hr.leave_requests.delete', name: 'Xóa đơn xin nghỉ' },
            { code: 'hr.leave_requests.approve', name: 'Duyệt đơn xin nghỉ' },
            { code: 'hr.leave_requests.history', name: 'Xem lịch sử đơn xin nghỉ' },
            { code: 'hr.employee_changes.history', name: 'Xem lịch sử sửa đổi nhân viên' }
        ];

        // Thêm permissions
        for (const permission of permissions) {
            const existing = await prisma.permissions.findUnique({
                where: { code: permission.code }
            });

            if (!existing) {
                await prisma.permissions.create({
                    data: permission
                });
                console.log(`✅ Đã thêm permission: ${permission.code}`);
            } else {
                console.log(`⚠️  Permission đã tồn tại: ${permission.code}`);
            }
        }

        // Lấy tất cả roles
        const roles = await prisma.roles.findMany();
        console.log(`\n📋 Tìm thấy ${roles.length} roles:`);
        roles.forEach(role => console.log(`  - ${role.name} (${role.code})`));

        // Định nghĩa permissions cho từng role
        const rolePermissions = {
            'ADMIN': [
                'hr.leave_requests.view',
                'hr.leave_requests.create',
                'hr.leave_requests.update',
                'hr.leave_requests.delete',
                'hr.leave_requests.approve',
                'hr.leave_requests.history',
                'hr.employee_changes.history'
            ],
            'RECTOR': [
                'hr.leave_requests.view',
                'hr.leave_requests.approve',
                'hr.leave_requests.history',
                'hr.employee_changes.history'
            ],
            'DEAN': [
                'hr.leave_requests.view',
                'hr.leave_requests.approve',
                'hr.leave_requests.history',
                'hr.employee_changes.history'
            ],
            'HEAD_DEPARTMENT': [
                'hr.leave_requests.view',
                'hr.leave_requests.approve',
                'hr.leave_requests.history',
                'hr.employee_changes.history'
            ],
            'LECTURER': [
                'hr.leave_requests.view',
                'hr.leave_requests.create',
                'hr.leave_requests.update',
                'hr.leave_requests.delete',
                'hr.leave_requests.history'
            ],
            'STAFF': [
                'hr.leave_requests.view',
                'hr.leave_requests.create',
                'hr.leave_requests.update',
                'hr.leave_requests.delete',
                'hr.leave_requests.history'
            ],
            'STUDENT': [
                'hr.leave_requests.view',
                'hr.leave_requests.create',
                'hr.leave_requests.update',
                'hr.leave_requests.delete',
                'hr.leave_requests.history'
            ]
        };

        // Gán permissions cho từng role
        for (const [roleCode, permissionCodes] of Object.entries(rolePermissions)) {
            const role = roles.find(r => r.code === roleCode);
            if (!role) {
                console.log(`⚠️  Không tìm thấy role: ${roleCode}`);
                continue;
            }

            console.log(`\n🎭 Cập nhật permissions cho role: ${role.name}`);

            // Xóa permissions cũ liên quan đến leave requests
            await prisma.role_permission.deleteMany({
                where: {
                    role_id: role.id,
                    permissions: {
                        code: {
                            in: permissionCodes
                        }
                    }
                }
            });

            // Thêm permissions mới
            for (const permissionCode of permissionCodes) {
                const permission = await prisma.permissions.findUnique({
                    where: { code: permissionCode }
                });

                if (permission) {
                    await prisma.role_permission.create({
                        data: {
                            role_id: role.id,
                            permission_id: permission.id
                        }
                    });
                    console.log(`  ✅ Đã gán: ${permissionCode}`);
                } else {
                    console.log(`  ❌ Không tìm thấy permission: ${permissionCode}`);
                }
            }
        }

        console.log('\n✅ Hoàn thành thêm permissions cho leave requests!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addLeaveRequestPermissions();
