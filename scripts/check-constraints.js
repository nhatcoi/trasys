const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConstraints() {
    try {
        console.log('🔍 Kiểm tra constraints và dữ liệu hiện tại...\n');

        // 1. Kiểm tra existing assignments
        const existingAssignments = await prisma.orgAssignment.findMany({
            include: {
                employee: {
                    include: {
                        user: true
                    }
                },
                org_unit: true,
                position: true
            }
        });

        console.log('📋 Existing assignments:');
        existingAssignments.forEach((assignment, index) => {
            console.log(`  ${index + 1}. ${assignment.employee.user?.full_name} -> ${assignment.org_unit.name} (${assignment.position?.title || 'No position'})`);
        });

        // 2. Thử cập nhật assignment đầu tiên với approach đơn giản
        console.log('\n🔄 Thử cập nhật assignment đầu tiên...');
        try {
            const firstAssignment = existingAssignments[0];
            if (firstAssignment) {
                await prisma.orgAssignment.update({
                    where: {
                        id: firstAssignment.id
                    },
                    data: {
                        org_unit_id: BigInt(28), // Trường Y Dược
                        position_id: BigInt(8),  // RECTOR
                        assignment_type: 'admin'
                    }
                });
                console.log('✅ Cập nhật thành công assignment đầu tiên');
            }
        } catch (error) {
            console.log('❌ Lỗi cập nhật assignment đầu tiên:', error.message);
        }

        // 3. Kiểm tra kết quả
        console.log('\n📋 Kiểm tra kết quả sau khi cập nhật:');
        const updatedAssignments = await prisma.orgAssignment.findMany({
            include: {
                employee: {
                    include: {
                        user: true
                    }
                },
                org_unit: true,
                position: true
            }
        });

        updatedAssignments.forEach((assignment, index) => {
            console.log(`  ${index + 1}. ${assignment.employee.user?.full_name} -> ${assignment.org_unit.name} (${assignment.position?.title || 'No position'})`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkConstraints();

