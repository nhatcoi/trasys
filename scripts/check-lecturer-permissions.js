const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLecturerPermissions() {
    try {
        const lecturer = await prisma.user.findFirst({
            where: { username: 'lecturer_1' },
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

        if (lecturer) {
            const permissions = lecturer.user_role.flatMap(ur =>
                ur.roles.role_permission.map(rp => rp.permissions.code)
            );

            console.log('LECTURER permissions:');
            permissions.forEach(permission => {
                console.log(`  ✅ ${permission}`);
            });

            console.log('\n🔍 Kiểm tra quyền sửa:');
            const canCreate = permissions.includes('hr.employees.create');
            const canUpdate = permissions.includes('hr.employees.update');
            const canDelete = permissions.includes('hr.employees.delete');

            console.log(`  hr.employees.create: ${canCreate ? '❌ CÓ' : '✅ KHÔNG'}`);
            console.log(`  hr.employees.update: ${canUpdate ? '❌ CÓ' : '✅ KHÔNG'}`);
            console.log(`  hr.employees.delete: ${canDelete ? '❌ CÓ' : '✅ KHÔNG'}`);

            if (!canCreate && !canUpdate && !canDelete) {
                console.log('\n✅ ĐÚNG: Giảng viên không có quyền sửa trong quản lý nhân sự!');
            } else {
                console.log('\n❌ SAI: Giảng viên vẫn có quyền sửa!');
            }
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

checkLecturerPermissions();
