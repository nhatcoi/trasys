'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { HR_ROUTES, API_ROUTES } from '@/constants/routes';

interface Employee {
    id: string
    employee_no: string | null
    employment_type: string | null
    status: string | null
    hired_at: string | null
    user: {
        username: string
        email: string | null
        full_name: string
    } | null
}

export default function EmployeesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        if (status === 'loading') return

        if (!session) {
            void signIn()
            return
        }

        void fetchEmployees()
    }, [session, status])

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ROUTES.EMPLOYEES);
            const result = await response.json();

            if (result.success) {
                setEmployees(result.data);
            } else {
                setError('Không thể tải danh sách nhân viên');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            setError('Lỗi khi tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Đang tải danh sách nhân viên...
                </Typography>
            </Box>
        )
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Alert severity="error" sx={{ maxWidth: 600 }}>
                    {error}
                </Alert>
            </Box>
        )
    }

    if (!session) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography variant="h6">
                    Đang chuyển hướng đến trang đăng nhập...
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Danh sách nhân viên
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push(HR_ROUTES.EMPLOYEES_NEW)}
                    sx={{
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    Thêm nhân viên
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Mã NV</strong></TableCell>
                                <TableCell><strong>Họ tên</strong></TableCell>
                                <TableCell><strong>Username</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Loại NV</strong></TableCell>
                                <TableCell><strong>Trạng thái</strong></TableCell>
                                <TableCell><strong>Ngày tuyển</strong></TableCell>
                                <TableCell><strong>Hành động</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee.id} hover>
                                    <TableCell>{employee.employee_no || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {employee.user?.full_name || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{employee.user?.username || 'N/A'}</TableCell>
                                    <TableCell>{employee.user?.email || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={employee.employment_type || 'N/A'}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={employee.status || 'N/A'}
                                            size="small"
                                            color={employee.status === 'active' ? 'success' : 'default'}
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {employee.hired_at ? new Date(employee.hired_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => {
                                                    setActionLoading(`view-${employee.id}`);
                                                    router.push(`${HR_ROUTES.EMPLOYEES}/${employee.id}`);
                                                }}
                                                disabled={actionLoading === `view-${employee.id}`}
                                                title="Xem chi tiết"
                                            >
                                                {actionLoading === `view-${employee.id}` ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    <ViewIcon />
                                                )}
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="secondary"
                                                onClick={() => {
                                                    setActionLoading(`edit-${employee.id}`);
                                                    router.push(`${HR_ROUTES.EMPLOYEES}/${employee.id}/edit`);
                                                }}
                                                disabled={actionLoading === `edit-${employee.id}`}
                                                title="Chỉnh sửa"
                                            >
                                                {actionLoading === `edit-${employee.id}` ? (
                                                    <CircularProgress size={16} />
                                                ) : (
                                                    <EditIcon />
                                                )}
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {employees.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        Chưa có nhân viên nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Nhấn "Thêm nhân viên" để bắt đầu
                    </Typography>
                </Box>
            )}
        </Box>
    )
}