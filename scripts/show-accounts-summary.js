const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showAccountsSummary() {
    try {
        console.log('📊 TÓM TẮT ACCOUNTS THEO ROLE\n');

        // Lấy danh sách roles
        const roles = await prisma.roles.findMany({
            orderBy: { code: 'asc' }
        });

        let totalUsers = 0;
        let totalEmployees = 0;

        for (const role of roles) {
            console.log(`\n🔹 ROLE: ${role.code} - ${role.name}`);
            console.log('='.repeat(50));

            // Lấy users có role này
            const userRoles = await prisma.user_role.findMany({
                where: { role_id: role.id },
                include: {
                    users: {
                        include: {
                            employees: true
                        }
                    }
                }
            });

            console.log(`📋 Tổng số users: ${userRoles.length}`);

            if (userRoles.length > 0) {
                console.log('\n👥 Danh sách users:');
                userRoles.forEach((userRole, index) => {
                    const user = userRole.users;
                    const employee = user.employees[0];

                    console.log(`\n${index + 1}. ${user.full_name}`);
                    console.log(`   👤 Username: ${user.username}`);
                    console.log(`   📧 Email: ${user.email || 'N/A'}`);
                    console.log(`   📱 Phone: ${user.phone || 'N/A'}`);
                    console.log(`   🏠 Address: ${user.address || 'N/A'}`);
                    console.log(`   📅 DOB: ${user.dob ? user.dob.toLocaleDateString('vi-VN') : 'N/A'}`);
                    console.log(`   ⚧ Gender: ${user.gender || 'N/A'}`);
                    console.log(`   📊 Status: ${user.status}`);

                    if (employee) {
                        console.log(`   🏢 Employee ID: ${employee.id}`);
                        console.log(`   💼 Employee No: ${employee.employee_no}`);
                        console.log(`   📋 Employment Type: ${employee.employment_type}`);
                        console.log(`   📅 Hired At: ${employee.hired_at ? employee.hired_at.toLocaleDateString('vi-VN') : 'N/A'}`);
                        console.log(`   📊 Employee Status: ${employee.status}`);
                        totalEmployees++;
                    } else {
                        console.log(`   🏢 Employee: Chưa có employee record`);
                    }
                });
            }

            totalUsers += userRoles.length;
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 TỔNG KẾT:');
        console.log(`👥 Tổng số users: ${totalUsers}`);
        console.log(`🏢 Tổng số employees: ${totalEmployees}`);
        console.log(`📋 Tổng số roles: ${roles.length}`);

        // Hiển thị thống kê theo employment type
        console.log('\n📊 THỐNG KÊ THEO EMPLOYMENT TYPE:');
        const employmentStats = await prisma.employee.groupBy({
            by: ['employment_type'],
            _count: {
                employment_type: true
            }
        });

        employmentStats.forEach(stat => {
            console.log(`- ${stat.employment_type}: ${stat._count.employment_type} employees`);
        });

        // Hiển thị thống kê theo status
        console.log('\n📊 THỐNG KÊ THEO STATUS:');
        const statusStats = await prisma.employee.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });

        statusStats.forEach(stat => {
            console.log(`- ${stat.status}: ${stat._count.status} employees`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script
showAccountsSummary();
