'use client';

import React, { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    Divider,
    Collapse,
    IconButton,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    School as SchoolIcon,
    AccountTree as AccountTreeIcon,
    Person as PersonIcon,
    ExpandLess,
    ExpandMore,
    PersonAdd as PersonAddIcon,
    Work as WorkIcon,
    Assignment as AssignmentIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 280;

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        href: '/hr/dashboard',
    },
    {
        text: 'Tổng quan',
        icon: <SchoolIcon />,
        children: [
            {
                text: 'Tổng quan Đại học',
                icon: <SchoolIcon />,
                href: '/hr/university-overview',
            },
            {
                text: 'Cơ cấu Tổ chức',
                icon: <AccountTreeIcon />,
                href: '/hr/org-structure',
            },
        ],
    },
    {
        text: 'Quản lý Nhân sự',
        icon: <PeopleIcon />,
        children: [
            {
                text: 'Danh sách Nhân viên',
                icon: <PersonIcon />,
                href: '/hr/employees',
            },
            {
                text: 'Thêm Nhân viên',
                icon: <PersonAddIcon />,
                href: '/hr/employees/new',
            },
            {
                text: 'Giảng viên',
                icon: <PeopleIcon />,
                href: '/hr/faculty',
            },
        ],
    },
    {
        text: 'Công việc',
        icon: <WorkIcon />,
        children: [
            {
                text: 'Phân công Công việc',
                icon: <AssignmentIcon />,
                href: '/hr/assignments',
            },
        ],
    },
    {
        text: 'Cài đặt',
        icon: <SettingsIcon />,
        children: [
            {
                text: 'Hồ sơ',
                icon: <PersonIcon />,
                href: '/hr/profile',
            },
            {
                text: 'Đổi mật khẩu',
                icon: <SettingsIcon />,
                href: '/hr/change-password',
            },
        ],
    },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

    const handleToggle = (text: string) => {
        setOpenItems(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    const isItemSelected = (item: MenuItem): boolean => {
        if (item.href && pathname === item.href) {
            return true;
        }
        if (item.children) {
            return item.children.some(child => isItemSelected(child));
        }
        return false;
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openItems[item.text];
        const isSelected = isItemSelected(item);

        return (
            <React.Fragment key={item.text}>
                <ListItem disablePadding>
                    <ListItemButton
                        component={item.href ? Link : 'div'}
                        href={item.href}
                        selected={isSelected}
                        onClick={() => {
                            if (hasChildren) {
                                handleToggle(item.text);
                            } else if (item.href) {
                                onClose();
                            }
                        }}
                        sx={{
                            pl: 2 + level * 2,
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: 'white',
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={item.text}
                            primaryTypographyProps={{
                                fontSize: level > 0 ? '0.875rem' : '1rem',
                                fontWeight: level > 0 ? 400 : 500,
                            }}
                        />
                        {hasChildren && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(item.text);
                                }}
                                sx={{ 
                                    color: isSelected ? 'white' : 'inherit',
                                    ml: 1 
                                }}
                            >
                                {isOpen ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        )}
                    </ListItemButton>
                </ListItem>
                {hasChildren && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children!.map((child) => renderMenuItem(child, level + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: 'background.paper',
                },
            }}
        >
            <Box sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    HR Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                    Hệ thống quản lý nhân sự
                </Typography>
            </Box>
            <Divider />
            <List sx={{ pt: 1 }}>
                {menuItems.map((item) => renderMenuItem(item))}
            </List>
        </Drawer>
    );
}
