const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantAdminFullPermissions() {
  try {
    console.log('🚀 Bắt đầu gán full quyền cho admin...');

    // 1. Tìm admin user
    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.error('❌ Không tìm thấy admin user');
      return;
    }

    console.log(`✅ Tìm thấy admin user: ${adminUser.username} (ID: ${adminUser.id})`);

    // 2. Lấy tất cả permissions
    const allPermissions = await prisma.permissions.findMany();
    console.log(`📋 Tìm thấy ${allPermissions.length} permissions`);

    // 3. Tìm hoặc tạo SUPER_ADMIN role
    let superAdminRole = await prisma.roles.findFirst({
      where: { code: 'SUPER_ADMIN' }
    });

    if (!superAdminRole) {
      superAdminRole = await prisma.roles.create({
        data: {
          code: 'SUPER_ADMIN',
          name: 'Super Administrator'
        }
      });
      console.log('✅ Tạo SUPER_ADMIN role');
    } else {
      console.log('✅ Tìm thấy SUPER_ADMIN role');
    }

    // 4. Gán tất cả permissions cho SUPER_ADMIN role
    console.log('🔗 Gán permissions cho SUPER_ADMIN role...');
    
    for (const permission of allPermissions) {
      const existingRolePermission = await prisma.role_permission.findFirst({
        where: {
          role_id: superAdminRole.id,
          permission_id: permission.id
        }
      });

      if (!existingRolePermission) {
        await prisma.role_permission.create({
          data: {
            role_id: superAdminRole.id,
            permission_id: permission.id
          }
        });
        console.log(`  ✅ Gán permission: ${permission.code}`);
      } else {
        console.log(`  ⏭️  Permission đã có: ${permission.code}`);
      }
    }

    // 5. Gán SUPER_ADMIN role cho admin user
    console.log('👤 Gán SUPER_ADMIN role cho admin user...');
    
    const existingUserRole = await prisma.user_role.findFirst({
      where: {
        user_id: adminUser.id,
        role_id: superAdminRole.id
      }
    });

    if (!existingUserRole) {
      await prisma.user_role.create({
        data: {
          user_id: adminUser.id,
          role_id: superAdminRole.id
        }
      });
      console.log('✅ Gán SUPER_ADMIN role cho admin user');
    } else {
      console.log('⏭️  Admin user đã có SUPER_ADMIN role');
    }

    // 6. Xóa các role cũ của admin (nếu có)
    console.log('🧹 Dọn dẹp roles cũ của admin...');
    const oldUserRoles = await prisma.user_role.findMany({
      where: {
        user_id: adminUser.id,
        role_id: { not: superAdminRole.id }
      }
    });

    if (oldUserRoles.length > 0) {
      await prisma.user_role.deleteMany({
        where: {
          user_id: adminUser.id,
          role_id: { not: superAdminRole.id }
        }
      });
      console.log(`✅ Xóa ${oldUserRoles.length} roles cũ`);
    }

    // 7. Kiểm tra kết quả
    console.log('\n📊 Kiểm tra kết quả:');
    
    const adminWithRoles = await prisma.user.findUnique({
      where: { id: adminUser.id },
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

    const adminPermissions = adminWithRoles.user_role.flatMap(ur =>
      ur.roles.role_permission.map(rp => rp.permissions.code)
    );

    console.log(`👤 Admin user: ${adminWithRoles.username}`);
    console.log(`🎭 Roles: ${adminWithRoles.user_role.map(ur => ur.roles.name).join(', ')}`);
    console.log(`🔑 Total permissions: ${adminPermissions.length}`);
    console.log(`📋 Permissions: ${adminPermissions.slice(0, 10).join(', ')}${adminPermissions.length > 10 ? '...' : ''}`);

    console.log('\n🎉 Hoàn thành! Admin đã có full quyền.');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

grantAdminFullPermissions();
