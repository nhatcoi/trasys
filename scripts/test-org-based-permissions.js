const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrgBasedPermissions() {
    try {
        console.log('🧪 Test logic phân quyền theo cấu trúc tổ chức...\n');

        // 1. Lấy thông tin về cấu trúc tổ chức
        const orgUnits = await prisma.orgUnit.findMany({
            include: {
                assignments: {
                    include: {
                        employee: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        console.log('📊 Cấu trúc tổ chức:');
        orgUnits.forEach(unit => {
            console.log(`  🏢 ${unit.name} (${unit.code})`);
            if (unit.assignments.length > 0) {
                unit.assignments.forEach(assignment => {
                    console.log(`    👤 ${assignment.employee.user.full_name} - ${assignment.assignment_type}`);
                });
            } else {
                console.log(`    (Chưa có nhân viên)`);
            }
        });

        // 2. Test với một số users cụ thể
        const testUsers = ['admin', 'truong_khoa_cn', 'giang_vien_1', 'sinh_vien_1'];

        for (const username of testUsers) {
            console.log(`\n🔍 Test user: ${username}`);

            const user = await prisma.user.findFirst({
                where: { username },
                include: {
                    employees: {
                        include: {
                            assignments: {
                                include: {
                                    org_unit: true
                                }
                            }
                        }
                    },
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
            console.log(`  🔑 Permissions: ${permissions.length} quyền`);

            // Lấy org assignments
            if (user.employees.length > 0) {
                const employee = user.employees[0];
                console.log(`  🏢 Org Units: ${employee.assignments.map(a => a.org_unit.name).join(', ')}`);

                // Test logic filter employees
                if (employee.assignments.length > 0) {
                    const userOrgUnitIds = employee.assignments.map(a => a.org_unit_id);

                    // Find sub-units
                    const subOrgUnits = await prisma.orgUnit.findMany({
                        where: {
                            parent_id: { in: userOrgUnitIds }
                        }
                    });

                    const allOrgUnitIds = [
                        ...userOrgUnitIds,
                        ...subOrgUnits.map(unit => unit.id)
                    ];

                    // Count employees in scope
                    const employeesInScope = await prisma.employee.count({
                        where: {
                            assignments: {
                                some: {
                                    org_unit_id: { in: allOrgUnitIds }
                                }
                            }
                        }
                    });

                    console.log(`  📊 Có thể xem: ${employeesInScope} nhân viên trong phạm vi quản lý`);
                }
            } else {
                console.log(`  🏢 Không có org assignments`);
            }
        }

        // 3. Test logic admin vs non-admin
        console.log('\n🔐 Test logic Admin vs Non-Admin:');

        const adminUser = await prisma.user.findFirst({
            where: { username: 'admin' },
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

        if (adminUser) {
            const adminPermissions = adminUser.user_role.flatMap(ur =>
                ur.roles.role_permission.map(rp => rp.permissions.code)
            );

            const hasAdminPermissions = adminPermissions.includes('hr.employees.view') &&
                (adminPermissions.includes('hr.employees.create') ||
                    adminPermissions.includes('hr.employees.update') ||
                    adminPermissions.includes('hr.employees.delete'));

            console.log(`  👑 Admin user có admin permissions: ${hasAdminPermissions ? '✅' : '❌'}`);

            if (hasAdminPermissions) {
                const totalEmployees = await prisma.employee.count();
                console.log(`  📊 Admin có thể xem: ${totalEmployees} nhân viên (tất cả)`);
            }
        }

        const lecturerUser = await prisma.user.findFirst({
            where: { username: 'giang_vien_1' },
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

        if (lecturerUser) {
            const lecturerPermissions = lecturerUser.user_role.flatMap(ur =>
                ur.roles.role_permission.map(rp => rp.permissions.code)
            );

            const hasAdminPermissions = lecturerPermissions.includes('hr.employees.view') &&
                (lecturerPermissions.includes('hr.employees.create') ||
                    lecturerPermissions.includes('hr.employees.update') ||
                    lecturerPermissions.includes('hr.employees.delete'));

            console.log(`  👨‍🏫 Lecturer user có admin permissions: ${hasAdminPermissions ? '✅' : '❌'}`);

            if (!hasAdminPermissions) {
                console.log(`  📊 Lecturer chỉ có thể xem nhân viên trong phạm vi quản lý của mình`);
            }
        }

        console.log('\n✅ Test hoàn thành!');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testOrgBasedPermissions();
