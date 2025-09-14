const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRBAC() {
    try {
        console.log('🌱 Seeding RBAC data...');

        // 1. Tạo permissions
        const permissions = [
            // Dashboard
            { code: 'hr.dashboard.view', name: 'Xem Dashboard HR' },

            // Employees
            { code: 'hr.employees.view', name: 'Xem danh sách nhân viên' },
            { code: 'hr.employees.create', name: 'Tạo nhân viên mới' },
            { code: 'hr.employees.update', name: 'Cập nhật thông tin nhân viên' },
            { code: 'hr.employees.delete', name: 'Xóa nhân viên' },

            // Roles
            { code: 'hr.roles.view', name: 'Xem danh sách vai trò' },
            { code: 'hr.roles.create', name: 'Tạo vai trò mới' },
            { code: 'hr.roles.update', name: 'Cập nhật vai trò' },
            { code: 'hr.roles.delete', name: 'Xóa vai trò' },

            // Permissions
            { code: 'hr.permissions.view', name: 'Xem danh sách quyền hạn' },
            { code: 'hr.permissions.create', name: 'Tạo quyền hạn mới' },
            { code: 'hr.permissions.update', name: 'Cập nhật quyền hạn' },
            { code: 'hr.permissions.delete', name: 'Xóa quyền hạn' },

            // Role Permissions
            { code: 'hr.role_permissions.view', name: 'Xem phân quyền vai trò' },
            { code: 'hr.role_permissions.create', name: 'Tạo phân quyền vai trò' },
            { code: 'hr.role_permissions.delete', name: 'Xóa phân quyền vai trò' },

            // User Roles
            { code: 'hr.user_roles.view', name: 'Xem phân quyền người dùng' },
            { code: 'hr.user_roles.create', name: 'Tạo phân quyền người dùng' },
            { code: 'hr.user_roles.delete', name: 'Xóa phân quyền người dùng' },

            // Employee Logs
            { code: 'hr.employee_logs.view', name: 'Xem nhật ký nhân viên' },

            // Performance Reviews
            { code: 'hr.performance_reviews.view', name: 'Xem đánh giá hiệu suất' },
            { code: 'hr.performance_reviews.create', name: 'Tạo đánh giá hiệu suất' },

            // Academic Titles
            { code: 'hr.academic_titles.view', name: 'Xem học hàm học vị' },
            { code: 'hr.academic_titles.create', name: 'Tạo học hàm học vị' },
            { code: 'hr.academic_titles.update', name: 'Cập nhật học hàm học vị' },
            { code: 'hr.academic_titles.delete', name: 'Xóa học hàm học vị' },

            // Employee Academic Titles
            { code: 'hr.employee_academic_titles.view', name: 'Xem học hàm nhân viên' },
            { code: 'hr.employee_academic_titles.create', name: 'Tạo học hàm nhân viên' },
            { code: 'hr.employee_academic_titles.update', name: 'Cập nhật học hàm nhân viên' },
            { code: 'hr.employee_academic_titles.delete', name: 'Xóa học hàm nhân viên' },

            // Trainings
            { code: 'hr.trainings.view', name: 'Xem khóa đào tạo' },
            { code: 'hr.trainings.create', name: 'Tạo khóa đào tạo' },
            { code: 'hr.trainings.update', name: 'Cập nhật khóa đào tạo' },
            { code: 'hr.trainings.delete', name: 'Xóa khóa đào tạo' },

            // Employee Trainings
            { code: 'hr.employee_trainings.view', name: 'Xem đào tạo nhân viên' },
            { code: 'hr.employee_trainings.create', name: 'Tạo đào tạo nhân viên' },
            { code: 'hr.employee_trainings.update', name: 'Cập nhật đào tạo nhân viên' },
            { code: 'hr.employee_trainings.delete', name: 'Xóa đào tạo nhân viên' },

            // Qualifications
            { code: 'hr.qualifications.view', name: 'Xem bằng cấp' },
            { code: 'hr.qualifications.create', name: 'Tạo bằng cấp' },
            { code: 'hr.qualifications.update', name: 'Cập nhật bằng cấp' },
            { code: 'hr.qualifications.delete', name: 'Xóa bằng cấp' },

            // Employee Qualifications
            { code: 'hr.employee_qualifications.view', name: 'Xem bằng cấp nhân viên' },
            { code: 'hr.employee_qualifications.create', name: 'Tạo bằng cấp nhân viên' },
            { code: 'hr.employee_qualifications.update', name: 'Cập nhật bằng cấp nhân viên' },
            { code: 'hr.employee_qualifications.delete', name: 'Xóa bằng cấp nhân viên' },

            // Employments
            { code: 'hr.employments.view', name: 'Xem hợp đồng lao động' },
            { code: 'hr.employments.create', name: 'Tạo hợp đồng lao động' },
            { code: 'hr.employments.update', name: 'Cập nhật hợp đồng lao động' },
            { code: 'hr.employments.delete', name: 'Xóa hợp đồng lao động' },

            // Organization
            { code: 'hr.org_structure.view', name: 'Xem cơ cấu tổ chức' },
            { code: 'hr.org_tree.view', name: 'Xem cây tổ chức' },
            { code: 'hr.faculty.view', name: 'Xem giảng viên' },
            { code: 'hr.university_overview.view', name: 'Xem tổng quan đại học' },

            // Reports
            { code: 'hr.reports.view', name: 'Xem báo cáo' },

            // Profile
            { code: 'hr.profile.view', name: 'Xem hồ sơ cá nhân' },
            { code: 'hr.profile.update', name: 'Cập nhật hồ sơ cá nhân' },
        ];

        console.log('📝 Creating permissions...');
        for (const permission of permissions) {
            await prisma.permissions.upsert({
                where: { code: permission.code },
                update: permission,
                create: permission,
            });
        }

        // 2. Tạo roles
        const roles = [
            {
                code: 'ADMIN',
                name: 'Quản trị viên hệ thống'
            },
            {
                code: 'HEAD_FACULTY',
                name: 'Trưởng khoa'
            },
            {
                code: 'LECTURER',
                name: 'Giảng viên'
            },
            {
                code: 'STAFF',
                name: 'Nhân viên'
            },
            {
                code: 'STUDENT',
                name: 'Sinh viên'
            }
        ];

        console.log('👥 Creating roles...');
        for (const role of roles) {
            await prisma.roles.upsert({
                where: { code: role.code },
                update: role,
                create: role,
            });
        }

        // 3. Gán permissions cho roles
        console.log('🔗 Assigning permissions to roles...');

        // Admin - tất cả quyền
        const adminRole = await prisma.roles.findUnique({ where: { code: 'ADMIN' } });
        const allPermissions = await prisma.permissions.findMany();
        for (const permission of allPermissions) {
            await prisma.role_permission.upsert({
                where: {
                    role_id_permission_id: {
                        role_id: adminRole.id,
                        permission_id: permission.id
                    }
                },
                update: {},
                create: {
                    role_id: adminRole.id,
                    permission_id: permission.id
                }
            });
        }

        // Head Faculty - quyền quản lý khoa
        const headFacultyRole = await prisma.roles.findUnique({ where: { code: 'HEAD_FACULTY' } });
        const headFacultyPermissions = [
            'hr.dashboard.view',
            'hr.employees.view',
            'hr.employees.create',
            'hr.employees.update',
            'hr.performance_reviews.view',
            'hr.performance_reviews.create',
            'hr.academic_titles.view',
            'hr.employee_academic_titles.view',
            'hr.employee_academic_titles.create',
            'hr.trainings.view',
            'hr.employee_trainings.view',
            'hr.employee_trainings.create',
            'hr.qualifications.view',
            'hr.employee_qualifications.view',
            'hr.employee_qualifications.create',
            'hr.employments.view',
            'hr.org_structure.view',
            'hr.faculty.view',
            'hr.reports.view',
            'hr.profile.view',
            'hr.profile.update'
        ];

        for (const permCode of headFacultyPermissions) {
            const permission = await prisma.permissions.findUnique({ where: { code: permCode } });
            if (permission) {
                await prisma.role_permission.upsert({
                    where: {
                        role_id_permission_id: {
                            role_id: headFacultyRole.id,
                            permission_id: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role_id: headFacultyRole.id,
                        permission_id: permission.id
                    }
                });
            }
        }

        // Lecturer - quyền cơ bản
        const lecturerRole = await prisma.roles.findUnique({ where: { code: 'LECTURER' } });
        const lecturerPermissions = [
            'hr.dashboard.view',
            'hr.employees.view',
            'hr.performance_reviews.view',
            'hr.academic_titles.view',
            'hr.employee_academic_titles.view',
            'hr.trainings.view',
            'hr.employee_trainings.view',
            'hr.qualifications.view',
            'hr.employee_qualifications.view',
            'hr.employments.view',
            'hr.faculty.view',
            'hr.profile.view',
            'hr.profile.update'
        ];

        for (const permCode of lecturerPermissions) {
            const permission = await prisma.permissions.findUnique({ where: { code: permCode } });
            if (permission) {
                await prisma.role_permission.upsert({
                    where: {
                        role_id_permission_id: {
                            role_id: lecturerRole.id,
                            permission_id: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role_id: lecturerRole.id,
                        permission_id: permission.id
                    }
                });
            }
        }

        // Staff - quyền hành chính
        const staffRole = await prisma.roles.findUnique({ where: { code: 'STAFF' } });
        const staffPermissions = [
            'hr.dashboard.view',
            'hr.employees.view',
            'hr.employees.create',
            'hr.employees.update',
            'hr.qualifications.view',
            'hr.employee_qualifications.view',
            'hr.employee_qualifications.create',
            'hr.employments.view',
            'hr.employments.create',
            'hr.employments.update',
            'hr.org_structure.view',
            'hr.reports.view',
            'hr.profile.view',
            'hr.profile.update'
        ];

        for (const permCode of staffPermissions) {
            const permission = await prisma.permissions.findUnique({ where: { code: permCode } });
            if (permission) {
                await prisma.role_permission.upsert({
                    where: {
                        role_id_permission_id: {
                            role_id: staffRole.id,
                            permission_id: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role_id: staffRole.id,
                        permission_id: permission.id
                    }
                });
            }
        }

        // Student - quyền tối thiểu
        const studentRole = await prisma.roles.findUnique({ where: { code: 'STUDENT' } });
        const studentPermissions = [
            'hr.dashboard.view',
            'hr.profile.view',
            'hr.profile.update'
        ];

        for (const permCode of studentPermissions) {
            const permission = await prisma.permissions.findUnique({ where: { code: permCode } });
            if (permission) {
                await prisma.role_permission.upsert({
                    where: {
                        role_id_permission_id: {
                            role_id: studentRole.id,
                            permission_id: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role_id: studentRole.id,
                        permission_id: permission.id
                    }
                });
            }
        }

        // 4. Tạo user admin mẫu và gán role
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        let adminUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: 'admin@trasys.com' },
                    { username: 'admin' }
                ]
            }
        });

        if (!adminUser) {
            adminUser = await prisma.user.create({
                data: {
                    username: 'admin',
                    email: 'admin@trasys.com',
                    full_name: 'Administrator',
                    password_hash: hashedPassword
                }
            });
        }

        // Gán role ADMIN cho user admin
        await prisma.user_role.upsert({
            where: {
                user_id_role_id: {
                    user_id: adminUser.id,
                    role_id: adminRole.id
                }
            },
            update: {},
            create: {
                user_id: adminUser.id,
                role_id: adminRole.id
            }
        });

        console.log('✅ RBAC seeding completed!');
        console.log('📋 Summary:');
        console.log(`   - ${permissions.length} permissions created`);
        console.log(`   - ${roles.length} roles created`);
        console.log(`   - Role-permission assignments created`);
        console.log(`   - Admin user created (admin@trasys.com / admin123)`);

    } catch (error) {
        console.error('❌ Error seeding RBAC:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedRBAC();
