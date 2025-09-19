'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { HR_ROUTES, API_ROUTES } from '@/constants/routes';

interface Qualification {
    id: string;
    code: string;
    title: string;
}

interface Employee {
    id: string;
    employee_no: string | null;
    user: {
        full_name: string;
        username: string;
    } | null;
}

interface EmployeeQualification {
    id: string;
    employee_id: string;
    qualification_id: string;
    major_field: string;
    institution: string;
    awarded_date: string;
    employees: {
        id: string;
        employee_no: string | null;
        user: {
            full_name: string;
            username: string;
        } | null;
    } | null;
    qualifications: {
        id: string;
        code: string;
        title: string;
    } | null;
}

export default function EmployeeQualificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [employeeQualifications, setEmployeeQualifications] = useState<EmployeeQualification[]>([]);
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EmployeeQualification | null>(null);
    const [formData, setFormData] = useState({
        employee_id: '',
        qualification_id: '',
        major_field: '',
        institution: '',
        awarded_date: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        fetchData();
    }, [session, status, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [qualificationsRes, employeesRes, employeeQualificationsRes] = await Promise.all([
                fetch(API_ROUTES.HR.QUALIFICATIONS),
                fetch(API_ROUTES.HR.EMPLOYEES),
                fetch(API_ROUTES.HR.EMPLOYEE_QUALIFICATIONS)
            ]);

            const [qualificationsResult, employeesResult, employeeQualificationsResult] = await Promise.all([
                qualificationsRes.json(),
                employeesRes.json(),
                employeeQualificationsRes.json()
            ]);

            if (qualificationsResult.success) {
                setQualifications(qualificationsResult.data);
            }
            if (employeesResult.success) {
                setEmployees(employeesResult.data);
            }
            if (employeeQualificationsResult.success) {
                setEmployeeQualifications(employeeQualificationsResult.data);
            }
        } catch (error) {
            setError('Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (record?: EmployeeQualification) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                employee_id: record.employee_id,
                qualification_id: record.qualification_id,
                major_field: record.major_field,
                institution: record.institution,
                awarded_date: record.awarded_date.split('T')[0] // Convert to YYYY-MM-DD format
            });
        } else {
            setEditingRecord(null);
            setFormData({
                employee_id: '',
                qualification_id: '',
                major_field: '',
                institution: '',
                awarded_date: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingRecord(null);
        setFormData({
            employee_id: '',
            qualification_id: '',
            major_field: '',
            institution: '',
            awarded_date: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.employee_id || !formData.qualification_id || !formData.major_field || !formData.institution || !formData.awarded_date) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSaving(true);
            const url = editingRecord
                ? API_ROUTES.HR.EMPLOYEE_QUALIFICATIONS_BY_ID(editingRecord.id)
                : API_ROUTES.HR.EMPLOYEE_QUALIFICATIONS;

            const method = editingRecord ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                await fetchData();
                handleCloseDialog();
                setError(null);
            } else {
                setError(result.error || 'Lỗi khi lưu thông tin');
            }
        } catch (error) {
            setError('Lỗi kết nối đến server');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa thông tin bằng cấp này?')) {
            return;
        }

        try {
            const response = await fetch(API_ROUTES.HR.EMPLOYEE_QUALIFICATIONS_BY_ID(id), {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                await fetchData();
                setError(null);
            } else {
                setError(result.error || 'Lỗi khi xóa thông tin');
            }
        } catch (error) {
            setError('Lỗi kết nối đến server');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Đang tải danh sách bằng cấp nhân viên...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Bằng cấp Nhân viên
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm bằng cấp
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nhân viên</strong></TableCell>
                                <TableCell><strong>Bằng cấp</strong></TableCell>
                                <TableCell><strong>Chuyên ngành</strong></TableCell>
                                <TableCell><strong>Tổ chức cấp</strong></TableCell>
                                <TableCell><strong>Ngày cấp</strong></TableCell>
                                <TableCell><strong>Hành động</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employeeQualifications.map((record) => (
                                <TableRow key={record.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">
                                                {record.employees?.user?.full_name || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {record.employees?.employee_no || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={record.qualifications?.title || 'N/A'}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {record.major_field}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {record.institution}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(record.awarded_date).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(record)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(record.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog thêm/sửa bằng cấp nhân viên */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingRecord ? 'Sửa bằng cấp nhân viên' : 'Thêm bằng cấp nhân viên'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Nhân viên</InputLabel>
                                <Select
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                    label="Nhân viên"
                                >
                                    {employees.map((employee) => (
                                        <MenuItem key={employee.id} value={employee.id}>
                                            {employee.user?.full_name} ({employee.employee_no})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel>Bằng cấp</InputLabel>
                                <Select
                                    value={formData.qualification_id}
                                    onChange={(e) => setFormData({ ...formData, qualification_id: e.target.value })}
                                    label="Bằng cấp"
                                >
                                    {qualifications.map((qualification) => (
                                        <MenuItem key={qualification.id} value={qualification.id}>
                                            {qualification.title} ({qualification.code})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Chuyên ngành"
                                value={formData.major_field}
                                onChange={(e) => setFormData({ ...formData, major_field: e.target.value })}
                                required
                                placeholder="VD: Công nghệ thông tin, Quản trị kinh doanh"
                            />

                            <TextField
                                fullWidth
                                label="Tổ chức cấp bằng"
                                value={formData.institution}
                                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                required
                                placeholder="VD: Đại học Bách Khoa, Harvard University"
                            />

                            <TextField
                                fullWidth
                                label="Ngày cấp bằng"
                                type="date"
                                value={formData.awarded_date}
                                onChange={(e) => setFormData({ ...formData, awarded_date: e.target.value })}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={saving}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} /> : null}
                        >
                            {saving ? 'Đang lưu...' : (editingRecord ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
