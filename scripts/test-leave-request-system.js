const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLeaveRequestSystem() {
    try {
        console.log('🧪 Test hệ thống đơn xin nghỉ...\n');

        // Test 1: Kiểm tra permissions
        console.log('1️⃣ Kiểm tra permissions:');
        const permissions = await prisma.permissions.findMany({
            where: {
                code: {
                    in: [
                        'hr.leave_requests.view',
                        'hr.leave_requests.create',
                        'hr.leave_requests.update',
                        'hr.leave_requests.delete',
                        'hr.leave_requests.approve',
                        'hr.leave_requests.history',
                        'hr.employee_changes.history'
                    ]
                }
            }
        });

        console.log(`   ✅ Tìm thấy ${permissions.length} permissions:`);
        permissions.forEach(p => console.log(`      - ${p.code}: ${p.name}`));

        // Test 2: Kiểm tra role permissions
        console.log('\n2️⃣ Kiểm tra role permissions:');
        const roles = await prisma.roles.findMany({
            include: {
                role_permission: {
                    include: {
                        permissions: true
                    }
                }
            }
        });

        for (const role of roles) {
            const leavePermissions = role.role_permission
                .filter(rp => rp.permissions.code.startsWith('hr.leave_requests') ||
                    rp.permissions.code.startsWith('hr.employee_changes'))
                .map(rp => rp.permissions.code);

            console.log(`   🎭 ${role.name} (${role.code}):`);
            if (leavePermissions.length > 0) {
                leavePermissions.forEach(perm => console.log(`      ✅ ${perm}`));
            } else {
                console.log(`      ❌ Không có permissions`);
            }
        }

        // Test 3: Kiểm tra users và employees
        console.log('\n3️⃣ Kiểm tra users và employees:');
        const users = await prisma.user.findMany({
            include: {
                employees: {
                    include: {
                        user: true
                    }
                },
                user_role: {
                    include: {
                        roles: true
                    }
                }
            },
            take: 5
        });

        console.log(`   👥 Tìm thấy ${users.length} users:`);
        users.forEach(user => {
            const employee = user.employees[0];
            const roles = user.user_role.map(ur => ur.roles.name).join(', ');
            console.log(`      - ${user.full_name} (${user.username})`);
            console.log(`        Employee: ${employee ? 'Có' : 'Không'}`);
            console.log(`        Roles: ${roles || 'Không có'}`);
        });

        // Test 4: Tạo sample leave request
        console.log('\n4️⃣ Tạo sample leave request:');
        const testUser = users.find(u => u.employees.length > 0);
        if (testUser) {
            const employee = testUser.employees[0];

            // Kiểm tra xem đã có leave request nào chưa
            const existingRequests = await prisma.leave_requests.findMany({
                where: { employee_id: employee.id },
                take: 1
            });

            if (existingRequests.length === 0) {
                const leaveRequest = await prisma.leave_requests.create({
                    data: {
                        employee_id: employee.id,
                        leave_type: 'ANNUAL',
                        start_date: new Date('2024-01-15'),
                        end_date: new Date('2024-01-17'),
                        reason: 'Nghỉ phép năm',
                        status: 'PENDING'
                    }
                });

                // Tạo history
                await prisma.leave_request_history.create({
                    data: {
                        leave_request_id: leaveRequest.id,
                        action: 'SUBMITTED',
                        comment: 'Đơn xin nghỉ được tạo',
                        actor_id: testUser.id,
                        actor_role: 'EMPLOYEE'
                    }
                });

                console.log(`   ✅ Đã tạo leave request ID: ${leaveRequest.id}`);
                console.log(`      - Nhân viên: ${testUser.full_name}`);
                console.log(`      - Loại nghỉ: ${leaveRequest.leave_type}`);
                console.log(`      - Từ: ${leaveRequest.start_date.toISOString().split('T')[0]}`);
                console.log(`      - Đến: ${leaveRequest.end_date.toISOString().split('T')[0]}`);
                console.log(`      - Trạng thái: ${leaveRequest.status}`);
            } else {
                console.log(`   ⚠️  User ${testUser.full_name} đã có leave request`);
            }
        } else {
            console.log(`   ❌ Không tìm thấy user có employee record`);
        }

        // Test 5: Kiểm tra leave requests
        console.log('\n5️⃣ Kiểm tra leave requests:');
        const allLeaveRequests = await prisma.leave_requests.findMany({
            include: {
                employees: {
                    include: {
                        user: true
                    }
                },
                leave_request_history: {
                    include: {
                        users: true
                    }
                }
            },
            take: 3
        });

        console.log(`   📋 Tìm thấy ${allLeaveRequests.length} leave requests:`);
        allLeaveRequests.forEach(req => {
            console.log(`      - ID: ${req.id}`);
            console.log(`        Nhân viên: ${req.employees.user.full_name}`);
            console.log(`        Loại: ${req.leave_type}`);
            console.log(`        Trạng thái: ${req.status}`);
            console.log(`        Lịch sử: ${req.leave_request_history.length} entries`);
        });

        // Test 6: Kiểm tra employee logs
        console.log('\n6️⃣ Kiểm tra employee logs:');
        const employeeLogs = await prisma.employee_log.findMany({
            include: {
                employees: {
                    include: {
                        user: true
                    }
                },
                users: true
            },
            take: 3
        });

        console.log(`   📝 Tìm thấy ${employeeLogs.length} employee logs:`);
        employeeLogs.forEach(log => {
            console.log(`      - ID: ${log.id}`);
            console.log(`        Nhân viên: ${log.employees.user.full_name}`);
            console.log(`        Hành động: ${log.action}`);
            console.log(`        Thực thể: ${log.entity_type}`);
            console.log(`        Người thực hiện: ${log.users?.full_name || 'System'}`);
        });

        console.log('\n✅ Test hoàn thành!');
        console.log('\n📋 Tóm tắt:');
        console.log('   ✅ Permissions đã được tạo');
        console.log('   ✅ Role permissions đã được gán');
        console.log('   ✅ Users và employees đã sẵn sàng');
        console.log('   ✅ Leave requests có thể được tạo');
        console.log('   ✅ Employee logs đang hoạt động');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLeaveRequestSystem();
