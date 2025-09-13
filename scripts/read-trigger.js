const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function readTrigger() {
    try {
        console.log('🔍 Đọc trigger và function...\n');

        // 1. Đọc trigger details
        const triggers = await prisma.$queryRaw`
            SELECT 
                trigger_name,
                event_manipulation,
                action_timing,
                action_statement,
                action_orientation
            FROM information_schema.triggers 
            WHERE event_object_table = 'org_assignment' 
            AND event_object_schema = 'hr';
        `;

        console.log('📋 Triggers của bảng org_assignment:');
        triggers.forEach(trigger => {
            console.log(`  - ${trigger.trigger_name}`);
            console.log(`    Event: ${trigger.event_manipulation}`);
            console.log(`    Timing: ${trigger.action_timing}`);
            console.log(`    Statement: ${trigger.action_statement}`);
            console.log(`    Orientation: ${trigger.action_orientation}`);
            console.log('');
        });

        // 2. Đọc function log_hr_table_change
        const logFunction = await prisma.$queryRaw`
            SELECT 
                routine_name,
                routine_definition
            FROM information_schema.routines 
            WHERE routine_name = 'log_hr_table_change' 
            AND routine_schema = 'hr';
        `;

        console.log('📋 Function log_hr_table_change:');
        if (logFunction.length > 0) {
            console.log(`  - Name: ${logFunction[0].routine_name}`);
            console.log(`  - Definition: ${logFunction[0].routine_definition}`);
        } else {
            console.log('  - Không tìm thấy function');
        }

        // 3. Đọc function update_employment_updated_at_column
        const updateFunction = await prisma.$queryRaw`
            SELECT 
                routine_name,
                routine_definition
            FROM information_schema.routines 
            WHERE routine_name = 'update_employment_updated_at_column' 
            AND routine_schema = 'hr';
        `;

        console.log('\n📋 Function update_employment_updated_at_column:');
        if (updateFunction.length > 0) {
            console.log(`  - Name: ${updateFunction[0].routine_name}`);
            console.log(`  - Definition: ${updateFunction[0].routine_definition}`);
        } else {
            console.log('  - Không tìm thấy function');
        }

        // 4. Đọc source code của functions
        const functionSource = await prisma.$queryRaw`
            SELECT 
                proname as function_name,
                prosrc as source_code
            FROM pg_proc 
            WHERE proname IN ('log_hr_table_change', 'update_employment_updated_at_column')
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'hr');
        `;

        console.log('\n📋 Source code của functions:');
        functionSource.forEach(func => {
            console.log(`\n  - Function: ${func.function_name}`);
            console.log(`    Source: ${func.source_code}`);
        });

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

readTrigger();

