'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Apartment as ApartmentIcon,
  Group as GroupIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ListAlt as ListAltIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Approval as ApprovalIcon,
  Publish as PublishIcon,
  Storage as StorageIcon,
  AccountTree as AccountTreeIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { ThemeToggle } from '@/components/theme-toggle';

const drawerWidth = 240;

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unitManagementOpen, setUnitManagementOpen] = useState(false);
  const [treeManagementOpen, setTreeManagementOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleUnitManagementToggle = () => {
    setUnitManagementOpen(!unitManagementOpen);
  };

  const handleTreeManagementToggle = () => {
    setTreeManagementOpen(!treeManagementOpen);
  };

  const menuItems = [
    {
      key: '/org/dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
    },
    {
      key: 'tree-management',
      icon: <ApartmentIcon />,
      label: 'Cây tổ chức',
      hasSubmenu: true,
      submenu: [
        {
          key: '/org/tree',
          icon: <AccountTreeIcon />,
          label: 'Cây tổ chức',
        },
        {
          key: '/org/diagram',
          icon: <TimelineIcon />,
          label: 'Sơ đồ',
        },
      ],
    },
    {
      key: 'unit-management',
      icon: <GroupIcon />,
      label: 'Quản lý đơn vị',
      hasSubmenu: true,
      submenu: [
        {
          key: '/org/unit',
          icon: <ListAltIcon />,
          label: 'Danh sách đơn vị',
        },
        {
          key: '/org/unit/create',
          icon: <AddIcon />,
          label: 'Tạo đơn vị mới',
        },
        {
          key: '/org/unit/workflow',
          icon: <ApprovalIcon />,
          label: 'Yêu cầu phê duyệt',
        },
      ],
    },
    {
      key: '/org/audit',
      icon: <HistoryIcon />,
      label: 'Lịch sử thay đổi',
    },
    {
      key: '/org/reports',
      icon: <AssessmentIcon />,
      label: 'Báo cáo tổ chức',
    },
    {
      key: '/org/config',
      icon: <SettingsIcon />,
      label: 'Cấu hình hệ thống',
    },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenuItemClick = (item: any) => {
    if (item.hasSubmenu) {
      if (item.key === 'unit-management') {
        handleUnitManagementToggle();
      } else if (item.key === 'tree-management') {
        handleTreeManagementToggle();
      }
    } else {
      handleMenuClick(item.key);
    }
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
          {collapsed ? 'T' : 'Quản lí cơ cấu tổ chức'}
        </Typography>
      </Toolbar>
      
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      
      {/* Menu Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.key}>
            <ListItem disablePadding>
              <ListItemButton
                selected={pathname === item.key}
                onClick={() => handleMenuItemClick(item)}
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
                {!collapsed && (
                  <>
                    <ListItemText primary={item.label} />
                    {item.hasSubmenu && (
                      item.key === 'tree-management' ? (
                        treeManagementOpen ? (
                          <ChevronRightIcon sx={{ 
                            transform: 'rotate(90deg)',
                            transition: 'transform 0.2s ease-in-out'
                          }} />
                        ) : (
                          <ChevronRightIcon sx={{ 
                            transition: 'transform 0.2s ease-in-out'
                          }} />
                        )
                      ) : (
                        item.key === 'unit-management' ? (
                          unitManagementOpen ? (
                            <ChevronRightIcon sx={{ 
                              transform: 'rotate(90deg)',
                              transition: 'transform 0.2s ease-in-out'
                            }} />
                          ) : (
                            <ChevronRightIcon sx={{ 
                              transition: 'transform 0.2s ease-in-out'
                            }} />
                          )
                        ) : (
                          <ChevronRightIcon />
                        )
                      )
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            
            {/* Submenu */}
            {item.hasSubmenu && item.submenu && !collapsed && (
              <Collapse in={
                (item.key === 'unit-management' && unitManagementOpen) || 
                (item.key === 'tree-management' && treeManagementOpen)
              } timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.key} disablePadding>
                      <ListItemButton
                        selected={pathname === subItem.key}
                        onClick={() => handleMenuClick(subItem.key)}
                        sx={{
                          mx: 1,
                          ml: 3,
                          borderRadius: 1,
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ListItemIcon>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
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
            Trasy App
          </Typography>
          
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
            keepMounted: true, // Better open performance on mobile.
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
    </Box>
  );
}

