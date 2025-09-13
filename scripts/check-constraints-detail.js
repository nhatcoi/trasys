const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConstraintsDetail() {
    try {
        console.log('🔍 Kiểm tra constraints chi tiết...\n');

        // 1. Kiểm tra constraints của bảng org_assignment
        const constraints = await prisma.$queryRaw`
            SELECT 
                conname as constraint_name,
                contype as constraint_type,
                pg_get_constraintdef(oid) as constraint_definition
            FROM pg_constraint 
            WHERE conrelid = 'hr.org_assignment'::regclass;
        `;

        console.log('📋 Constraints của bảng org_assignment:');
        constraints.forEach(constraint => {
            console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type}): ${constraint.constraint_definition}`);
        });

        // 2. Kiểm tra triggers
        const triggers = await prisma.$queryRaw`
            SELECT 
                trigger_name,
                event_manipulation,
                action_statement
            FROM information_schema.triggers 
            WHERE event_object_table = 'org_assignment' 
            AND event_object_schema = 'hr';
        `;

        console.log('\n📋 Triggers của bảng org_assignment:');
        if (triggers.length > 0) {
            triggers.forEach(trigger => {
                console.log(`  - ${trigger.trigger_name}: ${trigger.event_manipulation} -> ${trigger.action_statement}`);
            });
        } else {
            console.log('  - Không có triggers');
        }

        // 3. Kiểm tra cấu trúc bảng
        const tableStructure = await prisma.$queryRaw`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'org_assignment' 
            AND table_schema = 'hr'
            ORDER BY ordinal_position;
        `;

        console.log('\n📋 Cấu trúc bảng org_assignment:');
        tableStructure.forEach(column => {
            console.log(`  - ${column.column_name}: ${column.data_type} (nullable: ${column.is_nullable}, default: ${column.column_default || 'none'})`);
        });

        // 4. Thử insert đơn giản để test
        console.log('\n🔄 Thử insert đơn giản...');
        try {
            const testResult = await prisma.$executeRaw`
                INSERT INTO hr.org_assignment (
                    employee_id, 
                    org_unit_id, 
                    position_id, 
                    assignment_type, 
                    is_primary, 
                    allocation, 
                    start_date
                ) VALUES (
                    2,
                    28,
                    8,
                    'admin',
                    true,
                    1.00,
                    '2020-01-01'::date
                );
            `;
            console.log('✅ Insert thành công!');
        } catch (error) {
            console.log('❌ Lỗi insert:', error.message);
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkConstraintsDetail();

