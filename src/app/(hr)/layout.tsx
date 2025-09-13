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
} from '@mui/icons-material';
import { ThemeToggle } from '@/components/theme-toggle';

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
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setCollapsed(!collapsed);
    };

    // Menu items cho HR
    const menuItems = [
        {
            key: HR_ROUTES.DASHBOARD,
            icon: <DashboardIcon />,
            label: 'Dashboard',
        },
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
            key: HR_ROUTES.FACULTY,
            icon: <PersonIcon />,
            label: 'Giảng viên',
        },
        {
            key: HR_ROUTES.EMPLOYEES,
            icon: <PeopleIcon />,
            label: 'Quản lý nhân viên',
        },
        {
            key: HR_ROUTES.EMPLOYEES_NEW,
            icon: <PersonAddIcon />,
            label: 'Thêm nhân viên',
        },
        {
            key: HR_ROUTES.ASSIGNMENTS,
            icon: <WorkIcon />,
            label: 'Quản lý phân công',
        },
    ];

    const handleMenuClick = (path: string) => {
        router.push(path);
        if (isMobile) {
            setMobileOpen(false);
        }
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
                {menuItems.map((item) => (
                    <ListItem key={item.key} disablePadding>
                        <ListItemButton
                            selected={pathname === item.key}
                            onClick={() => handleMenuClick(item.key)}
                            sx={{
                                mx: 1,
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            {!collapsed && <ListItemText primary={item.label} />}
                        </ListItemButton>
                    </ListItem>
                ))}
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
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

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