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
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import { HR_ROUTES, API_ROUTES } from '@/constants/routes';

interface Qualification {
    id: string;
    code: string;
    title: string;
}

export default function QualificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [qualifications, setQualifications] = useState<Qualification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingQualification, setEditingQualification] = useState<Qualification | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        title: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        fetchQualifications();
    }, [session, status, router]);

    const fetchQualifications = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_ROUTES.HR.QUALIFICATIONS);
            const result = await response.json();

            if (result.success) {
                setQualifications(result.data);
            } else {
                setError(result.error || 'Lỗi khi tải danh sách bằng cấp');
            }
        } catch (error) {
            setError('Lỗi kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (qualification?: Qualification) => {
        if (qualification) {
            setEditingQualification(qualification);
            setFormData({
                code: qualification.code,
                title: qualification.title
            });
        } else {
            setEditingQualification(null);
            setFormData({
                code: '',
                title: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingQualification(null);
        setFormData({
            code: '',
            title: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || !formData.title) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setSaving(true);
            const url = editingQualification
                ? API_ROUTES.HR.QUALIFICATIONS_BY_ID(editingQualification.id)
                : API_ROUTES.HR.QUALIFICATIONS;

            const method = editingQualification ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                await fetchQualifications();
                handleCloseDialog();
                setError(null);
            } else {
                setError(result.error || 'Lỗi khi lưu bằng cấp');
            }
        } catch (error) {
            setError('Lỗi kết nối đến server');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bằng cấp này?')) {
            return;
        }

        try {
            const response = await fetch(API_ROUTES.HR.QUALIFICATIONS_BY_ID(id), {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                await fetchQualifications();
                setError(null);
            } else {
                setError(result.error || 'Lỗi khi xóa bằng cấp');
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
                    Đang tải danh sách bằng cấp...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        Quản lý Bằng cấp
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
                                <TableCell><strong>Mã bằng cấp</strong></TableCell>
                                <TableCell><strong>Tên bằng cấp</strong></TableCell>
                                <TableCell><strong>Hành động</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {qualifications.map((qualification) => (
                                <TableRow key={qualification.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={qualification.code}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" fontWeight="medium">
                                            {qualification.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(qualification)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(qualification.id)}
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

            {/* Dialog thêm/sửa bằng cấp */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {editingQualification ? 'Sửa bằng cấp' : 'Thêm bằng cấp mới'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                fullWidth
                                label="Mã bằng cấp"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                                placeholder="VD: BSC, MSC, PHD"
                            />
                            <TextField
                                fullWidth
                                label="Tên bằng cấp"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                placeholder="VD: Cử nhân, Thạc sĩ, Tiến sĩ"
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
                            {saving ? 'Đang lưu...' : (editingQualification ? 'Cập nhật' : 'Thêm mới')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
