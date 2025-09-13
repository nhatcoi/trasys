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
    School as SchoolIcon,
    AccountTree as AccountTreeIcon,
    Person as PersonIcon,
    ExpandLess,
    ExpandMore,
    PersonAdd as PersonAddIcon,
    Work as WorkIcon,
    Assignment as AssignmentIcon,
    Settings as SettingsIcon,
    Business as BusinessIcon,
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
                icon: <BusinessIcon />,
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
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export default function SidebarSimple({ open, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
        'Tổng quan': true,
        'Quản lý Nhân sự': true,
    });

    const handleToggle = (text: string) => {
        setOpenItems(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openItems[item.text];

        return (
            <React.Fragment key={item.text}>
                <ListItem disablePadding>
                    <ListItemButton
                        component={item.href ? Link : 'div'}
                        href={item.href}
                        onClick={() => {
                            if (hasChildren) {
                                handleToggle(item.text);
                            } else if (item.href) {
                                onClose();
                            }
                        }}
                        sx={{
                            pl: level === 0 ? 2 : 4,
                            py: level === 0 ? 1.5 : 1,
                            mx: 1,
                            borderRadius: 2,
                            mb: level === 0 ? 0.5 : 0,
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: level === 0 ? 48 : 40,
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontSize: level === 0 ? '1rem' : '0.875rem',
                                fontWeight: level === 0 ? 600 : 400,
                            }}
                        />
                        {hasChildren && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(item.text);
                                }}
                                sx={{ ml: 1 }}
                            >
                                {isOpen ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        )}
                    </ListItemButton>
                </ListItem>
                {hasChildren && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding sx={{ pl: 1 }}>
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
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{ p: 3, backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    HR Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
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
