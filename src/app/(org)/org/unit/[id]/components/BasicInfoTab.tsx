'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Chip,
  Avatar,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { type OrgUnit } from '@/features/org/api/use-org-units';
import { getTypeColor, getTypeIcon } from '@/utils/org-unit-utils';

interface BasicInfoTabProps {
  unit: OrgUnit;
  onUpdate: (updatedUnit: Partial<OrgUnit>) => Promise<void>;
}

interface EditFormData {
  name: string;
  code: string;
  type: string;
  status: string;
  description: string;
  effective_from: string;
  effective_to: string;
}

export default function BasicInfoTab({ unit, onUpdate }: BasicInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditFormData>({
    name: unit.name,
    code: unit.code,
    type: unit.type || '',
    status: unit.status || '',
    description: unit.description || '',
    effective_from: unit.effective_from ? new Date(unit.effective_from).toISOString().split('T')[0] : '',
    effective_to: unit.effective_to ? new Date(unit.effective_to).toISOString().split('T')[0] : '',
  });

  const orgUnitTypes = [
    { value: 'U', label: 'University (Trường Đại học)' },
    { value: 'F', label: 'Faculty (Khoa)' },
    { value: 'D', label: 'Department (Bộ môn)' },
    { value: 'B', label: 'Board (Ban)' },
    { value: 'C', label: 'Center (Trung tâm)' },
  ];

  const orgUnitStatuses = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'archived', label: 'Lưu trữ' },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: unit.name,
      code: unit.code,
      type: unit.type || '',
      status: unit.status || '',
      description: unit.description || '',
      effective_from: unit.effective_from ? new Date(unit.effective_from).toISOString().split('T')[0] : '',
      effective_to: unit.effective_to ? new Date(unit.effective_to).toISOString().split('T')[0] : '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare update data
      const updateData: Partial<OrgUnit> = {
        name: editData.name,
        code: editData.code,
        type: editData.type || null,
        status: editData.status || null,
        description: editData.description || null,
        effective_from: editData.effective_from ? new Date(editData.effective_from).toISOString() : null,
        effective_to: editData.effective_to ? new Date(editData.effective_to).toISOString() : null,
      };

      await onUpdate(updateData);
      
      setIsEditing(false);
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Thông tin cơ bản
        </Typography>
        
        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ minWidth: 120 }}
          >
            Chỉnh sửa
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thông tin chính
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Tên đơn vị
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nhập tên đơn vị"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {unit.name}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Mã đơn vị
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      placeholder="Nhập mã đơn vị"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {unit.code}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Loại đơn vị
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={editData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Chọn loại đơn vị</em>
                        </MenuItem>
                        {orgUnitTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      label={unit.type || 'Chưa xác định'}
                      size="small"
                      sx={{
                        backgroundColor: getTypeColor(unit.type || ''),
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Trạng thái
                  </Typography>
                  {isEditing ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={editData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Chọn trạng thái</em>
                        </MenuItem>
                        {orgUnitStatuses.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            {status.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      label={unit.status || 'Chưa xác định'}
                      size="small"
                      sx={{
                        backgroundColor: getTypeColor(unit.status || ''),
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Mô tả
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      value={editData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Nhập mô tả đơn vị"
                    />
                  ) : (
                    <Typography variant="body1">
                      {unit.description || 'Chưa có mô tả'}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Dates and Hierarchy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thời gian & Phân cấp
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Có hiệu lực từ
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={editData.effective_from}
                      onChange={(e) => handleInputChange('effective_from', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1">
                      {unit.effective_from ? new Date(unit.effective_from).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Có hiệu lực đến
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      type="date"
                      size="small"
                      value={editData.effective_to}
                      onChange={(e) => handleInputChange('effective_to', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body1">
                      {unit.effective_to ? new Date(unit.effective_to).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {new Date(unit.created_at).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1">
                    {new Date(unit.updated_at).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                {unit.parent && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Đơn vị cha
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ backgroundColor: getTypeColor(unit.parent.type || ''), width: 24, height: 24 }}>
                        {React.createElement(getTypeIcon(unit.parent.type || ''), { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="body1">
                        {unit.parent.name} ({unit.parent.code})
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {unit.parent_id && !unit.parent && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ID đơn vị cha
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {unit.parent_id}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thống kê tổng quan
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.children?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đơn vị con
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.employees?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng nhân viên
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#ed6c02', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.parentRelations?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quan hệ cấp trên
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#9c27b0', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.childRelations?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quan hệ cấp dưới
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}