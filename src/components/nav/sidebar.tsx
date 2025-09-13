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
    Avatar,
    Chip,
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

const drawerWidth = 300;

interface MenuItem {
    text: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
    badge?: string;
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
                badge: '12',
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
                badge: '8',
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
        const isParentSelected = level === 0 && isSelected;

        return (
            <React.Fragment key={item.text}>
                <ListItem disablePadding>
                    <ListItemButton
                        component={item.href ? Link : 'div'}
                        href={item.href}
                        selected={isSelected && !hasChildren}
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
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: level === 0 ? 'primary.light' : 'action.hover',
                                transform: 'translateX(4px)',
                            },
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
                            ...(isParentSelected && {
                                backgroundColor: 'primary.light',
                                color: 'primary.main',
                                '& .MuiListItemIcon-root': {
                                    color: 'primary.main',
                                },
                            }),
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: level === 0 ? 48 : 40,
                            color: isParentSelected ? 'primary.main' : 'inherit',
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
                        {item.badge && (
                            <Chip
                                label={item.badge}
                                size="small"
                                color="primary"
                                sx={{
                                    height: 20,
                                    fontSize: '0.75rem',
                                    backgroundColor: isSelected ? 'white' : 'primary.main',
                                    color: isSelected ? 'primary.main' : 'white',
                                }}
                            />
                        )}
                        {hasChildren && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(item.text);
                                }}
                                sx={{
                                    color: isParentSelected ? 'primary.main' : 'inherit',
                                    ml: 1,
                                    transition: 'transform 0.2s ease-in-out',
                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                }}
                            >
                                <ExpandMore />
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
                    backgroundColor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Avatar sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        mb: 2,
                        width: 56,
                        height: 56,
                    }}>
                        <BusinessIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        HR Management
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Hệ thống quản lý nhân sự
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Menu Items */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                <List>
                    {menuItems.map((item) => renderMenuItem(item))}
                </List>
            </Box>

            {/* Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    © 2024 Phenikaa University
                </Typography>
            </Box>
        </Drawer>
    );
}
