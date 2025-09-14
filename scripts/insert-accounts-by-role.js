const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Định nghĩa accounts cho từng role
const accountsByRole = {
    ADMIN: [
        {
            username: 'admin_system',
            email: 'admin@university.edu.vn',
            full_name: 'Nguyễn Văn Admin',
            password: 'admin123',
            phone: '0123456789',
            address: 'Hà Nội',
            dob: new Date('1980-01-01'),
            gender: 'MALE'
        },
        {
            username: 'super_admin',
            email: 'superadmin@university.edu.vn',
            full_name: 'Trần Thị Super Admin',
            password: 'superadmin123',
            phone: '0987654321',
            address: 'TP.HCM',
            dob: new Date('1975-05-15'),
            gender: 'FEMALE'
        }
    ],
    HEAD_FACULTY: [
        {
            username: 'truong_khoa_cn',
            email: 'truongkhoa.cn@university.edu.vn',
            full_name: 'GS.TS. Lê Văn Trưởng Khoa CN',
            password: 'truongkhoa123',
            phone: '0123456780',
            address: 'Hà Nội',
            dob: new Date('1970-03-20'),
            gender: 'MALE'
        },
        {
            username: 'truong_khoa_kt',
            email: 'truongkhoa.kt@university.edu.vn',
            full_name: 'PGS.TS. Nguyễn Thị Trưởng Khoa KT',
            password: 'truongkhoa123',
            phone: '0123456781',
            address: 'Hà Nội',
            dob: new Date('1972-07-10'),
            gender: 'FEMALE'
        }
    ],
    LECTURER: [
        {
            username: 'giang_vien_1',
            email: 'giangvien1@university.edu.vn',
            full_name: 'TS. Phạm Văn Giảng Viên',
            password: 'giangvien123',
            phone: '0123456782',
            address: 'Hà Nội',
            dob: new Date('1985-09-15'),
            gender: 'MALE'
        },
        {
            username: 'giang_vien_2',
            email: 'giangvien2@university.edu.vn',
            full_name: 'ThS. Trần Thị Giảng Viên',
            password: 'giangvien123',
            phone: '0123456783',
            address: 'Hà Nội',
            dob: new Date('1988-12-05'),
            gender: 'FEMALE'
        },
        {
            username: 'giang_vien_3',
            email: 'giangvien3@university.edu.vn',
            full_name: 'TS. Lê Văn Giảng Viên',
            password: 'giangvien123',
            phone: '0123456784',
            address: 'Hà Nội',
            dob: new Date('1983-04-25'),
            gender: 'MALE'
        }
    ],
    STAFF: [
        {
            username: 'nhan_vien_hr',
            email: 'nhanvien.hr@university.edu.vn',
            full_name: 'Nguyễn Thị Nhân Viên HR',
            password: 'nhanvien123',
            phone: '0123456785',
            address: 'Hà Nội',
            dob: new Date('1990-06-30'),
            gender: 'FEMALE'
        },
        {
            username: 'nhan_vien_admin',
            email: 'nhanvien.admin@university.edu.vn',
            full_name: 'Trần Văn Nhân Viên Admin',
            password: 'nhanvien123',
            phone: '0123456786',
            address: 'Hà Nội',
            dob: new Date('1987-11-12'),
            gender: 'MALE'
        },
        {
            username: 'nhan_vien_ke_toan',
            email: 'nhanvien.ketoan@university.edu.vn',
            full_name: 'Phạm Thị Nhân Viên Kế Toán',
            password: 'nhanvien123',
            phone: '0123456787',
            address: 'Hà Nội',
            dob: new Date('1992-08-18'),
            gender: 'FEMALE'
        }
    ],
    STUDENT: [
        {
            username: 'sinh_vien_1',
            email: 'sinhvien1@student.university.edu.vn',
            full_name: 'Nguyễn Văn Sinh Viên',
            password: 'sinhvien123',
            phone: '0123456788',
            address: 'Hà Nội',
            dob: new Date('2000-01-15'),
            gender: 'MALE'
        },
        {
            username: 'sinh_vien_2',
            email: 'sinhvien2@student.university.edu.vn',
            full_name: 'Trần Thị Sinh Viên',
            password: 'sinhvien123',
            phone: '0123456789',
            address: 'Hà Nội',
            dob: new Date('2001-03-20'),
            gender: 'FEMALE'
        },
        {
            username: 'sinh_vien_3',
            email: 'sinhvien3@student.university.edu.vn',
            full_name: 'Lê Văn Sinh Viên',
            password: 'sinhvien123',
            phone: '0123456790',
            address: 'Hà Nội',
            dob: new Date('2000-07-10'),
            gender: 'MALE'
        },
        {
            username: 'sinh_vien_4',
            email: 'sinhvien4@student.university.edu.vn',
            full_name: 'Phạm Thị Sinh Viên',
            password: 'sinhvien123',
            phone: '0123456791',
            address: 'Hà Nội',
            dob: new Date('2001-09-25'),
            gender: 'FEMALE'
        }
    ]
};

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function insertAccountsByRole() {
    try {
        console.log('🚀 Bắt đầu insert accounts theo role...\n');

        // Lấy danh sách roles
        const roles = await prisma.roles.findMany();
        console.log('📋 Danh sách roles hiện có:');
        roles.forEach(role => console.log(`- ${role.code}: ${role.name}`));
        console.log('');

        let totalInserted = 0;

        for (const [roleCode, accounts] of Object.entries(accountsByRole)) {
            console.log(`\n🔹 Xử lý role: ${roleCode}`);

            // Tìm role
            const role = roles.find(r => r.code === roleCode);
            if (!role) {
                console.log(`❌ Không tìm thấy role: ${roleCode}`);
                continue;
            }

            console.log(`✅ Tìm thấy role: ${role.name}`);

            for (const accountData of accounts) {
                try {
                    // Kiểm tra username đã tồn tại chưa
                    const existingUser = await prisma.user.findUnique({
                        where: { username: accountData.username }
                    });

                    if (existingUser) {
                        console.log(`⚠️  Username ${accountData.username} đã tồn tại, bỏ qua...`);
                        continue;
                    }

                    // Hash password
                    const hashedPassword = await hashPassword(accountData.password);

                    // Tạo user
                    const user = await prisma.user.create({
                        data: {
                            username: accountData.username,
                            email: accountData.email,
                            password_hash: hashedPassword,
                            full_name: accountData.full_name,
                            phone: accountData.phone,
                            address: accountData.address,
                            dob: accountData.dob,
                            gender: accountData.gender,
                            status: 'ACTIVE'
                        }
                    });

                    // Gán role cho user
                    await prisma.user_role.create({
                        data: {
                            user_id: user.id,
                            role_id: role.id
                        }
                    });

                    console.log(`✅ Đã tạo account: ${accountData.username} (${accountData.full_name}) với role ${roleCode}`);
                    totalInserted++;

                } catch (error) {
                    console.log(`❌ Lỗi khi tạo account ${accountData.username}:`, error.message);
                }
            }
        }

        console.log(`\n🎉 Hoàn thành! Đã tạo ${totalInserted} accounts mới.`);

        // Hiển thị thống kê
        console.log('\n📊 Thống kê accounts theo role:');
        for (const [roleCode, accounts] of Object.entries(accountsByRole)) {
            const role = roles.find(r => r.code === roleCode);
            if (role) {
                const userCount = await prisma.user_role.count({
                    where: { role_id: role.id }
                });
                console.log(`- ${roleCode}: ${userCount} users`);
            }
        }

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script
insertAccountsByRole();
