'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Box,
    Paper,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { HR_ROUTES, API_ROUTES } from '@/constants/routes';

interface FormData {
    name: string;
    code: string;
    parent_id: string;
    level: number;
    is_active: boolean;
}

interface OrgUnit {
    id: string;
    name: string;
    code: string | null;
    parent_id: string | null;
    level: number;
    is_active: boolean;
}

export default function OrgUnitEditPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orgUnit, setOrgUnit] = useState<OrgUnit | null>(null);
    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        code: '',
        parent_id: '',
        level: 1,
        is_active: true,
    });

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (params.id) {
            fetchOrgUnit(params.id as string);
            fetchOrgUnits();
        }
    }, [session, status, params.id, router]);

    const fetchOrgUnit = async (orgUnitId: string) => {
        try {
            setLoading(true);
            const response = await fetch(API_ROUTES.ORG.UNITS_BY_ID(orgUnitId));
            const result = await response.json();

            if (result.success) {
                const unit = result.data;
                setOrgUnit(unit);
                setFormData({
                    name: unit.name,
                    code: unit.code || '',
                    parent_id: unit.parent_id || '',
                    level: unit.level,
                    is_active: unit.is_active,
                });
            } else {
                setError(result.error || 'Không thể tải thông tin đơn vị');
            }
        } catch (error) {
            console.error('Error fetching org unit:', error);
            setError('Lỗi khi tải thông tin đơn vị');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgUnits = async () => {
        try {
            const response = await fetch(API_ROUTES.ORG.UNITS);
            const result = await response.json();

            if (result.success) {
                // Filter out current org unit and its children to prevent circular references
                const filteredUnits = result.data.filter((unit: OrgUnit) => unit.id !== params.id);
                setOrgUnits(filteredUnits);
            }
        } catch (error) {
            console.error('Error fetching org units:', error);
        }
    };

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        if (!formData.name || !formData.code) {
            setError('Tên đơn vị và mã đơn vị là bắt buộc.');
            setSaving(false);
            return;
        }

        if (!orgUnit?.id) {
            setError('Không tìm thấy thông tin đơn vị');
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(API_ROUTES.ORG.UNITS_BY_ID(orgUnit.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    code: formData.code,
                    parent_id: formData.parent_id || null,
                    level: formData.level,
                    is_active: formData.is_active,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess('Cập nhật đơn vị thành công!');
                setTimeout(() => {
                    router.push(HR_ROUTES.ORG_UNITS_DETAIL(params.id as string));
                }, 1500);
            } else {
                setError(result.error || 'Có lỗi xảy ra khi cập nhật đơn vị');
            }
        } catch (error) {
            console.error('Error updating org unit:', error);
            setError('Lỗi khi cập nhật đơn vị');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!session) {
        return null;
    }

    if (error && !orgUnit) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!orgUnit) {
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                Không tìm thấy đơn vị
            </Alert>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push(HR_ROUTES.ORG_UNITS_DETAIL(params.id as string))}
                    sx={{ mr: 2 }}
                >
                    Hủy
                </Button>
                <Typography variant="h4" component="h1">
                    Chỉnh sửa đơn vị
                </Typography>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên đơn vị"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Mã đơn vị"
                            value={formData.code}
                            onChange={(e) => handleInputChange('code', e.target.value)}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>Đơn vị cha</InputLabel>
                            <Select
                                value={formData.parent_id}
                                onChange={(e) => handleInputChange('parent_id', e.target.value)}
                                label="Đơn vị cha"
                            >
                                <MenuItem value="">
                                    <em>Không có đơn vị cha</em>
                                </MenuItem>
                                {orgUnits.map((unit) => (
                                    <MenuItem key={unit.id} value={unit.id}>
                                        {unit.name} (Cấp {unit.level})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Cấp độ"
                            type="number"
                            value={formData.level}
                            onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                            inputProps={{ min: 1, max: 10 }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                                label="Trạng thái"
                            >
                                <MenuItem value="true">Hoạt động</MenuItem>
                                <MenuItem value="false">Không hoạt động</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box mt={3} display="flex" gap={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => router.push(HR_ROUTES.ORG_UNITS_DETAIL(params.id as string))}
                            disabled={saving}
                        >
                            Hủy
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

