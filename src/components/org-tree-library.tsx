'use client';

import React from 'react';
import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Business as BusinessIcon, People as PeopleIcon } from '@mui/icons-material';
import { Tree } from 'react-d3-tree';

interface OrgUnit {
    id: string;
    name: string;
    code: string | null;
    level: number | null;
    parent_id: string | null;
}

interface Employee {
    id: string;
    user_id: string;
    org_unit_id: string;
    position: string | null;
    employment_type: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    user: {
        id: string;
        email: string;
        full_name: string;
        phone: string | null;
        address: string | null;
        dob: string | null;
        gender: string | null;
    };
}

interface OrgUnitStats {
    orgUnit: OrgUnit;
    employees: Employee[];
    totalEmployees: number;
    activeEmployees: number;
    children: OrgUnitStats[];
}

interface OrgTreeLibraryProps {
    data: OrgUnitStats;
    onBack: () => void;
    onViewEmployees?: (orgUnitId: string, orgUnitName: string) => void;
}

const OrgTreeLibrary: React.FC<OrgTreeLibraryProps> = ({ data, onBack, onViewEmployees }) => {
    // Convert data to react-d3-tree format
    const convertToD3TreeData = (node: OrgUnitStats): any => {
        const hasEmployees = node.employees.length > 0 && node.totalEmployees > 0;

        return {
            name: node.orgUnit.name,
            attributes: {
                id: node.orgUnit.id,
                code: node.orgUnit.code,
                level: node.orgUnit.level,
                totalEmployees: node.totalEmployees,
                activeEmployees: node.activeEmployees,
                hasEmployees: hasEmployees,
            },
            children: node.children.map(convertToD3TreeData),
        };
    };

    const d3TreeData = convertToD3TreeData(data);

    // Debug log to see the data structure
    console.log('OrgTreeLibrary data:', data);
    console.log('Converted d3TreeData:', d3TreeData);

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
                    Quay lại tổng quan
                </Button>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2' }}>
                    Cơ cấu tổ chức: {data.orgUnit.name}
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
                        const hasEmployeesToShow = nodeDatum.attributes.totalEmployees > 0 && onViewEmployees;

                        // Debug log
                        console.log('Node:', nodeDatum.name, 'Total employees:', nodeDatum.attributes.totalEmployees, 'Has employees to show:', hasEmployeesToShow);

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
                                    Cấp {nodeDatum.attributes.level || 'N/A'}
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
                                {hasEmployeesToShow && (
                                    <rect
                                        width="120"
                                        height="24"
                                        x="-60"
                                        y="35"
                                        fill="transparent"
                                        stroke={isRoot ? 'rgba(255,255,255,0.5)' : '#1976d2'}
                                        strokeWidth="1"
                                        rx="4"
                                        ry="4"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onViewEmployees(nodeDatum.attributes.id, nodeDatum.name)}
                                    />
                                )}
                                {hasEmployeesToShow && (
                                    <text
                                        textAnchor="middle"
                                        x="0"
                                        y="50"
                                        fontSize="10"
                                        fill={isRoot ? 'white' : '#1976d2'}
                                        stroke="none"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onViewEmployees(nodeDatum.attributes.id, nodeDatum.name)}
                                    >
                                        Xem {nodeDatum.attributes.totalEmployees} giảng viên
                                    </text>
                                )}
                            </g>
                        );
                    }}
                />
            </Box>
        </Box>
    );
};

export default OrgTreeLibrary;