'use client';

import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
} from '@mui/material';
import {
    Business as BusinessIcon,
    School as SchoolIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

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

interface OrgTreeOverviewProps {
    data: OrgUnitStats[];
    onSelectSchool: (schoolId: string) => void;
}

const OrgTreeOverview: React.FC<OrgTreeOverviewProps> = ({ data, onSelectSchool }) => {
    // Filter to only show root level units (universities/schools)
    const rootLevelUnits = data.filter(node => node.orgUnit.level === 1);

    const renderSchoolNode = (node: OrgUnitStats) => {
        const isRoot = node.orgUnit.level === 1;
        const hasChildren = node.children.length > 0;

        return (
            <Box key={node.orgUnit.id} sx={{ position: 'relative' }}>
                {/* School Card */}
                <Card
                    sx={{
                        minWidth: 280,
                        maxWidth: 350,
                        width: { xs: 280, sm: 320, md: 350 },
                        backgroundColor: isRoot ? '#1976d2' : '#ffffff',
                        color: isRoot ? 'white' : 'text.primary',
                        border: isRoot ? 'none' : '2px solid #1976d2',
                        boxShadow: isRoot ? 4 : 2,
                        borderRadius: 3,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        flexShrink: 0, // Prevent cards from shrinking
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: isRoot ? 6 : 4,
                        },
                    }}
                    onClick={() => onSelectSchool(node.orgUnit.id)}
                >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <SchoolIcon sx={{ mr: 2, fontSize: 32 }} />
                            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                {node.orgUnit.name}
                            </Typography>
                        </Box>

                        {node.orgUnit.code && (
                            <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                                Mã: {node.orgUnit.code}
                            </Typography>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                            <Chip
                                label={node.orgUnit.type === 'U' ? 'Đại học' :
                                    node.orgUnit.type === 'S' ? 'Trường' :
                                        node.orgUnit.type === 'I' ? 'Viện' : 'Đơn vị'}
                                size="medium"
                                color={isRoot ? 'secondary' : 'primary'}
                                sx={{
                                    backgroundColor: isRoot ? 'rgba(255,255,255,0.2)' : undefined,
                                    color: isRoot ? 'white' : undefined,
                                }}
                            />
                            <Chip
                                label={`${node.totalEmployees} giảng viên`}
                                size="medium"
                                color={isRoot ? 'secondary' : 'success'}
                                sx={{
                                    backgroundColor: isRoot ? 'rgba(255,255,255,0.2)' : undefined,
                                    color: isRoot ? 'white' : undefined,
                                }}
                            />
                        </Box>

                        <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                            {node.activeEmployees} hoạt động
                        </Typography>

                        {/* Departments Summary */}
                        {hasChildren && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                                    Các khoa/phòng ban:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                    {node.children.slice(0, 3).map((child) => (
                                        <Chip
                                            key={child.orgUnit.id}
                                            label={child.orgUnit.name}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                borderColor: isRoot ? 'rgba(255,255,255,0.5)' : undefined,
                                                color: isRoot ? 'white' : undefined,
                                            }}
                                        />
                                    ))}
                                    {node.children.length > 3 && (
                                        <Chip
                                            label={`+${node.children.length - 3} khác`}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                borderColor: isRoot ? 'rgba(255,255,255,0.5)' : undefined,
                                                color: isRoot ? 'white' : undefined,
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        )}

                        {/* View Details Button */}
                        <Button
                            variant={isRoot ? 'outlined' : 'contained'}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                mt: 2,
                                color: isRoot ? 'white' : undefined,
                                borderColor: isRoot ? 'white' : undefined,
                                '&:hover': {
                                    backgroundColor: isRoot ? 'rgba(255,255,255,0.1)' : undefined,
                                    borderColor: isRoot ? 'white' : undefined,
                                },
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectSchool(node.orgUnit.id);
                            }}
                        >
                            Xem chi tiết
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                width: '100%',
                overflow: 'auto',
                p: 4,
                backgroundColor: '#f8f9fa',
                minHeight: '100vh',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                }}
            >
                <Typography variant="h3" component="h1" sx={{ textAlign: 'center', mb: 2, color: '#1976d2' }}>
                    Tổng quan các trường/khoa
                </Typography>

                <Typography variant="h6" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
                    Chọn một trường để xem chi tiết cơ cấu tổ chức
                </Typography>

                {/* Horizontal scrollable container */}
                <Box
                    sx={{
                        width: '100%',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        pb: 2,
                        '&::-webkit-scrollbar': {
                            height: 8,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1',
                            borderRadius: 4,
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#1976d2',
                            borderRadius: 4,
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            },
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 4,
                            justifyContent: 'flex-start',
                            minWidth: 'fit-content',
                            px: 2,
                        }}
                    >
                        {rootLevelUnits.map((school) => renderSchoolNode(school))}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default OrgTreeOverview;
