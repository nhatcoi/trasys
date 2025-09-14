const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateLoginCredentials() {
    try {
        console.log('🚀 Tạo file thông tin đăng nhập...\n');

        // Lấy danh sách roles
        const roles = await prisma.roles.findMany({
            orderBy: { code: 'asc' }
        });

        let csvContent = 'Role,Username,Password,Full Name,Email,Phone,Status\n';
        let totalAccounts = 0;

        for (const role of roles) {
            console.log(`🔹 Xử lý role: ${role.code}`);

            // Lấy users có role này
            const userRoles = await prisma.user_role.findMany({
                where: { role_id: role.id },
                include: {
                    users: true
                }
            });

            for (const userRole of userRoles) {
                const user = userRole.users;

                // Tạo password mặc định dựa trên role
                let defaultPassword = '';
                switch (role.code) {
                    case 'ADMIN':
                        defaultPassword = 'admin123';
                        break;
                    case 'HEAD_FACULTY':
                        defaultPassword = 'truongkhoa123';
                        break;
                    case 'LECTURER':
                        defaultPassword = 'giangvien123';
                        break;
                    case 'STAFF':
                        defaultPassword = 'nhanvien123';
                        break;
                    case 'STUDENT':
                        defaultPassword = 'sinhvien123';
                        break;
                    default:
                        defaultPassword = 'password123';
                }

                // Thêm vào CSV
                csvContent += `"${role.name}","${user.username}","${defaultPassword}","${user.full_name}","${user.email || ''}","${user.phone || ''}","${user.status}"\n`;
                totalAccounts++;
            }
        }

        // Ghi file CSV
        const csvPath = path.join(__dirname, 'login-credentials.csv');
        fs.writeFileSync(csvPath, csvContent, 'utf8');

        console.log(`\n✅ Đã tạo file: ${csvPath}`);
        console.log(`📊 Tổng số accounts: ${totalAccounts}`);

        // Tạo file README
        const readmeContent = `# THÔNG TIN ĐĂNG NHẬP HỆ THỐNG

## Tổng quan
File này chứa thông tin đăng nhập cho tất cả accounts trong hệ thống HR Management.

## Cấu trúc file
- **login-credentials.csv**: File CSV chứa thông tin đăng nhập
- **login-credentials.json**: File JSON chứa thông tin đăng nhập (dễ đọc hơn)

## Hướng dẫn sử dụng
1. Mở file CSV bằng Excel hoặc Google Sheets
2. Tìm username cần đăng nhập
3. Sử dụng password tương ứng

## Mật khẩu mặc định theo role
- **ADMIN**: admin123
- **HEAD_FACULTY**: truongkhoa123  
- **LECTURER**: giangvien123
- **STAFF**: nhanvien123
- **STUDENT**: sinhvien123

## Lưu ý bảo mật
⚠️ **QUAN TRỌNG**: Đây là mật khẩu mặc định. Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!

## Thống kê
- Tổng số accounts: ${totalAccounts}
- Số roles: ${roles.length}
- Ngày tạo: ${new Date().toLocaleString('vi-VN')}

---
*File được tạo tự động bởi hệ thống HR Management*
`;

        const readmePath = path.join(__dirname, 'README-credentials.md');
        fs.writeFileSync(readmePath, readmeContent, 'utf8');

        console.log(`✅ Đã tạo file: ${readmePath}`);

        // Tạo file JSON cho dễ đọc
        const jsonData = [];
        for (const role of roles) {
            const userRoles = await prisma.user_role.findMany({
                where: { role_id: role.id },
                include: {
                    users: true
                }
            });

            for (const userRole of userRoles) {
                const user = userRole.users;

                let defaultPassword = '';
                switch (role.code) {
                    case 'ADMIN':
                        defaultPassword = 'admin123';
                        break;
                    case 'HEAD_FACULTY':
                        defaultPassword = 'truongkhoa123';
                        break;
                    case 'LECTURER':
                        defaultPassword = 'giangvien123';
                        break;
                    case 'STAFF':
                        defaultPassword = 'nhanvien123';
                        break;
                    case 'STUDENT':
                        defaultPassword = 'sinhvien123';
                        break;
                    default:
                        defaultPassword = 'password123';
                }

                jsonData.push({
                    role: role.name,
                    roleCode: role.code,
                    username: user.username,
                    password: defaultPassword,
                    fullName: user.full_name,
                    email: user.email,
                    phone: user.phone,
                    status: user.status
                });
            }
        }

        const jsonPath = path.join(__dirname, 'login-credentials.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

        console.log(`✅ Đã tạo file: ${jsonPath}`);

        console.log('\n🎉 Hoàn thành! Đã tạo các file:');
        console.log(`📄 ${csvPath}`);
        console.log(`📄 ${readmePath}`);
        console.log(`📄 ${jsonPath}`);

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script
generateLoginCredentials();
