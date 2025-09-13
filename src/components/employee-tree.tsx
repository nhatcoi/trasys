'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Tree } from 'react-d3-tree';

interface Employee {
    id: string;
    employee_no: string | null;
    employment_type: string | null;
    status: string | null;
    user: {
        id: string;
        username: string;
        full_name: string;
        email: string | null;
    } | null;
    position?: {
        id: string;
        title: string;
        code: string;
    } | null;
}

interface EmployeeTreeProps {
    employees: Employee[];
    orgUnitName: string;
    onBack: () => void;
}

const EmployeeTree: React.FC<EmployeeTreeProps> = ({ employees, orgUnitName, onBack }) => {

    // Sort employees by position/role (trưởng khoa -> giảng viên bình thường)
    const sortedEmployees = employees.sort((a, b) => {
        const getPositionLevel = (employee: Employee) => {
            const position = employee.position?.title?.toLowerCase() || employee.employment_type?.toLowerCase() || '';
            if (position.includes('hiệu trưởng') || position.includes('rector')) return 1;
            if (position.includes('phó hiệu trưởng') || position.includes('vice rector')) return 2;
            if (position.includes('trưởng khoa') || position.includes('head') || position.includes('dean')) return 3;
            if (position.includes('phó') || position.includes('deputy') || position.includes('vice')) return 4;
            if (position.includes('giảng viên') || position.includes('lecturer') || position.includes('teacher')) return 5;
            return 6;
        };
        return getPositionLevel(a) - getPositionLevel(b);
    });

    // Create tree structure for employees
    const createEmployeeTree = (employees: Employee[]) => {
        const leaders = employees.filter(emp => {
            const position = emp.position?.title?.toLowerCase() || emp.employment_type?.toLowerCase() || '';
            const name = emp.user?.full_name?.toLowerCase() || '';
            return position.includes('hiệu trưởng') || position.includes('rector') ||
                position.includes('trưởng khoa') || position.includes('head') || position.includes('dean') ||
                name.includes('trưởng') || name.includes('gs.ts');
        });

        const deputies = employees.filter(emp => {
            const position = emp.position?.title?.toLowerCase() || emp.employment_type?.toLowerCase() || '';
            const name = emp.user?.full_name?.toLowerCase() || '';
            return position.includes('phó hiệu trưởng') || position.includes('vice rector') ||
                position.includes('phó') || position.includes('deputy') || position.includes('vice') ||
                name.includes('phó') || name.includes('pgs.ts');
        });

        const lecturers = employees.filter(emp => {
            const position = emp.position?.title?.toLowerCase() || emp.employment_type?.toLowerCase() || '';
            return position.includes('giảng viên') || position.includes('lecturer') || position.includes('teacher');
        });

        const others = employees.filter(emp => {
            const position = emp.position?.title?.toLowerCase() || emp.employment_type?.toLowerCase() || '';
            return !position.includes('hiệu trưởng') && !position.includes('rector') &&
                !position.includes('trưởng khoa') && !position.includes('head') && !position.includes('dean') &&
                !position.includes('phó hiệu trưởng') && !position.includes('vice rector') &&
                !position.includes('phó') && !position.includes('deputy') && !position.includes('vice') &&
                !position.includes('giảng viên') && !position.includes('lecturer') && !position.includes('teacher');
        });

        // Find the main leader (trưởng khoa) to be the root
        const mainLeader = leaders[0] || deputies[0] || lecturers[0] || others[0];

        if (!mainLeader) {
            // Fallback if no employees
            return {
                name: 'Không có giảng viên',
                attributes: {
                    id: 'root',
                    type: 'empty',
                    totalEmployees: 0,
                },
                children: []
            };
        }

        // Create tree structure with main leader as root
        const treeData = {
            name: mainLeader.user?.full_name || 'N/A',
            attributes: {
                id: mainLeader.id,
                position: mainLeader.position?.title || mainLeader.employment_type || 'Trưởng khoa',
                employee_no: mainLeader.employee_no || '',
                email: mainLeader.user?.email || '',
                status: mainLeader.status || '',
                type: 'leader',
                totalEmployees: employees.length,
            },
            children: [
                // Other leaders (if multiple)
                ...leaders.slice(1).map(emp => ({
                    name: emp.user?.full_name || 'N/A',
                    attributes: {
                        id: emp.id,
                        position: emp.position?.title || emp.employment_type || 'Trưởng khoa',
                        employee_no: emp.employee_no || '',
                        email: emp.user?.email || '',
                        status: emp.status || '',
                        type: 'leader',
                    },
                    children: []
                })),
                // Deputies (Phó khoa)
                ...deputies.map(emp => ({
                    name: emp.user?.full_name || 'N/A',
                    attributes: {
                        id: emp.id,
                        position: emp.position?.title || emp.employment_type || 'Phó khoa',
                        employee_no: emp.employee_no || '',
                        email: emp.user?.email || '',
                        status: emp.status || '',
                        type: 'deputy',
                    },
                    children: []
                })),
                // Lecturers (Giảng viên)
                ...lecturers.map(emp => ({
                    name: emp.user?.full_name || 'N/A',
                    attributes: {
                        id: emp.id,
                        position: emp.position?.title || emp.employment_type || 'Giảng viên',
                        employee_no: emp.employee_no || '',
                        email: emp.user?.email || '',
                        status: emp.status || '',
                        type: 'lecturer',
                    },
                    children: []
                })),
                // Others
                ...others.map(emp => ({
                    name: emp.user?.full_name || 'N/A',
                    attributes: {
                        id: emp.id,
                        position: emp.position?.title || emp.employment_type || 'Nhân viên',
                        employee_no: emp.employee_no || '',
                        email: emp.user?.email || '',
                        status: emp.status || '',
                        type: 'other',
                    },
                    children: []
                }))
            ]
        };

        return treeData;
    };

    const employeeTreeData = createEmployeeTree(sortedEmployees);

    if (employees.length === 0) {
        return (
            <Box
                sx={{
                    width: '100%',
                    overflow: 'auto',
                    p: 3,
                    backgroundColor: '#fafafa',
                    minHeight: '100vh',
                }}
            >
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={onBack}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    >
                        Quay lại
                    </Button>
                    <Typography variant="h4" component="h1" sx={{ color: '#1976d2' }}>
                        Giảng viên: {orgUnitName}
                    </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#666' }}>
                        Không có giảng viên nào trong đơn vị này
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                overflow: 'auto',
                p: 3,
                backgroundColor: '#fafafa',
                minHeight: '100vh',
            }}
        >
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    variant="outlined"
                    sx={{ mb: 2 }}
                >
                    Quay lại
                </Button>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2' }}>
                    {orgUnitName}
                </Typography>
            </Box>

            <Box sx={{ width: '100%', height: '600px', overflow: 'auto' }}>
                <Tree
                    data={employeeTreeData}
                    orientation="vertical"
                    pathFunc="step"
                    translate={{ x: 600, y: 50 }}
                    nodeSize={{ x: 300, y: 150 }}
                    renderCustomNodeElement={(rd3tProps) => {
                        const { nodeDatum } = rd3tProps;
                        const isRoot = !nodeDatum.parent; // Root node is the one without parent
                        const isLeader = nodeDatum.attributes?.type === 'leader';
                        const isDeputy = nodeDatum.attributes?.type === 'deputy';
                        const isLecturer = nodeDatum.attributes?.type === 'lecturer';

                        // Different sizes based on position
                        const width = isRoot ? 350 : isLeader ? 320 : isDeputy ? 280 : 250;
                        const height = isRoot ? 120 : isLeader ? 100 : isDeputy ? 90 : 80;

                        return (
                            <g>
                                <rect
                                    width={width}
                                    height={height}
                                    x={-width / 2}
                                    y={-height / 2}
                                    fill={isRoot ? '#1976d2' : isLeader ? '#2e7d32' : isDeputy ? '#ff9800' : '#ffffff'}
                                    stroke={isRoot ? '#1976d2' : isLeader ? '#2e7d32' : isDeputy ? '#ff9800' : '#1976d2'}
                                    strokeWidth="2"
                                    rx="8"
                                    ry="8"
                                />
                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y={isRoot ? -20 : -15}
                                    fontSize={isRoot ? "18" : isLeader ? "16" : "14"}
                                    fontWeight="bold"
                                    fill={isRoot || isLeader || isDeputy ? 'white' : '#1976d2'}
                                    stroke="none"
                                >
                                    {nodeDatum.name}
                                </text>

                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y="0"
                                    fontSize="12"
                                    fill={isRoot || isLeader || isDeputy ? 'rgba(255,255,255,0.9)' : '#666'}
                                    stroke="none"
                                >
                                    {nodeDatum.attributes?.position || nodeDatum.attributes?.employment_type || 'Giảng viên'}
                                </text>

                                {nodeDatum.attributes?.employee_no && (
                                    <text
                                        textAnchor="middle"
                                        x="0"
                                        y="15"
                                        fontSize="10"
                                        fill={isRoot || isLeader || isDeputy ? 'rgba(255,255,255,0.8)' : '#666'}
                                        stroke="none"
                                    >
                                        Mã: {nodeDatum.attributes?.employee_no}
                                    </text>
                                )}

                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y={nodeDatum.attributes?.employee_no ? "30" : "15"}
                                    fontSize="10"
                                    fill={isRoot || isLeader || isDeputy ? 'rgba(255,255,255,0.8)' : '#666'}
                                    stroke="none"
                                >
                                    {nodeDatum.attributes?.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                </text>
                            </g>
                        );
                    }}
                />
            </Box>
        </Box>
    );
};

export default EmployeeTree;
