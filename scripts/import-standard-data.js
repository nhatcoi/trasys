const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function importStandardData() {
    try {
        console.log('🚀 Bắt đầu import data chuẩn thiết kế...\n');

        // 1. Tạo Organizational Units chuẩn
        console.log('📊 Tạo cấu trúc tổ chức...');

        const orgUnits = [
            // Cấp 1: Đại học
            { code: 'PHENIKAA', name: 'Đại học Phenikaa', type: 'U', parent_id: null },

            // Cấp 2: Trường
            { code: 'ICT', name: 'Trường Công nghệ Thông tin', type: 'S', parent_id: 'PHENIKAA' },
            { code: 'MED', name: 'Trường Y Dược', type: 'S', parent_id: 'PHENIKAA' },
            { code: 'ECO', name: 'Trường Kinh tế', type: 'S', parent_id: 'PHENIKAA' },

            // Cấp 3: Khoa (thuộc Trường ICT)
            { code: 'SE', name: 'Khoa Công nghệ Phần mềm', type: 'F', parent_id: 'ICT' },
            { code: 'IS', name: 'Khoa Hệ thống Thông tin', type: 'F', parent_id: 'ICT' },
            { code: 'CS', name: 'Khoa Khoa học Máy tính', type: 'F', parent_id: 'ICT' },

            // Cấp 3: Khoa (thuộc Trường Y Dược)
            { code: 'PHARM', name: 'Khoa Dược', type: 'F', parent_id: 'MED' },
            { code: 'NURSING', name: 'Khoa Điều dưỡng', type: 'F', parent_id: 'MED' },

            // Cấp 3: Khoa (thuộc Trường Kinh tế)
            { code: 'BA', name: 'Khoa Quản trị Kinh doanh', type: 'F', parent_id: 'ECO' },
            { code: 'FIN', name: 'Khoa Tài chính - Ngân hàng', type: 'F', parent_id: 'ECO' },

            // Cấp 4: Bộ môn (thuộc Khoa SE)
            { code: 'SWE', name: 'Bộ môn Kỹ thuật Phần mềm', type: 'D', parent_id: 'SE' },
            { code: 'DB', name: 'Bộ môn Cơ sở Dữ liệu', type: 'D', parent_id: 'SE' },

            // Cấp 4: Bộ môn (thuộc Khoa IS)
            { code: 'ECOM', name: 'Bộ môn Thương mại Điện tử', type: 'D', parent_id: 'IS' },
            { code: 'ERP', name: 'Bộ môn Hệ thống ERP', type: 'D', parent_id: 'IS' },
        ];

        const createdOrgUnits = {};

        for (const unit of orgUnits) {
            const parentId = unit.parent_id ? createdOrgUnits[unit.parent_id]?.id : null;

            // Check if org unit already exists
            let orgUnit = await prisma.orgUnit.findFirst({
                where: { code: unit.code }
            });

            if (orgUnit) {
                // Update existing
                orgUnit = await prisma.orgUnit.update({
                    where: { id: orgUnit.id },
                    data: {
                        name: unit.name,
                        type: unit.type,
                        parent_id: parentId
                    }
                });
            } else {
                // Create new
                orgUnit = await prisma.orgUnit.create({
                    data: {
                        code: unit.code,
                        name: unit.name,
                        type: unit.type,
                        parent_id: parentId,
                        status: 'active'
                    }
                });
            }

            createdOrgUnits[unit.code] = orgUnit;
            console.log(`  ✅ ${unit.name} (${unit.code})`);
        }

        // 2. Tạo Job Positions
        console.log('\n👔 Tạo chức vụ...');

        const positions = [
            { code: 'RECTOR', title: 'Hiệu trưởng', grade: '1' },
            { code: 'VICE_RECTOR', title: 'Phó Hiệu trưởng', grade: '2' },
            { code: 'DEAN', title: 'Trưởng khoa', grade: '3' },
            { code: 'VICE_DEAN', title: 'Phó Trưởng khoa', grade: '4' },
            { code: 'HEAD_DEPT', title: 'Trưởng bộ môn', grade: '5' },
            { code: 'LECTURER', title: 'Giảng viên', grade: '6' },
            { code: 'SENIOR_LECTURER', title: 'Giảng viên chính', grade: '6' },
            { code: 'ASSOCIATE_PROF', title: 'Phó Giáo sư', grade: '7' },
            { code: 'PROFESSOR', title: 'Giáo sư', grade: '8' },
            { code: 'STAFF', title: 'Nhân viên', grade: '9' },
            { code: 'ADMIN', title: 'Quản trị viên', grade: '10' },
        ];

        const createdPositions = {};

        for (const pos of positions) {
            let position = await prisma.job_positions.findFirst({
                where: { code: pos.code }
            });

            if (position) {
                position = await prisma.job_positions.update({
                    where: { id: position.id },
                    data: { title: pos.title, grade: pos.grade }
                });
            } else {
                position = await prisma.job_positions.create({
                    data: {
                        code: pos.code,
                        title: pos.title,
                        grade: pos.grade
                    }
                });
            }

            createdPositions[pos.code] = position;
            console.log(`  ✅ ${pos.title} (${pos.code})`);
        }

        // 3. Tạo Academic Titles
        console.log('\n🎓 Tạo học hàm học vị...');

        const academicTitles = [
            { code: 'GS', title: 'Giáo sư' },
            { code: 'PGS', title: 'Phó Giáo sư' },
            { code: 'TS', title: 'Tiến sĩ' },
            { code: 'THS', title: 'Thạc sĩ' },
            { code: 'CN', title: 'Cử nhân' },
            { code: 'KS', title: 'Kỹ sư' },
        ];

        const createdAcademicTitles = {};

        for (const title of academicTitles) {
            let academicTitle = await prisma.academic_titles.findFirst({
                where: { code: title.code }
            });

            if (academicTitle) {
                academicTitle = await prisma.academic_titles.update({
                    where: { id: academicTitle.id },
                    data: { title: title.title }
                });
            } else {
                academicTitle = await prisma.academic_titles.create({
                    data: {
                        code: title.code,
                        title: title.title
                    }
                });
            }

            createdAcademicTitles[title.code] = academicTitle;
            console.log(`  ✅ ${title.title} (${title.code})`);
        }

        // 4. Tạo Users và Employees
        console.log('\n👥 Tạo users và employees...');

        const users = [
            // Admin
            { username: 'admin', full_name: 'Admin System', email: 'admin@phenikaa.edu.vn', role: 'ADMIN', org_unit: 'PHENIKAA', position: 'ADMIN' },

            // Hiệu trưởng
            { username: 'rector', full_name: 'GS.TS. Nguyễn Văn Hiệu trưởng', email: 'rector@phenikaa.edu.vn', role: 'RECTOR', org_unit: 'PHENIKAA', position: 'RECTOR' },

            // Trưởng khoa ICT
            { username: 'dean_ict', full_name: 'PGS.TS. Trần Văn Trưởng ICT', email: 'dean.ict@phenikaa.edu.vn', role: 'DEAN', org_unit: 'ICT', position: 'DEAN' },

            // Trưởng khoa SE
            { username: 'dean_se', full_name: 'TS. Lê Thị Trưởng SE', email: 'dean.se@phenikaa.edu.vn', role: 'DEAN', org_unit: 'SE', position: 'DEAN' },

            // Trưởng khoa IS
            { username: 'dean_is', full_name: 'TS. Phạm Văn Trưởng IS', email: 'dean.is@phenikaa.edu.vn', role: 'DEAN', org_unit: 'IS', position: 'DEAN' },

            // Trưởng khoa MED
            { username: 'dean_med', full_name: 'GS.TS. Nguyễn Thị Trưởng MED', email: 'dean.med@phenikaa.edu.vn', role: 'DEAN', org_unit: 'MED', position: 'DEAN' },

            // Trưởng bộ môn
            { username: 'head_swe', full_name: 'TS. Vũ Văn Trưởng SWE', email: 'head.swe@phenikaa.edu.vn', role: 'HEAD_DEPARTMENT', org_unit: 'SWE', position: 'HEAD_DEPT' },
            { username: 'head_db', full_name: 'TS. Hoàng Thị Trưởng DB', email: 'head.db@phenikaa.edu.vn', role: 'HEAD_DEPARTMENT', org_unit: 'DB', position: 'HEAD_DEPT' },

            // Giảng viên
            { username: 'lecturer_1', full_name: 'TS. Nguyễn Văn Giảng viên 1', email: 'lecturer1@phenikaa.edu.vn', role: 'LECTURER', org_unit: 'SWE', position: 'LECTURER' },
            { username: 'lecturer_2', full_name: 'THS. Trần Thị Giảng viên 2', email: 'lecturer2@phenikaa.edu.vn', role: 'LECTURER', org_unit: 'DB', position: 'LECTURER' },
            { username: 'lecturer_3', full_name: 'TS. Lê Văn Giảng viên 3', email: 'lecturer3@phenikaa.edu.vn', role: 'LECTURER', org_unit: 'ECOM', position: 'LECTURER' },
            { username: 'lecturer_4', full_name: 'PGS.TS. Phạm Thị Giảng viên 4', email: 'lecturer4@phenikaa.edu.vn', role: 'LECTURER', org_unit: 'PHARM', position: 'SENIOR_LECTURER' },

            // Nhân viên
            { username: 'staff_1', full_name: 'Nguyễn Văn Nhân viên 1', email: 'staff1@phenikaa.edu.vn', role: 'STAFF', org_unit: 'ICT', position: 'STAFF' },
            { username: 'staff_2', full_name: 'Trần Thị Nhân viên 2', email: 'staff2@phenikaa.edu.vn', role: 'STAFF', org_unit: 'MED', position: 'STAFF' },

            // Sinh viên
            { username: 'student_1', full_name: 'Lê Văn Sinh viên 1', email: 'student1@phenikaa.edu.vn', role: 'STUDENT', org_unit: null, position: null },
            { username: 'student_2', full_name: 'Phạm Thị Sinh viên 2', email: 'student2@phenikaa.edu.vn', role: 'STUDENT', org_unit: null, position: null },
        ];

        const createdUsers = {};

        for (const userData of users) {
            // Tạo user
            const hashedPassword = await bcrypt.hash('123456', 10);

            const user = await prisma.user.upsert({
                where: { username: userData.username },
                update: {
                    full_name: userData.full_name,
                    email: userData.email,
                    password_hash: hashedPassword
                },
                create: {
                    username: userData.username,
                    full_name: userData.full_name,
                    email: userData.email,
                    password_hash: hashedPassword,
                    status: 'ACTIVE'
                }
            });

            createdUsers[userData.username] = user;
            console.log(`  ✅ User: ${userData.full_name} (${userData.username})`);

            // Tạo employee nếu có org_unit
            if (userData.org_unit && userData.position) {
                let employee = await prisma.employee.findFirst({
                    where: { user_id: user.id }
                });

                if (!employee) {
                    employee = await prisma.employee.create({
                        data: {
                            user_id: user.id,
                            employee_no: `EMP${user.id.toString().padStart(4, '0')}`,
                            employment_type: userData.position.includes('LECTURER') ? 'lecturer' : 'staff',
                            status: 'ACTIVE',
                            hired_at: new Date()
                        }
                    });
                    console.log(`    👤 Created employee: ${employee.employee_no}`);
                }

                // Tạo org assignment
                const orgUnit = createdOrgUnits[userData.org_unit];
                const position = createdPositions[userData.position];

                if (orgUnit && position && employee) {
                    console.log(`    🔍 Creating assignment: employee_id=${employee.id}, org_unit_id=${orgUnit.id}, position_id=${position.id}`);

                    const existingAssignment = await prisma.orgAssignment.findFirst({
                        where: {
                            employee_id: employee.id,
                            org_unit_id: orgUnit.id
                        }
                    });

                    if (!existingAssignment) {
                        await prisma.orgAssignment.create({
                            data: {
                                employee_id: employee.id,
                                org_unit_id: orgUnit.id,
                                position_id: position.id,
                                assignment_type: userData.position === 'ADMIN' ? 'admin' : 'academic',
                                is_primary: true,
                                start_date: new Date()
                            }
                        });
                        console.log(`    ✅ Created org assignment`);
                    } else {
                        console.log(`    ⚠️  Assignment already exists`);
                    }

                    console.log(`    📍 Assigned to: ${orgUnit.name} as ${position.title}`);
                } else {
                    console.log(`    ❌ Missing data: orgUnit=${!!orgUnit}, position=${!!position}, employee=${!!employee}`);
                }
            }
        }

        // 5. Assign roles to users
        console.log('\n🎭 Assign roles to users...');

        const roleAssignments = [
            { username: 'admin', role: 'ADMIN' },
            { username: 'rector', role: 'RECTOR' },
            { username: 'dean_ict', role: 'DEAN' },
            { username: 'dean_se', role: 'DEAN' },
            { username: 'dean_is', role: 'DEAN' },
            { username: 'dean_med', role: 'DEAN' },
            { username: 'head_swe', role: 'HEAD_DEPARTMENT' },
            { username: 'head_db', role: 'HEAD_DEPARTMENT' },
            { username: 'lecturer_1', role: 'LECTURER' },
            { username: 'lecturer_2', role: 'LECTURER' },
            { username: 'lecturer_3', role: 'LECTURER' },
            { username: 'lecturer_4', role: 'LECTURER' },
            { username: 'staff_1', role: 'STAFF' },
            { username: 'staff_2', role: 'STAFF' },
            { username: 'student_1', role: 'STUDENT' },
            { username: 'student_2', role: 'STUDENT' },
        ];

        for (const assignment of roleAssignments) {
            const user = createdUsers[assignment.username];
            const role = await prisma.roles.findFirst({
                where: { code: assignment.role }
            });

            if (user && role) {
                await prisma.user_role.upsert({
                    where: {
                        user_id_role_id: {
                            user_id: user.id,
                            role_id: role.id
                        }
                    },
                    update: {},
                    create: {
                        user_id: user.id,
                        role_id: role.id
                    }
                });

                console.log(`  ✅ ${user.full_name} → ${role.name}`);
            }
        }

        // 6. Tạo Academic Title assignments
        console.log('\n🎓 Assign academic titles...');

        const academicAssignments = [
            { username: 'rector', title: 'GS' },
            { username: 'dean_ict', title: 'PGS' },
            { username: 'dean_se', title: 'TS' },
            { username: 'dean_is', title: 'TS' },
            { username: 'dean_med', title: 'GS' },
            { username: 'head_swe', title: 'TS' },
            { username: 'head_db', title: 'TS' },
            { username: 'lecturer_1', title: 'TS' },
            { username: 'lecturer_2', title: 'THS' },
            { username: 'lecturer_3', title: 'TS' },
            { username: 'lecturer_4', title: 'PGS' },
        ];

        for (const assignment of academicAssignments) {
            const user = createdUsers[assignment.username];
            const title = createdAcademicTitles[assignment.title];

            if (user && title) {
                const employee = await prisma.employee.findFirst({
                    where: { user_id: user.id }
                });

                if (employee) {
                    await prisma.employee_academic_title.upsert({
                        where: {
                            employee_id_academic_title_id: {
                                employee_id: employee.id,
                                academic_title_id: title.id
                            }
                        },
                        update: {},
                        create: {
                            employee_id: employee.id,
                            academic_title_id: title.id,
                            granted_date: new Date(),
                            status: 'active'
                        }
                    });

                    console.log(`  ✅ ${user.full_name} → ${title.title}`);
                }
            }
        }

        console.log('\n🎉 Hoàn thành import data chuẩn thiết kế!');
        console.log('\n📊 Tóm tắt:');
        console.log(`  🏢 Organizational Units: ${Object.keys(createdOrgUnits).length}`);
        console.log(`  👔 Job Positions: ${Object.keys(createdPositions).length}`);
        console.log(`  🎓 Academic Titles: ${Object.keys(createdAcademicTitles).length}`);
        console.log(`  👥 Users: ${Object.keys(createdUsers).length}`);

        console.log('\n🔑 Test accounts:');
        console.log('  👑 Admin: admin / 123456');
        console.log('  🎓 Rector: rector / 123456');
        console.log('  🏫 Dean ICT: dean_ict / 123456');
        console.log('  🏫 Dean SE: dean_se / 123456');
        console.log('  👨‍🏫 Lecturer: lecturer_1 / 123456');
        console.log('  👨‍💼 Staff: staff_1 / 123456');
        console.log('  🎓 Student: student_1 / 123456');

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importStandardData();
