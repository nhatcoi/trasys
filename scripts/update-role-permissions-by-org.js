const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRolePermissionsByOrg() {
    try {
        console.log('🚀 Bắt đầu cập nhật permissions theo cấu trúc tổ chức...');

        // 1. Lấy tất cả roles hiện tại
        const roles = await prisma.roles.findMany();
        console.log(`📋 Tìm thấy ${roles.length} roles`);

        // 2. Định nghĩa permissions cho từng loại role
        const rolePermissions = {
            // Admin - Full access
            'ADMIN': [
                'hr.dashboard.view', 'hr.employees.view', 'hr.employees.create', 'hr.employees.update', 'hr.employees.delete',
                'hr.roles.view', 'hr.roles.create', 'hr.roles.update', 'hr.roles.delete',
                'hr.permissions.view', 'hr.permissions.create', 'hr.permissions.update', 'hr.permissions.delete',
                'hr.role_permissions.view', 'hr.role_permissions.create', 'hr.role_permissions.delete',
                'hr.user_roles.view', 'hr.user_roles.create', 'hr.user_roles.delete',
                'hr.employee_logs.view', 'hr.performance_reviews.view', 'hr.performance_reviews.create',
                'hr.academic_titles.view', 'hr.academic_titles.create', 'hr.academic_titles.update', 'hr.academic_titles.delete',
                'hr.employee_academic_titles.view', 'hr.employee_academic_titles.create', 'hr.employee_academic_titles.update', 'hr.employee_academic_titles.delete',
                'hr.trainings.view', 'hr.trainings.create', 'hr.trainings.update', 'hr.trainings.delete',
                'hr.employee_trainings.view', 'hr.employee_trainings.create', 'hr.employee_trainings.update', 'hr.employee_trainings.delete',
                'hr.qualifications.view', 'hr.qualifications.create', 'hr.qualifications.update', 'hr.qualifications.delete',
                'hr.employee_qualifications.view', 'hr.employee_qualifications.create', 'hr.employee_qualifications.update', 'hr.employee_qualifications.delete',
                'hr.employments.view', 'hr.employments.create', 'hr.employments.update', 'hr.employments.delete',
                'hr.org_structure.view', 'hr.org_tree.view', 'hr.faculty.view', 'hr.university_overview.view', 'hr.reports.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // Rector - University level access
            'RECTOR': [
                'hr.dashboard.view', 'hr.employees.view', 'hr.employees.create', 'hr.employees.update',
                'hr.performance_reviews.view', 'hr.performance_reviews.create',
                'hr.academic_titles.view', 'hr.employee_academic_titles.view', 'hr.employee_academic_titles.create',
                'hr.trainings.view', 'hr.employee_trainings.view', 'hr.employee_trainings.create',
                'hr.qualifications.view', 'hr.employee_qualifications.view', 'hr.employee_qualifications.create',
                'hr.employments.view', 'hr.employments.create', 'hr.employments.update',
                'hr.org_structure.view', 'hr.faculty.view', 'hr.university_overview.view', 'hr.reports.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // Dean - Faculty level access
            'DEAN': [
                'hr.dashboard.view', 'hr.employees.view', 'hr.employees.create', 'hr.employees.update',
                'hr.performance_reviews.view', 'hr.performance_reviews.create',
                'hr.academic_titles.view', 'hr.employee_academic_titles.view', 'hr.employee_academic_titles.create',
                'hr.trainings.view', 'hr.employee_trainings.view', 'hr.employee_trainings.create',
                'hr.qualifications.view', 'hr.employee_qualifications.view', 'hr.employee_qualifications.create',
                'hr.employments.view', 'hr.employments.create', 'hr.employments.update',
                'hr.org_structure.view', 'hr.faculty.view', 'hr.reports.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // Head of Department - Department level access
            'HEAD_DEPARTMENT': [
                'hr.dashboard.view', 'hr.employees.view', 'hr.employees.create', 'hr.employees.update',
                'hr.performance_reviews.view', 'hr.performance_reviews.create',
                'hr.academic_titles.view', 'hr.employee_academic_titles.view', 'hr.employee_academic_titles.create',
                'hr.trainings.view', 'hr.employee_trainings.view', 'hr.employee_trainings.create',
                'hr.qualifications.view', 'hr.employee_qualifications.view', 'hr.employee_qualifications.create',
                'hr.employments.view', 'hr.employments.create', 'hr.employments.update',
                'hr.org_structure.view', 'hr.faculty.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // Lecturer - Limited access
            'LECTURER': [
                'hr.dashboard.view', 'hr.employees.view',
                'hr.performance_reviews.view',
                'hr.academic_titles.view', 'hr.employee_academic_titles.view',
                'hr.trainings.view', 'hr.employee_trainings.view',
                'hr.qualifications.view', 'hr.employee_qualifications.view',
                'hr.employments.view',
                'hr.faculty.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // Staff - Limited access
            'STAFF': [
                'hr.dashboard.view', 'hr.employees.view',
                'hr.qualifications.view', 'hr.employee_qualifications.view',
                'hr.employments.view',
                'hr.profile.view', 'hr.profile.update'
            ],

            // Student - Very limited access
            'STUDENT': [
                'hr.dashboard.view',
                'hr.profile.view', 'hr.profile.update'
            ]
        };

        // 3. Cập nhật permissions cho từng role
        for (const role of roles) {
            const roleCode = role.code;
            const permissions = rolePermissions[roleCode] || [];

            if (permissions.length === 0) {
                console.log(`⚠️  Không có permissions định nghĩa cho role: ${roleCode}`);
                continue;
            }

            console.log(`\n🔄 Cập nhật permissions cho role: ${roleCode} (${role.name})`);

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

        // 4. Kiểm tra kết quả
        console.log('\n📊 Kiểm tra kết quả:');

        for (const role of roles) {
            const roleWithPermissions = await prisma.roles.findUnique({
                where: { id: role.id },
                include: {
                    role_permission: {
                        include: {
                            permissions: true
                        }
                    }
                }
            });

            const permissionCodes = roleWithPermissions.role_permission.map(rp => rp.permissions.code);
            console.log(`🎭 ${role.code}: ${permissionCodes.length} permissions`);
            console.log(`   📋 ${permissionCodes.slice(0, 5).join(', ')}${permissionCodes.length > 5 ? '...' : ''}`);
        }

        console.log('\n🎉 Hoàn thành cập nhật permissions theo cấu trúc tổ chức!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateRolePermissionsByOrg();
