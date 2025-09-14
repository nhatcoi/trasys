const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRealisticPermissions() {
    try {
        console.log('🔧 Sửa permissions cho phù hợp với thực tế hệ thống đại học...\n');

        // Định nghĩa permissions thực tế cho từng role
        const realisticRolePermissions = {
            // ADMIN - Quản trị viên hệ thống (IT Admin)
            'ADMIN': [
                'hr.dashboard.view',
                'hr.roles.view', 'hr.roles.create', 'hr.roles.update', 'hr.roles.delete',
                'hr.permissions.view', 'hr.permissions.create', 'hr.permissions.update', 'hr.permissions.delete',
                'hr.role_permissions.view', 'hr.role_permissions.create', 'hr.role_permissions.delete',
                'hr.user_roles.view', 'hr.user_roles.create', 'hr.user_roles.delete',
                'hr.employee_logs.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // RECTOR - Hiệu trưởng (University level management)
            'RECTOR': [
                'hr.dashboard.view', 'hr.university_overview.view', 'hr.reports.view',
                'hr.employees.view', 'hr.employees.create', 'hr.employees.update',
                'hr.performance_reviews.view', 'hr.performance_reviews.create',
                'hr.academic_titles.view', 'hr.employee_academic_titles.view', 'hr.employee_academic_titles.create',
                'hr.trainings.view', 'hr.employee_trainings.view', 'hr.employee_trainings.create',
                'hr.qualifications.view', 'hr.employee_qualifications.view', 'hr.employee_qualifications.create',
                'hr.employments.view', 'hr.employments.create', 'hr.employments.update',
                'hr.org_structure.view', 'hr.faculty.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // HEAD_FACULTY - Trưởng khoa (Faculty level management)
            'HEAD_FACULTY': [
                'hr.dashboard.view', 'hr.faculty.view', 'hr.reports.view',
                'hr.employees.view', 'hr.employees.create', 'hr.employees.update',
                'hr.performance_reviews.view', 'hr.performance_reviews.create',
                'hr.academic_titles.view', 'hr.employee_academic_titles.view', 'hr.employee_academic_titles.create',
                'hr.trainings.view', 'hr.employee_trainings.view', 'hr.employee_trainings.create',
                'hr.qualifications.view', 'hr.employee_qualifications.view', 'hr.employee_qualifications.create',
                'hr.employments.view', 'hr.employments.create', 'hr.employments.update',
                'hr.org_structure.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // LECTURER - Giảng viên (Academic staff - chỉ xem và cập nhật thông tin cá nhân)
            'LECTURER': [
                'hr.dashboard.view',
                'hr.employees.view', // Chỉ xem thông tin đồng nghiệp
                'hr.performance_reviews.view', // Xem đánh giá của mình
                'hr.academic_titles.view', 'hr.employee_academic_titles.view',
                'hr.trainings.view', 'hr.employee_trainings.view',
                'hr.qualifications.view', 'hr.employee_qualifications.view',
                'hr.employments.view', // Xem hợp đồng của mình
                'hr.faculty.view', // Xem thông tin khoa
                'hr.profile.view', 'hr.profile.update' // Chỉ sửa thông tin cá nhân
            ],

            // STAFF - Nhân viên hành chính (Administrative staff)
            'STAFF': [
                'hr.dashboard.view',
                'hr.employees.view', // Xem thông tin nhân viên
                'hr.qualifications.view', 'hr.employee_qualifications.view',
                'hr.employments.view', // Xem hợp đồng
                'hr.profile.view', 'hr.profile.update' // Chỉ sửa thông tin cá nhân
            ],

            // STUDENT - Sinh viên (Chỉ xem thông tin cá nhân)
            'STUDENT': [
                'hr.dashboard.view',
                'hr.profile.view', 'hr.profile.update' // Chỉ xem và sửa thông tin cá nhân
            ]
        };

        // Cập nhật permissions cho từng role
        for (const [roleCode, permissions] of Object.entries(realisticRolePermissions)) {
            console.log(`\n🔄 Cập nhật permissions cho role: ${roleCode}`);

            const role = await prisma.roles.findFirst({
                where: { code: roleCode }
            });

            if (!role) {
                console.log(`  ❌ Không tìm thấy role: ${roleCode}`);
                continue;
            }

            // Xóa tất cả permissions cũ của role
            await prisma.role_permission.deleteMany({
                where: { role_id: role.id }
            });
            console.log(`  🗑️  Xóa permissions cũ`);

            // Thêm permissions mới
            for (const permissionCode of permissions) {
                const permission = await prisma.permissions.findFirst({
                    where: { code: permissionCode }
                });

                if (permission) {
                    await prisma.role_permission.create({
                        data: {
                            role_id: role.id,
                            permission_id: permission.id
                        }
                    });
                    console.log(`  ✅ Thêm permission: ${permissionCode}`);
                } else {
                    console.log(`  ❌ Không tìm thấy permission: ${permissionCode}`);
                }
            }
        }

        // Kiểm tra kết quả
        console.log('\n📊 Kiểm tra kết quả:');

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
            const permissionCodes = role.role_permission.map(rp => rp.permissions.code);
            console.log(`🎭 ${role.code}: ${permissionCodes.length} permissions`);

            // Hiển thị một số permissions chính
            const mainPermissions = permissionCodes.filter(p =>
                p.includes('employees') || p.includes('profile') || p.includes('dashboard')
            );
            if (mainPermissions.length > 0) {
                console.log(`   📋 ${mainPermissions.slice(0, 3).join(', ')}${mainPermissions.length > 3 ? '...' : ''}`);
            }
        }

        console.log('\n🎉 Hoàn thành sửa permissions thực tế!');
        console.log('\n📋 Tóm tắt thay đổi:');
        console.log('  👑 ADMIN: Chỉ quản lý hệ thống (roles, permissions, logs)');
        console.log('  🎓 RECTOR: Quản lý toàn trường (employees, reports, university overview)');
        console.log('  🏫 HEAD_FACULTY: Quản lý khoa (employees trong khoa, faculty reports)');
        console.log('  👨‍🏫 LECTURER: Chỉ xem thông tin và sửa profile cá nhân');
        console.log('  👨‍💼 STAFF: Xem thông tin nhân viên và sửa profile cá nhân');
        console.log('  🎓 STUDENT: Chỉ xem và sửa profile cá nhân');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixRealisticPermissions();
