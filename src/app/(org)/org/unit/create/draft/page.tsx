'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useOrgUnits, useParentUnits } from '@/features/org/api/use-org-units';
import { useCampuses } from '@/features/org/api/use-campuses';
import { AlertMessage, createSuccessAlert, createErrorAlert, closeAlert } from '@/utils/alert-utils';


const UNIT_TYPES = [
  { value: '', label: 'Chưa xác định', description: 'Loại đơn vị sẽ được xác định sau' },
  { value: 'S', label: 'Trường', description: 'Cấp trường' },
  { value: 'F', label: 'Khoa', description: 'Cấp khoa' },
  { value: 'D', label: 'Bộ môn', description: 'Cấp bộ môn' },
  { value: 'V', label: 'Phòng ban', description: 'Cấp phòng ban' },
  { value: 'C', label: 'Trung tâm', description: 'Cấp trung tâm' },
  { value: 'I', label: 'Viện', description: 'Cấp viện' },
  { value: 'O', label: 'Văn phòng', description: 'Cấp văn phòng' },
  { value: 'B', label: 'Ban', description: 'Cấp ban chuyên môn' },
  { value: 'L', label: 'Phòng thí nghiệm', description: 'Cấp phòng thí nghiệm' },
];

// Campus and parent units data will be fetched from API

interface DraftUnitFormData {
  // SECTION 1: THÔNG TIN CƠ BẢN
  code: string;
  name: string;
  type: string;
  campus_id: string;
  
  // SECTION 2: THÔNG TIN BỔ SUNG
  parent_id: string;
  description: string;
  planned_establishment_date: string;
  
  // SECTION 3: THÔNG TIN WORKFLOW
  owner_org_id: string;
  requester_id: string; // Auto-fill từ session
  
  // SECTION 4: THÔNG TIN BỔ SUNG WORKFLOW
  request_details: string;
  attachments: any[];
}

export default function CreateDraftPage() {
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [formData, setFormData] = useState<DraftUnitFormData>({
    code: '',
    name: '',
    type: 'F',
    campus_id: '1',
    parent_id: '',
    description: '',
    planned_establishment_date: '',
    owner_org_id: '',
    requester_id: '1',
    request_details: '{"budget": 2000000, "staff": 20, "equipment": "computers"}',
    attachments: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<AlertMessage>(closeAlert());

  // Fetch draft units from API
  const { data: draftUnitsResponse, isLoading, error, refetch } = useOrgUnits({
    status: 'draft',
    page: 1,
    size: 50,
    sort: 'created_at',
    order: 'desc',
  });

  // Fetch rejected units from API
  const { data: rejectedUnitsResponse, isLoading: rejectedLoading } = useOrgUnits({
    status: 'rejected',
    page: 1,
    size: 50,
    sort: 'created_at',
    order: 'desc',
  });

  // Fetch campuses from API
  const { data: campusesResponse, isLoading: campusesLoading } = useCampuses({
    status: 'active',
  });

  // Fetch parent units from API
  const { data: parentUnitsResponse, isLoading: parentUnitsLoading } = useParentUnits();

  const draftUnits = draftUnitsResponse || [];
  const rejectedUnits = rejectedUnitsResponse || [];

  // Auto-select first parent unit for owner_org_id when data is loaded
  useEffect(() => {
    if (parentUnitsResponse && parentUnitsResponse.length > 0 && !formData.owner_org_id) {
      setFormData(prev => ({
        ...prev,
        owner_org_id: parentUnitsResponse[0].id
      }));
    }
  }, [parentUnitsResponse, formData.owner_org_id]);

  const handleInputChange = (field: keyof DraftUnitFormData, value: string | null | any[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // SECTION 1: THÔNG TIN CƠ BẢN
    if (!formData.code.trim()) newErrors.code = 'Mã code không được để trống';
    if (!formData.name.trim()) newErrors.name = 'Tên đơn vị không được để trống';
    if (!formData.type || formData.type === '') newErrors.type = 'Loại đơn vị không được để trống';
    if (!formData.campus_id || formData.campus_id === '') newErrors.campus_id = 'Campus không được để trống';
    
    // SECTION 3: THÔNG TIN WORKFLOW
    if (!formData.owner_org_id || formData.owner_org_id === '') newErrors.owner_org_id = 'Đơn vị chủ quản không được để trống';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForReview = async () => {
    if (validateForm()) {
      try {
        const response = await fetch('/api/org/initial-units', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // SECTION 1: THÔNG TIN CƠ BẢN
            code: formData.code,
            name: formData.name,
            type: formData.type || null,
            campus_id: formData.campus_id,
            
            // SECTION 2: THÔNG TIN BỔ SUNG
            parent_id: formData.parent_id || null,
            description: formData.description || null,
            planned_establishment_date: formData.planned_establishment_date || null,
            
            // SECTION 3: THÔNG TIN WORKFLOW
            owner_org_id: formData.owner_org_id,
            requester_id: formData.requester_id,
            
            // SECTION 4: THÔNG TIN BỔ SUNG WORKFLOW
            request_details: formData.request_details ? (() => {
              try {
                return JSON.parse(formData.request_details);
              } catch {
                // If not valid JSON, treat as plain text
                return { description: formData.request_details };
              }
            })() : null,
            attachments: formData.attachments,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Unit submitted for review:', result);
          setAlert(createSuccessAlert('Đã gửi yêu cầu thẩm định thành công!', 'Thành công'));
          // Refresh data after submitting
          refetch();
          // Reset form
          handleResetForm();
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit for review');
        }
      } catch (error) {
        console.error('Error submitting for review:', error);
        setAlert(createErrorAlert(`Có lỗi xảy ra khi gửi thẩm định: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Lỗi'));
      }
    }
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit);
    setFormData({
      code: unit.code || '',
      name: unit.name || '',
      type: unit.type || 'F',
      campus_id: unit.campus_id || '1',
      parent_id: unit.parent_id || '',
      description: unit.description || '',
      planned_establishment_date: unit.planned_establishment_date || '',
      owner_org_id: '',
      requester_id: '1',
      request_details: '{"budget": 2000000, "staff": 20, "equipment": "computers"}',
      attachments: [],
    });
  };

  const handleResetForm = () => {
    setEditingUnit(null);
    setFormData({
      code: '',
      name: '',
      type: 'F', // Default to Faculty
      campus_id: '1', // Default to first campus
      parent_id: '',
      description: '',
      planned_establishment_date: '',
      owner_org_id: '', // Will be set from API data
      requester_id: '1', // Mock user ID - in real app, get from session
      request_details: '{"budget": 2000000, "staff": 20, "equipment": "computers"}',
      attachments: [],
    });
    setErrors({});
  };

  const getTypeLabel = (type: string | null) => {
    if (!type || type === '') return 'Chưa xác định';
    return UNIT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Khởi tạo đơn vị (Draft)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Quy trình khởi tạo</AlertTitle>
        Tạo đơn vị mới ở trạng thái nháp với thông tin cơ bản. Sau khi hoàn thành có thể gửi thẩm định.
      </Alert>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Draft Units
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {isLoading ? <CircularProgress size={20} /> : draftUnits.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đơn vị đang soạn thảo
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error">
              Rejected Units
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {rejectedLoading ? <CircularProgress size={20} /> : rejectedUnits.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đơn vị bị từ chối
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {editingUnit ? 'Edit Unit' : 'Create New Unit'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              {editingUnit && (
                <Button
                  variant="outlined"
                  onClick={handleResetForm}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>

          {/* Alert Messages */}
          {alert.open && (
            <Alert 
              severity={alert.severity} 
              sx={{ mb: 3 }}
              onClose={() => setAlert(closeAlert())}
            >
              <AlertTitle>{alert.title}</AlertTitle>
              {alert.message}
            </Alert>
          )}

          {/* Basic Info */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Basic Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <TextField
              fullWidth
              label="Mã code *"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              error={!!errors.code}
              helperText={errors.code}
              placeholder="Ví dụ: IT"
            />
            <TextField
              fullWidth
              label="Tên đơn vị *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="Ví dụ: Khoa Công nghệ Thông tin"
            />
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Loại đơn vị *</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                label="Loại đơn vị *"
              >
                {UNIT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {type.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>
            <FormControl fullWidth error={!!errors.campus_id}>
              <InputLabel>Campus *</InputLabel>
              <Select
                value={formData.campus_id}
                onChange={(e) => handleInputChange('campus_id', e.target.value)}
                label="Campus *"
                disabled={campusesLoading}
              >
                {campusesResponse?.map((campus: any) => (
                  <MenuItem key={campus.id} value={campus.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {campus.name_vi}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {campus.code} {campus.address && `- ${campus.address}`}
                      </Typography>
                    </Box>
                  </MenuItem>
                )) || []}
              </Select>
              {campusesLoading && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 2 }}>
                  Đang tải danh sách campus...
                </Typography>
              )}
              {errors.campus_id && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.campus_id}
                </Typography>
              )}
            </FormControl>
          </Box>

          {/* Additional Info */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Additional Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Đơn vị cha</InputLabel>
              <Select
                value={formData.parent_id}
                onChange={(e) => handleInputChange('parent_id', e.target.value)}
                label="Đơn vị cha"
                disabled={parentUnitsLoading}
              >
                <MenuItem value="">
                  <em>Không có đơn vị cha</em>
                </MenuItem>
                {parentUnitsLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <span>Đang tải...</span>
                    </Box>
                  </MenuItem>
                ) : (
                  parentUnitsResponse?.map((unit: any) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {unit.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {unit.code} • {unit.type || 'Chưa xác định'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Ngày thành lập dự kiến"
              type="date"
              value={formData.planned_establishment_date}
              onChange={(e) => handleInputChange('planned_establishment_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả về chức năng, nhiệm vụ của đơn vị..."
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
          </Box>

          {/* Workflow Info */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Workflow Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <FormControl fullWidth error={!!errors.owner_org_id}>
              <InputLabel>Đơn vị chủ quản *</InputLabel>
              <Select
                value={formData.owner_org_id}
                onChange={(e) => handleInputChange('owner_org_id', e.target.value)}
                label="Đơn vị chủ quản *"
                disabled={parentUnitsLoading}
              >
                {parentUnitsLoading ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <span>Đang tải...</span>
                    </Box>
                  </MenuItem>
                ) : (
                  parentUnitsResponse?.map((unit: any) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {unit.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {unit.code} • {unit.type || 'Chưa xác định'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.owner_org_id && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.owner_org_id}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Người yêu cầu"
              value={`User ID: ${formData.requester_id}`}
              disabled
              helperText="Tự động lấy từ session"
            />
          </Box>

          {/* Additional Workflow Info */}
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Additional Workflow Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <TextField
              fullWidth
              label="Chi tiết yêu cầu (JSON)"
              multiline
              rows={4}
              value={formData.request_details}
              onChange={(e) => handleInputChange('request_details', e.target.value)}
              placeholder='{"budget": 2000000, "staff": 20, "equipment": "computers"}'
              helperText="Nhập thông tin bổ sung dưới dạng JSON"
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                File đính kèm (Tùy chọn)
              </Typography>
              <Button variant="outlined" component="label" startIcon={<AddIcon />}>
                Chọn file
                <input 
                  type="file" 
                  hidden 
                  multiple 
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const fileAttachments = files.map(file => ({
                      file_name: file.name,
                      file_path: `/uploads/${file.name}`,
                      file_size: file.size,
                      mime_type: file.type,
                      description: `File đính kèm: ${file.name}`
                    }));
                    handleInputChange('attachments', fileAttachments);
                  }}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
              </Typography>
              {formData.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Files đã chọn:
                  </Typography>
                  {formData.attachments.map((attachment, index) => (
                    <Chip
                      key={index}
                      label={`${attachment.file_name} (${(attachment.file_size / 1024).toFixed(1)}KB)`}
                      onDelete={() => {
                        const newAttachments = formData.attachments.filter((_, i) => i !== index);
                        handleInputChange('attachments', newAttachments);
                      }}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>


          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmitForReview}
            >
              Submit for Review
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Draft Units List
        </Typography>
        {error && (
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
            {error.message || 'Không thể tải danh sách đơn vị'}
          </Alert>
        )}
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Loading...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : draftUnits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No draft units found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              draftUnits.map((unit: any) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {unit.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={unit.code} size="small" />
                  </TableCell>
                  <TableCell>{getTypeLabel(unit.type || '')}</TableCell>
                  <TableCell>
                    {unit.parent ? unit.parent.name : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={unit.status || 'draft'} 
                      color="primary" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleEditUnit(unit)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rejected Units Table */}
      {rejectedUnits.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'error.main' }}>
            Rejected Units ({rejectedUnits.length})
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rejectedLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          Loading rejected units...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  rejectedUnits.map((unit: any) => (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {unit.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={unit.code} size="small" />
                      </TableCell>
                      <TableCell>{getTypeLabel(unit.type || '')}</TableCell>
                      <TableCell>
                        {unit.parent ? unit.parent.name : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={unit.status || 'rejected'} 
                          color="error" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleEditUnit(unit)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <RefreshIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

    </Box>
  );
}
