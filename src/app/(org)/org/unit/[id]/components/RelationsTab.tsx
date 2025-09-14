'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccountTree as AccountTreeIcon,
  Gavel as GavelIcon,
  Support as SupportIcon,
  Handshake as HandshakeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { 
  type OrgUnit, 
  type OrgUnitWithRelation, 
  useOrgUnitRelations,
  useOrgUnitRelationMutations
} from '@/features/org/api/use-org-units';
import { 
  getTypeColor, 
  getTypeIcon,
  getRelationTypeColor,
  getRelationTypeIcon,
  getRelationTypeLabel
} from '@/utils/org-unit-utils';

interface RelationsTabProps {
  unitId: string;
}

interface EditRelationData {
  relation_type: 'direct' | 'advisory' | 'support' | 'collab';
  effective_from: string;
  effective_to: string;
  note: string;
}

const relationTypes = [
  { value: 'direct', label: 'Trực tiếp', color: '#1976d2' },
  { value: 'advisory', label: 'Tư vấn', color: '#ed6c02' },
  { value: 'support', label: 'Hỗ trợ', color: '#2e7d32' },
  { value: 'collab', label: 'Hợp tác', color: '#9c27b0' },
];


export default function RelationsTab({ unitId }: RelationsTabProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<OrgUnitWithRelation | null>(null);
  const [editData, setEditData] = useState<EditRelationData>({
    relation_type: 'direct',
    effective_from: '',
    effective_to: '',
    note: '',
  });

  // Fetch relations data using the new hook
  const { data: relationsData, isLoading, error: relationsError } = useOrgUnitRelations(unitId);
  const { updateRelation } = useOrgUnitRelationMutations();

  const parentRelations = relationsData?.parentRelations || [];
  const childRelations = relationsData?.childRelations || [];

  const handleUnitClick = (unitId: string) => {
    router.push(`/org/unit/${unitId}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleEditRelation = (relation: OrgUnitWithRelation) => {
    setSelectedRelation(relation);
    setEditData({
      relation_type: relation.relation_type,
      effective_from: relation.effective_from ? new Date(relation.effective_from).toISOString().split('T')[0] : '',
      effective_to: relation.effective_to ? new Date(relation.effective_to).toISOString().split('T')[0] : '',
      note: relation.note || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveRelation = async () => {
    if (!selectedRelation) return;

    setError(null);

    try {
      const key = {
        parent_id: selectedRelation.parent_id,
        child_id: selectedRelation.child_id,
        relation_type: selectedRelation.relation_type,
        effective_from: selectedRelation.effective_from,
      };

      const updateData = {
        relation_type: editData.relation_type,
        effective_to: editData.effective_to || null,
        note: editData.note || '',
      };

      await updateRelation.mutateAsync({ key, data: updateData });
      
      setEditDialogOpen(false);
      setSuccess('Cập nhật quan hệ thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật quan hệ');
    }
  };

  const handleInputChange = (field: keyof EditRelationData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: field === 'relation_type' ? value as 'direct' | 'advisory' | 'support' | 'collab' : value,
    }));
  };

  const getRelationIcon = (relationType: string) => {
    switch (relationType) {
      case 'direct': return AccountTreeIcon;
      case 'advisory': return GavelIcon;
      case 'support': return SupportIcon;
      case 'collab': return HandshakeIcon;
      default: return BusinessIcon;
    }
  };


  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Quan hệ tổ chức
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
              disabled={updateRelation.isPending}
            >
              Hủy
            </Button>
          </Stack>
        )}
      </Box>

      {/* Alerts */}
      {(error || relationsError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error || relationsError?.message || 'Có lỗi xảy ra khi tải dữ liệu quan hệ'}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Stack spacing={3}>
        {/* Parent Relations */}
        {parentRelations && parentRelations.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đơn vị cấp dưới ({parentRelations.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Quan hệ</TableCell>
                      <TableCell>Loại quan hệ</TableCell>
                      <TableCell>Hiệu lực từ</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parentRelations.map((relation: OrgUnitWithRelation) => (
                      <TableRow 
                        key={`${relation.parent_id}-${relation.child_id}-${relation.relation_type}`} 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleUnitClick(relation.child?.id || '')}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: getTypeColor(relation.child?.type || ''), width: 32, height: 32 }}>
                              {React.createElement(getTypeIcon(relation.child?.type || ''), { fontSize: 'small' })}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {relation.child?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {relation.child?.code}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {relation.note || 'Không có ghi chú'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ 
                              backgroundColor: getRelationTypeColor(relation.relation_type), 
                              width: 20, 
                              height: 20 
                            }}>
                              {React.createElement(getRelationIcon(relation.relation_type), { fontSize: 'small' })}
                            </Avatar>
                            <Typography variant="body2">
                              {getRelationTypeLabel(relation.relation_type)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(relation.effective_from).toLocaleDateString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1}>
                            {isEditing && (
                              <Tooltip title="Chỉnh sửa quan hệ">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditRelation(relation);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Child Relations */}
        {childRelations && childRelations.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đơn vị cấp trên ({childRelations.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Quan hệ</TableCell>
                      <TableCell>Loại quan hệ</TableCell>
                      <TableCell>Hiệu lực từ</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {childRelations.map((relation: OrgUnitWithRelation) => (
                      <TableRow 
                        key={`${relation.parent_id}-${relation.child_id}-${relation.relation_type}`} 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleUnitClick(relation.parent?.id || '')}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: getTypeColor(relation.parent?.type || ''), width: 32, height: 32 }}>
                              {React.createElement(getTypeIcon(relation.parent?.type || ''), { fontSize: 'small' })}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {relation.parent?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {relation.parent?.code}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {relation.note || 'Không có ghi chú'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ 
                              backgroundColor: getRelationTypeColor(relation.relation_type), 
                              width: 20, 
                              height: 20 
                            }}>
                              {React.createElement(getRelationIcon(relation.relation_type), { fontSize: 'small' })}
                            </Avatar>
                            <Typography variant="body2">
                              {getRelationTypeLabel(relation.relation_type)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(relation.effective_from).toLocaleDateString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1}>
                            {isEditing && (
                              <Tooltip title="Chỉnh sửa quan hệ">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditRelation(relation);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}


        {/* No Relations Message */}
        {!isLoading && parentRelations.length === 0 && childRelations.length === 0 && (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AccountTreeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có quan hệ tổ chức
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đơn vị này chưa có đơn vị cha, đơn vị con hoặc quan hệ với các đơn vị khác
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Edit Relation Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Chỉnh sửa quan hệ
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Loại quan hệ</InputLabel>
              <Select
                value={editData.relation_type}
                onChange={(e) => handleInputChange('relation_type', e.target.value)}
                label="Loại quan hệ"
              >
                {relationTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ backgroundColor: type.color, width: 20, height: 20 }}>
                        {React.createElement(getRelationIcon(type.value), { fontSize: 'small' })}
                      </Avatar>
                      <Typography>{type.label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Hiệu lực từ"
              value={editData.effective_from}
              onChange={(e) => handleInputChange('effective_from', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="date"
              label="Hiệu lực đến"
              value={editData.effective_to}
              onChange={(e) => handleInputChange('effective_to', e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Để trống nếu không giới hạn thời gian"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Ghi chú"
              value={editData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Nhập ghi chú về quan hệ..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            startIcon={updateRelation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={handleSaveRelation}
            disabled={updateRelation.isPending}
          >
            {updateRelation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}