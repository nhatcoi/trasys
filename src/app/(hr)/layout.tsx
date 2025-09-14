'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
    Avatar,
    Menu,
    MenuItem,
    Chip,
    Popover,
    Paper,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    People as PeopleIcon,
    PersonAdd as PersonAddIcon,
    Dashboard as DashboardIcon,
    Work as WorkIcon,
    AccountCircle,
    Edit,
    Logout,
    School as SchoolIcon,
    AccountTree as AccountTreeIcon,
    Person as PersonIcon,
    ExpandLess,
    ExpandMore,
    Assessment as AssessmentIcon,
    Business as BusinessIcon,
    History as HistoryIcon,
    Settings as SettingsIcon,
    Security as SecurityIcon,
    Link as LinkIcon,
} from '@mui/icons-material';
import { ThemeToggle } from '@/components/theme-toggle';
import Sidebar from '@/components/nav/sidebar-simple';

import { HR_ROUTES } from '@/constants/routes';

const drawerWidth = 240;

export default function HrLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
        'overview': true,
        'hr-management': true,
        'org-management': false,
        'assignments': false,
        'reports': false,
        'profile': false,
    });
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setCollapsed(!collapsed);
    };

    // Menu items cho HR với nested structure
    const menuItems = [
        {
            key: HR_ROUTES.DASHBOARD,
            icon: <DashboardIcon />,
            label: 'Dashboard',
        },
        {
            key: 'overview',
            icon: <SchoolIcon />,
            label: 'Tổng quan',
            children: [
                {
                    key: HR_ROUTES.UNIVERSITY_OVERVIEW,
                    icon: <SchoolIcon />,
                    label: 'Tổng quan Đại học',
                },
                {
                    key: HR_ROUTES.ORG_STRUCTURE,
                    icon: <AccountTreeIcon />,
                    label: 'Cơ cấu Tổ chức',
                },
                {
                    key: HR_ROUTES.ORG_TREE,
                    icon: <AccountTreeIcon />,
                    label: 'Sơ đồ Tổ chức',
                },
            ],
        },
        {
            key: 'hr-management',
            icon: <PeopleIcon />,
            label: 'Quản lý Nhân sự',
            children: [
                {
                    key: HR_ROUTES.EMPLOYEES,
                    icon: <PersonIcon />,
                    label: 'Danh sách Nhân viên',
                },
                {
                    key: HR_ROUTES.QUALIFICATIONS,
                    icon: <SchoolIcon />,
                    label: 'Danh mục Bằng cấp',
                },
                {
                    key: HR_ROUTES.EMPLOYEE_QUALIFICATIONS,
                    icon: <SchoolIcon />,
                    label: 'Bằng cấp Nhân viên',
                },
                {
                    key: HR_ROUTES.EMPLOYMENTS,
                    icon: <WorkIcon />,
                    label: 'Hợp đồng Lao động',
                },
                {
                    key: HR_ROUTES.PERFORMANCE_REVIEWS,
                    icon: <AssessmentIcon />,
                    label: 'Đánh giá Nhân viên',
                },
                {
                    key: HR_ROUTES.ACADEMIC_TITLES,
                    icon: <SchoolIcon />,
                    label: 'Học hàm Học vị',
                },
                {
                    key: HR_ROUTES.EMPLOYEE_ACADEMIC_TITLES,
                    icon: <PersonIcon />,
                    label: 'Học hàm NV',
                },
                {
                    key: HR_ROUTES.TRAININGS,
                    icon: <SchoolIcon />,
                    label: 'Khóa Đào tạo',
                },
                {
                    key: HR_ROUTES.EMPLOYEE_TRAININGS,
                    icon: <PersonIcon />,
                    label: 'Đào tạo NV',
                },
                {
                    key: HR_ROUTES.EMPLOYEE_LOGS,
                    icon: <HistoryIcon />,
                    label: 'Nhật ký NV',
                },
            ],
        },
        {
            key: 'rbac',
            icon: <SettingsIcon />,
            label: 'Phân quyền',
            children: [
                {
                    key: HR_ROUTES.ROLES,
                    icon: <WorkIcon />,
                    label: 'Vai trò',
                },
                {
                    key: HR_ROUTES.PERMISSIONS,
                    icon: <SecurityIcon />,
                    label: 'Quyền hạn',
                },
                {
                    key: HR_ROUTES.ROLE_PERMISSIONS,
                    icon: <LinkIcon />,
                    label: 'Phân quyền Vai trò',
                },
                {
                    key: HR_ROUTES.USER_ROLES,
                    icon: <PersonIcon />,
                    label: 'Phân quyền Người dùng',
                },
                {
                    key: HR_ROUTES.RBAC_TEST,
                    icon: <SecurityIcon />,
                    label: 'Test RBAC',
                },
            ],
        },
        {
            key: 'reports',
            icon: <AssessmentIcon />,
            label: 'Báo cáo',
            children: [
                {
                    key: HR_ROUTES.REPORTS,
                    icon: <AssessmentIcon />,
                    label: 'Báo cáo Thống kê',
                },
            ],
        }
    ];

    const handleMenuClick = (path: string) => {
        router.push(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleToggle = (key: string) => {
        setOpenItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const renderMenuItem = (item: any, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openItems[item.key];
        const isSelected = pathname === item.key || (hasChildren && item.children.some((child: any) => pathname === child.key));

        return (
            <div key={item.key}>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={isSelected && !hasChildren}
                        onClick={() => {
                            if (hasChildren) {
                                handleToggle(item.key);
                            } else {
                                handleMenuClick(item.key);
                            }
                        }}
                        sx={{
                            mx: 1,
                            borderRadius: 1,
                            pl: level === 0 ? 2 : 4,
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        {!collapsed && <ListItemText primary={item.label} />}
                        {hasChildren && !collapsed && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggle(item.key);
                                }}
                                sx={{ ml: 1 }}
                            >
                                {isOpen ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        )}
                    </ListItemButton>
                </ListItem>
                {hasChildren && !collapsed && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children.map((child: any) => renderMenuItem(child, level + 1))}
                        </List>
                    </Collapse>
                )}
            </div>
        );
    };

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        console.log('Opening user menu...', event.currentTarget);
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditProfile = () => {
        handleUserMenuClose();
        router.push(HR_ROUTES.PROFILE);
    };

    const handleLogout = () => {
        handleUserMenuClose();
        signOut({ callbackUrl: '/' });
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Toolbar sx={{ minHeight: '64px !important' }}>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        flexGrow: 1,
                        textAlign: 'center'
                    }}
                >
                    {collapsed ? 'H' : 'HR System'}
                </Typography>
            </Toolbar>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

            {/* Menu Items */}
            <List sx={{ flexGrow: 1, pt: 1 }}>
                {menuItems.map((item) => renderMenuItem(item))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${collapsed ? 80 : drawerWidth}px)` },
                    ml: { md: collapsed ? '80px' : `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        edge="start"
                        onClick={isMobile ? handleDrawerToggle : handleCollapseToggle}
                        sx={{ mr: 2 }}
                    >
                        {isMobile ? <MenuIcon /> : (collapsed ? <ChevronLeftIcon sx={{ transform: 'rotate(180deg)' }} /> : <ChevronLeftIcon />)}
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        HR Management
                    </Typography>

                    {/* User Info and Actions */}
                    {session && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            <Chip
                                label={`Xin chào, ${(session.user as any)?.username || 'User'}`}
                                color="secondary"
                                size="small"
                                sx={{ color: 'white' }}
                            />
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="account of current user"
                                aria-controls="user-menu"
                                aria-haspopup="true"
                                onClick={handleUserMenuOpen}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    <AccountCircle />
                                </Avatar>
                            </IconButton>
                        </Box>
                    )}

                    <ThemeToggle />
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: collapsed ? 80 : drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Sidebar
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                />

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: collapsed ? 80 : drawerWidth,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { md: `calc(100% - ${collapsed ? 80 : drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                }}
            >
                <Toolbar />
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            </Box>

            {/* User Menu */}
            <Popover
                id="user-menu"
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        mt: 1,
                        minWidth: 200,
                        zIndex: 9999,
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                    }
                }}
            >
                <Paper sx={{
                    p: 1,
                    backgroundColor: 'background.paper',
                    color: '#000000',
                    '& .MuiListItemText-primary': {
                        color: '#000000 !important',
                        fontWeight: '500 !important',
                    }
                }}>
                    <MenuItem
                        onClick={handleEditProfile}
                        sx={{
                            color: '#000000',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <Edit fontSize="small" sx={{ color: '#000000' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Chỉnh sửa thông tin"
                            primaryTypographyProps={{
                                color: '#000000',
                                fontWeight: 500
                            }}
                        />
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleUserMenuClose();
                            router.push(HR_ROUTES.CHANGE_PASSWORD);
                        }}
                        sx={{
                            color: '#000000',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <AccountCircle fontSize="small" sx={{ color: '#000000' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Đổi mật khẩu"
                            primaryTypographyProps={{
                                color: '#000000',
                                fontWeight: 500
                            }}
                        />
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            color: '#000000',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            }
                        }}
                    >
                        <ListItemIcon>
                            <Logout fontSize="small" sx={{ color: '#000000' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Đăng xuất"
                            primaryTypographyProps={{
                                color: '#000000',
                                fontWeight: 500
                            }}
                        />
                    </MenuItem>
                </Paper>
            </Popover>
        </Box>
    );
}