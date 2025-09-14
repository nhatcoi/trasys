'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    Typography,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    ExpandLess,
    ExpandMore,
    Group as GroupIcon,
    Assessment as AssessmentIcon,
    History as HistoryIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    VpnKey as VpnKeyIcon,
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    AccountTree as AccountTreeIcon,
    SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';

interface MenuItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
    permission?: string;
}

const menuItems: MenuItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        href: '/hr/dashboard',
        permission: 'hr.dashboard.view',
    },
    {
        key: 'overview',
        label: 'Tổng quan Đại học',
        icon: <BusinessIcon />,
        href: '/hr/university-overview',
        permission: 'hr.university_overview.view',
    },
    {
        key: 'org-structure',
        label: 'Cơ cấu Tổ chức',
        icon: <AccountTreeIcon />,
        href: '/hr/org-structure',
        permission: 'hr.org_structure.view',
    },
    {
        key: 'faculty',
        label: 'Giảng viên',
        icon: <SupervisorAccountIcon />,
        href: '/hr/faculty',
        permission: 'hr.faculty.view',
    },
    {
        key: 'hr-management',
        label: 'Quản lý Nhân sự',
        icon: <GroupIcon />,
        permission: 'hr.employees.view',
        children: [
            {
                key: 'employees',
                label: 'Nhân viên',
                icon: <PeopleIcon />,
                href: '/hr/employees',
                permission: 'hr.employees.view',
            },
            {
                key: 'qualifications',
                label: 'Bằng cấp',
                icon: <SchoolIcon />,
                href: '/hr/qualifications',
                permission: 'hr.qualifications.view',
            },
            {
                key: 'employments',
                label: 'Hợp đồng',
                icon: <WorkIcon />,
                href: '/hr/employments',
                permission: 'hr.employments.view',
            },
            {
                key: 'performance-reviews',
                label: 'Đánh giá hiệu suất',
                icon: <AssessmentIcon />,
                href: '/hr/performance-reviews',
                permission: 'hr.performance_reviews.view',
            },
            {
                key: 'employee-logs',
                label: 'Log nhân viên',
                icon: <HistoryIcon />,
                href: '/hr/employee-logs',
                permission: 'hr.employee_logs.view',
            }
        ],
    },
    {
        key: 'rbac',
        label: 'Phân quyền',
        icon: <SecurityIcon />,
        permission: 'hr.roles.view',
        children: [
            {
                key: 'roles',
                label: 'Vai trò',
                icon: <AdminPanelSettingsIcon />,
                href: '/hr/roles',
                permission: 'hr.roles.view',
            },
            {
                key: 'permissions',
                label: 'Quyền hạn',
                icon: <VpnKeyIcon />,
                href: '/hr/permissions',
                permission: 'hr.permissions.view',
            },
            {
                key: 'role-permissions',
                label: 'Vai trò - Quyền hạn',
                icon: <AssignmentIcon />,
                href: '/hr/role-permissions',
                permission: 'hr.role_permissions.view',
            },
            {
                key: 'user-roles',
                label: 'Người dùng - Vai trò',
                icon: <PersonIcon />,
                href: '/hr/user-roles',
                permission: 'hr.user_roles.view',
            },
        ],
    },
    {
        key: 'reports',
        label: 'Báo cáo',
        icon: <AssessmentIcon />,
        href: '/hr/reports',
        permission: 'hr.reports.view',
    },
    {
        key: 'profile',
        label: 'Hồ sơ',
        icon: <PersonIcon />,
        href: '/hr/profile',
        permission: 'hr.profile.view',
    },
];

export function NewSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const permissions = session?.user?.permissions || [];

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'hr-management': true,
        'rbac': false,
    });

    // Function to check if user has permission
    const hasPermission = (requiredPermission: string) => {
        return permissions.includes(requiredPermission);
    };

    const handleToggleSection = (key: string) => {
        setOpenSections(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        // Check permission first
        if (item.permission && !hasPermission(item.permission)) {
            return null;
        }

        const isActive = item.href ? pathname === item.href : false;
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
            const isOpen = openSections[item.key];

            return (
                <React.Fragment key={item.key}>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => handleToggleSection(item.key)}
                            sx={{
                                pl: 2 + level * 2,
                                color: '#ffffff',
                                borderRadius: '6px',
                                margin: '2px 8px',
                                minHeight: 44,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    transform: 'translateX(2px)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: '#ffffff',
                                        fontWeight: 500,
                                    },
                                }}
                            />
                            {isOpen ? <ExpandLess sx={{ color: '#ffffff' }} /> : <ExpandMore sx={{ color: '#ffffff' }} />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={isOpen} timeout="auto">
                        <Box
                            sx={{
                                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                                borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
                                marginLeft: 2,
                                marginRight: 1,
                                borderRadius: '0 8px 8px 0',
                                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.2)',
                                overflow: 'hidden',
                            }}
                        >
                            {item.children?.map(child => renderMenuItem(child, level + 1)).filter(Boolean)}
                        </Box>
                    </Collapse>
                </React.Fragment>
            );
        }

        return (
            <ListItem key={item.key} disablePadding>
                <ListItemButton
                    component={Link}
                    href={item.href || '#'}
                    sx={{
                        pl: 2 + level * 2,
                        color: '#ffffff',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        borderRadius: level > 0 ? '6px' : '0',
                        margin: level > 0 ? '1px 4px' : '0',
                        minHeight: 36,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                            transform: level > 0 ? 'translateX(2px)' : 'none',
                        },
                    }}
                >
                    <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        sx={{
                            '& .MuiListItemText-primary': {
                                color: '#ffffff',
                                fontWeight: 500,
                            },
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    backgroundColor: '#2e4c92',
                    color: '#ffffff',
                },
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <Box sx={{ padding: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        HR System
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

                {/* Menu Items */}
                <List sx={{ flexGrow: 1, paddingTop: 1 }}>
                    {menuItems.map(item => renderMenuItem(item)).filter(Boolean)}
                </List>
            </Box>
        </Drawer>
    );
}
