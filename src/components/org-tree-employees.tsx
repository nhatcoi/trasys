'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Tree } from 'react-d3-tree';

interface OrgUnit {
    id: string;
    name: string;
    code: string | null;
    parent_id: string | null;
    type: string;
    status: string;
    level?: number;
    is_active?: boolean;
}

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
}

interface OrgUnitStats {
    orgUnit: OrgUnit;
    totalEmployees: number;
    activeEmployees: number;
    employees: Employee[];
    children: OrgUnitStats[];
}

interface OrgTreeEmployeesProps {
    data: OrgUnitStats;
    onBack: () => void;
}

const OrgTreeEmployees: React.FC<OrgTreeEmployeesProps> = ({ data, onBack }) => {
    // Convert data to react-d3-tree format
    const convertToD3TreeData = (node: OrgUnitStats): any => {
        return {
            name: node.orgUnit.name,
            attributes: {
                id: node.orgUnit.id,
                code: node.orgUnit.code,
                type: node.orgUnit.type,
                level: node.orgUnit.level,
                totalEmployees: node.totalEmployees,
                activeEmployees: node.activeEmployees,
                employees: node.employees,
            },
            children: node.children.map(convertToD3TreeData),
        };
    };

    const d3TreeData = convertToD3TreeData(data);

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
                    Quay lại cơ cấu tổ chức
                </Button>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2' }}>
                    Giảng viên: {data.orgUnit.name}
                </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 'calc(100vh - 150px)', overflow: 'auto' }}>
                <Tree
                    data={d3TreeData}
                    orientation="vertical"
                    pathFunc="step"
                    translate={{ x: 600, y: 50 }}
                    nodeSize={{ x: 300, y: 200 }}
                    renderCustomNodeElement={(rd3tProps) => {
                        const { nodeDatum } = rd3tProps;
                        const isRoot = nodeDatum.attributes.id === data.orgUnit.id;
                        const hasEmployees = nodeDatum.attributes.employees && nodeDatum.attributes.employees.length > 0;

                        return (
                            <g>
                                <rect
                                    width="280"
                                    height="180"
                                    x="-140"
                                    y="-90"
                                    fill={isRoot ? '#1976d2' : '#ffffff'}
                                    stroke="#1976d2"
                                    strokeWidth="2"
                                    rx="8"
                                    ry="8"
                                />
                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y="-60"
                                    fontSize="16"
                                    fontWeight="bold"
                                    fill={isRoot ? 'white' : '#1976d2'}
                                    stroke="none"
                                >
                                    {nodeDatum.name}
                                </text>
                                {nodeDatum.attributes.code && (
                                    <text
                                        textAnchor="middle"
                                        x="0"
                                        y="-40"
                                        fontSize="12"
                                        fill={isRoot ? 'rgba(255,255,255,0.9)' : '#666'}
                                        stroke="none"
                                    >
                                        Mã: {nodeDatum.attributes.code}
                                    </text>
                                )}
                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y="-20"
                                    fontSize="12"
                                    fill={isRoot ? 'rgba(255,255,255,0.9)' : '#1976d2'}
                                    stroke="none"
                                >
                                    {nodeDatum.attributes.type === 'U' ? 'Đại học' :
                                        nodeDatum.attributes.type === 'S' ? 'Trường' :
                                            nodeDatum.attributes.type === 'F' ? 'Khoa' :
                                                nodeDatum.attributes.type === 'D' ? 'Bộ môn' :
                                                    nodeDatum.attributes.type === 'I' ? 'Viện' : 'Đơn vị'}
                                </text>
                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y="0"
                                    fontSize="12"
                                    fill={isRoot ? 'rgba(255,255,255,0.9)' : '#2e7d32'}
                                    stroke="none"
                                >
                                    {nodeDatum.attributes.totalEmployees} giảng viên
                                </text>
                                <text
                                    textAnchor="middle"
                                    x="0"
                                    y="20"
                                    fontSize="12"
                                    fill={isRoot ? 'rgba(255,255,255,0.9)' : '#666'}
                                    stroke="none"
                                >
                                    {nodeDatum.attributes.activeEmployees} hoạt động
                                </text>

                                {/* Employee count only */}
                                {hasEmployees && (
                                    <text
                                        textAnchor="middle"
                                        x="0"
                                        y="40"
                                        fontSize="10"
                                        fill={isRoot ? 'rgba(255,255,255,0.8)' : '#666'}
                                        stroke="none"
                                    >
                                        {nodeDatum.attributes.employees.length} giảng viên
                                    </text>
                                )}
                            </g>
                        );
                    }}
                />
            </Box>

            {/* Employee Tree Section */}
            <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                    Cơ cấu giảng viên
                </Typography>

                {/* Function to create employee tree */}
                {(() => {
                    const getAllEmployees = (node: OrgUnitStats): Employee[] => {
                        let employees = [...node.employees];
                        node.children.forEach(child => {
                            employees = employees.concat(getAllEmployees(child));
                        });
                        return employees;
                    };

                    let allEmployees = getAllEmployees(data);

                    // Mock data for testing if no employees found
                    if (allEmployees.length === 0) {
                        allEmployees = [
                            {
                                id: 'emp1',
                                employee_no: 'EMP001',
                                employment_type: 'Trưởng khoa',
                                status: 'active',
                                user: {
                                    id: 'user1',
                                    username: 'dean001',
                                    full_name: 'Nguyễn Văn Trưởng',
                                    email: 'truong@example.com'
                                }
                            },
                            {
                                id: 'emp2',
                                employee_no: 'EMP002',
                                employment_type: 'Phó khoa',
                                status: 'active',
                                user: {
                                    id: 'user2',
                                    username: 'vice001',
                                    full_name: 'Trần Thị Phó',
                                    email: 'pho@example.com'
                                }
                            },
                            {
                                id: 'emp3',
                                employee_no: 'EMP003',
                                employment_type: 'Giảng viên',
                                status: 'active',
                                user: {
                                    id: 'user3',
                                    username: 'lecturer001',
                                    full_name: 'Lê Văn Giảng',
                                    email: 'giang@example.com'
                                }
                            },
                            {
                                id: 'emp4',
                                employee_no: 'EMP004',
                                employment_type: 'Giảng viên',
                                status: 'active',
                                user: {
                                    id: 'user4',
                                    username: 'lecturer002',
                                    full_name: 'Phạm Thị Viên',
                                    email: 'vien@example.com'
                                }
                            },
                            {
                                id: 'emp5',
                                employee_no: 'EMP005',
                                employment_type: 'Nhân viên hành chính',
                                status: 'active',
                                user: {
                                    id: 'user5',
                                    username: 'admin001',
                                    full_name: 'Hoàng Văn Hành',
                                    email: 'hanh@example.com'
                                }
                            }
                        ];
                    }

                    // Debug log
                    console.log('OrgTreeEmployees - All employees:', allEmployees);
                    console.log('OrgTreeEmployees - Data structure:', data);
                    console.log('OrgTreeEmployees - Employee count:', allEmployees.length);
                    console.log('OrgTreeEmployees - First employee:', allEmployees[0]);

                    if (allEmployees.length === 0) {
                        return (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" sx={{ color: '#666' }}>
                                    Không có giảng viên nào trong đơn vị này
                                </Typography>
                            </Box>
                        );
                    }

                    // Sort employees by position/role (trưởng khoa -> giảng viên bình thường)
                    const sortedEmployees = allEmployees.sort((a, b) => {
                        const getPositionLevel = (employee: Employee) => {
                            const position = employee.employment_type?.toLowerCase() || '';
                            if (position.includes('trưởng') || position.includes('head') || position.includes('dean')) return 1;
                            if (position.includes('phó') || position.includes('deputy') || position.includes('vice')) return 2;
                            if (position.includes('giảng viên') || position.includes('lecturer') || position.includes('teacher')) return 3;
                            return 4;
                        };
                        return getPositionLevel(a) - getPositionLevel(b);
                    });

                    // Create tree structure for employees
                    const createEmployeeTree = (employees: Employee[]) => {
                        const leaders = employees.filter(emp => {
                            const position = emp.employment_type?.toLowerCase() || '';
                            return position.includes('trưởng') || position.includes('head') || position.includes('dean');
                        });

                        const deputies = employees.filter(emp => {
                            const position = emp.employment_type?.toLowerCase() || '';
                            return position.includes('phó') || position.includes('deputy') || position.includes('vice');
                        });

                        const lecturers = employees.filter(emp => {
                            const position = emp.employment_type?.toLowerCase() || '';
                            return position.includes('giảng viên') || position.includes('lecturer') || position.includes('teacher');
                        });

                        const others = employees.filter(emp => {
                            const position = emp.employment_type?.toLowerCase() || '';
                            return !position.includes('trưởng') && !position.includes('head') && !position.includes('dean') &&
                                !position.includes('phó') && !position.includes('deputy') && !position.includes('vice') &&
                                !position.includes('giảng viên') && !position.includes('lecturer') && !position.includes('teacher');
                        });

                        // Create tree structure
                        const treeData = {
                            name: data.orgUnit.name,
                            attributes: {
                                id: 'root',
                                type: 'organization',
                                totalEmployees: employees.length,
                            },
                            children: [
                                // Leaders (Trưởng khoa)
                                ...leaders.map(emp => ({
                                    name: emp.user?.full_name || 'N/A',
                                    attributes: {
                                        id: emp.id,
                                        position: emp.employment_type || 'Trưởng khoa',
                                        employee_no: emp.employee_no,
                                        email: emp.user?.email,
                                        status: emp.status,
                                        type: 'leader',
                                    },
                                    children: []
                                })),
                                // Deputies (Phó khoa)
                                ...deputies.map(emp => ({
                                    name: emp.user?.full_name || 'N/A',
                                    attributes: {
                                        id: emp.id,
                                        position: emp.employment_type || 'Phó khoa',
                                        employee_no: emp.employee_no,
                                        email: emp.user?.email,
                                        status: emp.status,
                                        type: 'deputy',
                                    },
                                    children: []
                                })),
                                // Lecturers (Giảng viên)
                                ...lecturers.map(emp => ({
                                    name: emp.user?.full_name || 'N/A',
                                    attributes: {
                                        id: emp.id,
                                        position: emp.employment_type || 'Giảng viên',
                                        employee_no: emp.employee_no,
                                        email: emp.user?.email,
                                        status: emp.status,
                                        type: 'lecturer',
                                    },
                                    children: []
                                })),
                                // Others
                                ...others.map(emp => ({
                                    name: emp.user?.full_name || 'N/A',
                                    attributes: {
                                        id: emp.id,
                                        position: emp.employment_type || 'Nhân viên',
                                        employee_no: emp.employee_no,
                                        email: emp.user?.email,
                                        status: emp.status,
                                        type: 'other',
                                    },
                                    children: []
                                }))
                            ]
                        };

                        return treeData;
                    };

                    const employeeTreeData = createEmployeeTree(sortedEmployees);

                    // Debug tree data
                    console.log('OrgTreeEmployees - Employee tree data:', employeeTreeData);
                    console.log('OrgTreeEmployees - Tree children count:', employeeTreeData.children.length);

                    return (
                        <Box sx={{ width: '100%', height: '600px', overflow: 'auto' }}>
                            <Tree
                                data={employeeTreeData}
                                orientation="vertical"
                                pathFunc="step"
                                translate={{ x: 600, y: 50 }}
                                nodeSize={{ x: 300, y: 150 }}
                                renderCustomNodeElement={(rd3tProps) => {
                                    const { nodeDatum } = rd3tProps;
                                    const isRoot = nodeDatum.attributes.id === 'root';
                                    const isLeader = nodeDatum.attributes.type === 'leader';
                                    const isDeputy = nodeDatum.attributes.type === 'deputy';
                                    const isLecturer = nodeDatum.attributes.type === 'lecturer';

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

                                            {!isRoot && (
                                                <text
                                                    textAnchor="middle"
                                                    x="0"
                                                    y="0"
                                                    fontSize="12"
                                                    fill={isLeader || isDeputy ? 'rgba(255,255,255,0.9)' : '#666'}
                                                    stroke="none"
                                                >
                                                    {nodeDatum.attributes.position}
                                                </text>
                                            )}

                                            {!isRoot && nodeDatum.attributes.employee_no && (
                                                <text
                                                    textAnchor="middle"
                                                    x="0"
                                                    y="15"
                                                    fontSize="10"
                                                    fill={isLeader || isDeputy ? 'rgba(255,255,255,0.8)' : '#666'}
                                                    stroke="none"
                                                >
                                                    Mã: {nodeDatum.attributes.employee_no}
                                                </text>
                                            )}

                                            {!isRoot && (
                                                <text
                                                    textAnchor="middle"
                                                    x="0"
                                                    y={nodeDatum.attributes.employee_no ? "30" : "15"}
                                                    fontSize="10"
                                                    fill={isLeader || isDeputy ? 'rgba(255,255,255,0.8)' : '#666'}
                                                    stroke="none"
                                                >
                                                    {nodeDatum.attributes.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                </text>
                                            )}
                                        </g>
                                    );
                                }}
                            />
                        </Box>
                    );
                })()}
            </Box>
        </Box>
    );
};

export default OrgTreeEmployees;