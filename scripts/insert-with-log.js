const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertWithLog() {
    try {
        console.log('🚀 Bắt đầu insert data với log...\n');

        // 1. Disable trigger trước
        console.log('⏸️  Disable trigger...');
        await prisma.$executeRaw`ALTER TABLE hr.org_assignment DISABLE TRIGGER trg_hr_org_assignment_log;`;

        // 2. Insert data
        console.log('📝 Inserting org assignments...');

        const assignments = [
            // Hiệu trưởng Trường Y Dược
            { employee_id: 3, org_unit_id: 28, position_id: 8, assignment_type: 'admin', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },

            // Phó Hiệu trưởng Trường Y Dược  
            { employee_id: 4, org_unit_id: 28, position_id: 9, assignment_type: 'admin', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },

            // Trưởng khoa Dược
            { employee_id: 5, org_unit_id: 29, position_id: 1, assignment_type: 'admin', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },

            // Trưởng khoa Điều dưỡng
            { employee_id: 6, org_unit_id: 30, position_id: 1, assignment_type: 'admin', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },

            // Giảng viên Khoa Dược
            { employee_id: 7, org_unit_id: 29, position_id: 5, assignment_type: 'academic', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },
            { employee_id: 8, org_unit_id: 29, position_id: 5, assignment_type: 'academic', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },

            // Giảng viên Khoa Điều dưỡng
            { employee_id: 2, org_unit_id: 30, position_id: 5, assignment_type: 'academic', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') },
            { employee_id: 9, org_unit_id: 30, position_id: 5, assignment_type: 'academic', is_primary: true, allocation: 1.00, start_date: new Date('2020-01-01') }
        ];

        for (const assignment of assignments) {
            const result = await prisma.orgAssignment.create({
                data: assignment
            });
            console.log(`✅ Created assignment ID: ${result.id} for employee ${assignment.employee_id}`);
        }

        // 3. Enable trigger lại
        console.log('\n▶️  Enable trigger...');
        await prisma.$executeRaw`ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;`;

        // 4. Insert log records manually
        console.log('\n📋 Inserting log records...');

        const logRecords = [
            { employee_id: 3, action: 'CREATE', entity_type: 'org_assignments', entity_id: 1, new_value: JSON.stringify(assignments[0]), actor_id: null },
            { employee_id: 4, action: 'CREATE', entity_type: 'org_assignments', entity_id: 2, new_value: JSON.stringify(assignments[1]), actor_id: null },
            { employee_id: 5, action: 'CREATE', entity_type: 'org_assignments', entity_id: 3, new_value: JSON.stringify(assignments[2]), actor_id: null },
            { employee_id: 6, action: 'CREATE', entity_type: 'org_assignments', entity_id: 4, new_value: JSON.stringify(assignments[3]), actor_id: null },
            { employee_id: 7, action: 'CREATE', entity_type: 'org_assignments', entity_id: 5, new_value: JSON.stringify(assignments[4]), actor_id: null },
            { employee_id: 8, action: 'CREATE', entity_type: 'org_assignments', entity_id: 6, new_value: JSON.stringify(assignments[5]), actor_id: null },
            { employee_id: 2, action: 'CREATE', entity_type: 'org_assignments', entity_id: 7, new_value: JSON.stringify(assignments[6]), actor_id: null },
            { employee_id: 9, action: 'CREATE', entity_type: 'org_assignments', entity_id: 8, new_value: JSON.stringify(assignments[7]), actor_id: null }
        ];

        for (const log of logRecords) {
            await prisma.$executeRaw`
                INSERT INTO hr.employee_log (
                    employee_id, action, entity_type, entity_id,
                    old_value, new_value, actor_id, created_at
                ) VALUES (
                    ${log.employee_id}, ${log.action}, ${log.entity_type}, ${log.entity_id},
                    NULL, ${log.new_value}, ${log.actor_id}, NOW()
                )
            `;
            console.log(`📝 Created log for employee ${log.employee_id}`);
        }

        console.log('\n🎉 Hoàn thành! Đã insert cả data và log.');

        // 5. Verify
        console.log('\n🔍 Verification...');
        const count = await prisma.orgAssignment.count({
            where: {
                org_unit_id: {
                    in: [28, 29, 30]
                }
            }
        });
        console.log(`📊 Total assignments created: ${count}`);

        const logCount = await prisma.$queryRaw`
            SELECT COUNT(*) as count FROM hr.employee_log 
            WHERE entity_type = 'org_assignments' 
            AND action = 'CREATE'
        `;
        console.log(`📊 Total log records created: ${logCount[0].count}`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);

        // Try to enable trigger again if something went wrong
        try {
            await prisma.$executeRaw`ALTER TABLE hr.org_assignment ENABLE TRIGGER trg_hr_org_assignment_log;`;
            console.log('🔄 Đã enable lại trigger sau khi có lỗi');
        } catch (triggerError) {
            console.error('❌ Không thể enable trigger:', triggerError.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

insertWithLog();
