const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugOrgTree() {
    try {
        console.log('🔍 Debug Org Tree Data...\n');

        // 1. Test API endpoint
        console.log('📡 Testing API endpoint...');
        const response = await fetch('http://localhost:3002/api/org/units');
        const data = await response.json();

        if (data.success) {
            console.log('✅ API endpoint working');
            console.log(`📊 Total org units: ${data.data.length}`);

            // Check for assignments with positions
            let totalAssignments = 0;
            let assignmentsWithPositions = 0;

            data.data.forEach(unit => {
                if (unit.assignments) {
                    totalAssignments += unit.assignments.length;
                    unit.assignments.forEach(assignment => {
                        if (assignment.position) {
                            assignmentsWithPositions++;
                        }
                    });
                }
            });

            console.log(`📋 Total assignments: ${totalAssignments}`);
            console.log(`🎯 Assignments with positions: ${assignmentsWithPositions}`);

            // Show sample data
            const sampleUnit = data.data.find(unit => unit.assignments && unit.assignments.length > 0);
            if (sampleUnit) {
                console.log(`\n📝 Sample unit: ${sampleUnit.name}`);
                console.log(`   Assignments: ${sampleUnit.assignments.length}`);
                sampleUnit.assignments.forEach((assignment, index) => {
                    console.log(`   ${index + 1}. ${assignment.employee?.user?.full_name} - ${assignment.position?.title || 'No position'}`);
                });
            }

        } else {
            console.log('❌ API endpoint failed:', data.error);
        }

        // 2. Test direct database query
        console.log('\n🗄️  Testing direct database query...');
        const units = await prisma.orgUnit.findMany({
            include: {
                children: true,
                assignments: {
                    include: {
                        employee: {
                            include: {
                                user: true
                            }
                        },
                        position: true
                    }
                }
            },
        });

        console.log(`✅ Direct query successful: ${units.length} units`);

        // Check assignments with positions
        let dbTotalAssignments = 0;
        let dbAssignmentsWithPositions = 0;

        units.forEach(unit => {
            if (unit.assignments) {
                dbTotalAssignments += unit.assignments.length;
                unit.assignments.forEach(assignment => {
                    if (assignment.position) {
                        dbAssignmentsWithPositions++;
                    }
                });
            }
        });

        console.log(`📋 DB Total assignments: ${dbTotalAssignments}`);
        console.log(`🎯 DB Assignments with positions: ${dbAssignmentsWithPositions}`);

        // 3. Check specific Y Dược data
        console.log('\n🏥 Checking Y Dược data...');
        const yDuocUnit = units.find(unit => unit.name === 'Trường Y Dược');
        if (yDuocUnit) {
            console.log(`✅ Found Trường Y Dược: ${yDuocUnit.assignments.length} assignments`);
            yDuocUnit.assignments.forEach((assignment, index) => {
                console.log(`   ${index + 1}. ${assignment.employee?.user?.full_name} - ${assignment.position?.title || 'No position'} (${assignment.position?.code || 'No code'})`);
            });
        } else {
            console.log('❌ Trường Y Dược not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Chi tiết:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugOrgTree();

