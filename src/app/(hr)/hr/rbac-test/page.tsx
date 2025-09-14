'use client';

import { useSession } from 'next-auth/react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Grid,
    Alert,
    Divider
} from '@mui/material';
import { PermissionGuard, usePermissions } from '@/components/auth/permission-guard';

export default function RBACTestPage() {
    const { data: session, status } = useSession();
    const { permissions, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>Đang tải...</Typography>
            </Box>
        );
    }

    if (!session) {
        return (
            <Alert severity="error">
                Bạn cần đăng nhập để xem trang này
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                RBAC Test Page
            </Typography>

            {/* User Info */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Thông tin User
                    </Typography>
                    <Typography><strong>Username:</strong> {session.user.username}</Typography>
                    <Typography><strong>Email:</strong> {session.user.email}</Typography>
                    <Typography><strong>Full Name:</strong> {session.user.full_name}</Typography>
                </CardContent>
            </Card>

            {/* Permissions */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Quyền hạn hiện tại ({permissions.length})
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {permissions.map((permission) => (
                            <Chip
                                key={permission}
                                label={permission}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Permission Tests */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Test Quyền hạn
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Có quyền xem employees?</Typography>
                                <Chip
                                    label={hasPermission('hr.employees.view') ? 'Có' : 'Không'}
                                    color={hasPermission('hr.employees.view') ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Có quyền tạo employees?</Typography>
                                <Chip
                                    label={hasPermission('hr.employees.create') ? 'Có' : 'Không'}
                                    color={hasPermission('hr.employees.create') ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Có quyền quản lý roles?</Typography>
                                <Chip
                                    label={hasAnyPermission(['hr.roles.view', 'hr.roles.create', 'hr.roles.update', 'hr.roles.delete']) ? 'Có' : 'Không'}
                                    color={hasAnyPermission(['hr.roles.view', 'hr.roles.create', 'hr.roles.update', 'hr.roles.delete']) ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Có tất cả quyền admin?</Typography>
                                <Chip
                                    label={hasAllPermissions(['hr.roles.view', 'hr.permissions.view', 'hr.role_permissions.view']) ? 'Có' : 'Không'}
                                    color={hasAllPermissions(['hr.roles.view', 'hr.permissions.view', 'hr.role_permissions.view']) ? 'success' : 'error'}
                                    size="small"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Test Permission Guard
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Nội dung chỉ hiển thị nếu có quyền xem roles:</Typography>
                                <PermissionGuard
                                    requiredPermissions={['hr.roles.view']}
                                    fallback={<Alert severity="warning" size="small">Không có quyền xem roles</Alert>}
                                >
                                    <Alert severity="success" size="small">Bạn có quyền xem roles!</Alert>
                                </PermissionGuard>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Nội dung chỉ hiển thị nếu có quyền tạo employees:</Typography>
                                <PermissionGuard
                                    requiredPermissions={['hr.employees.create']}
                                    fallback={<Alert severity="warning" size="small">Không có quyền tạo employees</Alert>}
                                >
                                    <Alert severity="success" size="small">Bạn có quyền tạo employees!</Alert>
                                </PermissionGuard>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2">Nội dung chỉ hiển thị nếu có quyền admin:</Typography>
                                <PermissionGuard
                                    requiredPermissions={['hr.roles.view', 'hr.permissions.view', 'hr.role_permissions.view']}
                                    fallback={<Alert severity="warning" size="small">Không có quyền admin</Alert>}
                                >
                                    <Alert severity="success" size="small">Bạn có quyền admin!</Alert>
                                </PermissionGuard>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
