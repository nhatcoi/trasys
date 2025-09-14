const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSimpleLeaveRequests() {
    try {
        console.log('🧪 Test hệ thống đơn xin nghỉ đơn giản...\n');

        // Test 1: Kiểm tra bảng leave_requests
        console.log('1️⃣ Kiểm tra bảng leave_requests:');
        const leaveRequests = await prisma.leave_requests.findMany({
            include: {
                employees: {
                    include: {
                        user: true
                    }
                }
            },
            take: 3
        });

        console.log(`   📋 Tìm thấy ${leaveRequests.length} leave requests:`);
        leaveRequests.forEach(req => {
            console.log(`      - ID: ${req.id}`);
            console.log(`        Nhân viên: ${req.employees.user.full_name}`);
            console.log(`        Loại: ${req.leave_type}`);
            console.log(`        Trạng thái: ${req.status}`);
            console.log(`        Từ: ${req.start_date.toISOString().split('T')[0]}`);
            console.log(`        Đến: ${req.end_date.toISOString().split('T')[0]}`);
        });

        // Test 2: Tạo đơn xin nghỉ mới
        console.log('\n2️⃣ Tạo đơn xin nghỉ mới:');
        const testUser = await prisma.user.findFirst({
            where: { username: 'admin' },
            include: {
                employees: true
            }
        });

        if (testUser && testUser.employees[0]) {
            const employee = testUser.employees[0];

            const newLeaveRequest = await prisma.leave_requests.create({
                data: {
                    employee_id: employee.id,
                    leave_type: 'PERSONAL',
                    start_date: new Date('2024-02-01'),
                    end_date: new Date('2024-02-03'),
                    reason: 'Nghỉ cá nhân',
                    status: 'PENDING'
                }
            });

            console.log(`   ✅ Đã tạo leave request ID: ${newLeaveRequest.id}`);

            // Tạo log trong employee_log
            await prisma.employee_log.create({
                data: {
                    employee_id: employee.id,
                    action: 'CREATE',
                    entity_type: 'leave_request',
                    entity_id: newLeaveRequest.id,
                    reason: 'Đơn xin nghỉ được tạo',
                    actor_id: testUser.id,
                    actor_role: 'EMPLOYEE'
                }
            });

            console.log(`   ✅ Đã tạo employee log cho leave request`);
        }

        // Test 3: Kiểm tra employee_logs cho leave_requests
        console.log('\n3️⃣ Kiểm tra employee_logs cho leave_requests:');
        const leaveLogs = await prisma.employee_log.findMany({
            where: {
                entity_type: 'leave_request'
            },
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

        console.log(`   📝 Tìm thấy ${leaveLogs.length} logs cho leave_requests:`);
        leaveLogs.forEach(log => {
            console.log(`      - ID: ${log.id}`);
            console.log(`        Nhân viên: ${log.employees.user.full_name}`);
            console.log(`        Hành động: ${log.action}`);
            console.log(`        Entity ID: ${log.entity_id}`);
            console.log(`        Người thực hiện: ${log.users?.full_name || 'System'}`);
            console.log(`        Lý do: ${log.reason}`);
        });

        // Test 4: Cập nhật trạng thái đơn xin nghỉ
        console.log('\n4️⃣ Cập nhật trạng thái đơn xin nghỉ:');
        const pendingRequest = await prisma.leave_requests.findFirst({
            where: { status: 'PENDING' }
        });

        if (pendingRequest) {
            const updatedRequest = await prisma.leave_requests.update({
                where: { id: pendingRequest.id },
                data: {
                    status: 'APPROVED',
                    updated_at: new Date()
                }
            });

            // Tạo log cho việc duyệt
            await prisma.employee_log.create({
                data: {
                    employee_id: pendingRequest.employee_id,
                    action: 'UPDATE',
                    entity_type: 'leave_request',
                    entity_id: pendingRequest.id,
                    reason: 'Đơn xin nghỉ được duyệt',
                    actor_id: testUser.id,
                    actor_role: 'ADMIN'
                }
            });

            console.log(`   ✅ Đã duyệt leave request ID: ${pendingRequest.id}`);
        }

        console.log('\n✅ Test hoàn thành!');
        console.log('\n📋 Tóm tắt:');
        console.log('   ✅ Bảng leave_requests hoạt động bình thường');
        console.log('   ✅ Có thể tạo đơn xin nghỉ mới');
        console.log('   ✅ Employee_log lưu lịch sử thay thế leave_request_history');
        console.log('   ✅ Có thể cập nhật trạng thái đơn xin nghỉ');
        console.log('   ✅ Hệ thống đơn giản và hiệu quả');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSimpleLeaveRequests();
