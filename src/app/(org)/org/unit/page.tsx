'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  useCreateOrgUnit, 
  useUpdateOrgUnit, 
  useDeleteOrgUnit,
  type OrgUnit,
  type CreateUnitData 
} from '@/features/org/api/use-org-units';
import {
  getStatusColor,
  getTypeColor,
  getTypeIcon,
  canDeleteOrgUnit,
  getDeleteErrorMessage,
  getInitialFormData,
  mapUnitToFormData,
  getOrgUnitTypes,
  getOrgUnitStatuses,
} from '@/utils/org-unit-utils';
import { ORG_UNIT_ALERTS } from '@/utils/alert-utils';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useOrgUnitsPagination } from '@/hooks/use-org-units-pagination';

export default function OrgUnitManagementPage() {
  const router = useRouter();
  
  // Use pagination hook
  const {
    orgUnits,
    pagination,
    isLoading,
    isFetching,
    error: queryError,
    paginationState,
    handlers,
    getFilterValue,
    updateFilter,
  } = useOrgUnitsPagination({
    initialPage: 0,
    initialSize: 10,
    initialSort: 'name',
    initialOrder: 'asc',
    initialSearch: '',
    initialFilters: {
      type: 'all',
      status: 'all',
    },
    searchDebounceMs: 500,
  });

  // Custom hooks for API operations
  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();
  const deleteMutation = useDeleteOrgUnit();
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateUnitData>(getInitialFormData());

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreateUnit = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setOpenCreateDialog(false);
      setFormData(getInitialFormData());
      setSuccessMessage(ORG_UNIT_ALERTS.UNIT_CREATED(formData.name).message);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(ORG_UNIT_ALERTS.UNIT_CREATE_FAILED(formData.name).message);
      setSuccessMessage(null); // Clear any previous success messages
    }
  };

  const handleEditUnit = async () => {
    if (!selectedUnit) return;
    
    try {
      await updateMutation.mutateAsync({ id: selectedUnit.id, data: formData });
      setOpenEditDialog(false);
      setSelectedUnit(null);
      setSuccessMessage(ORG_UNIT_ALERTS.UNIT_UPDATED(selectedUnit.name).message);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(ORG_UNIT_ALERTS.UNIT_UPDATE_FAILED(selectedUnit.name).message);
      setSuccessMessage(null); // Clear any previous success messages
    }
  };

  const handleDeleteUnit = async () => {
    console.log("handleDeleteUnit called - selectedUnit:", selectedUnit);
    if (!selectedUnit) {
      console.log("selectedUnit is null/undefined, returning");
      return;
    }
    
    try {
      await deleteMutation.mutateAsync(selectedUnit.id);
      setOpenDeleteDialog(false);
      setSelectedUnit(null);
      setSuccessMessage(ORG_UNIT_ALERTS.UNIT_DISABLED(selectedUnit.name).message);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(ORG_UNIT_ALERTS.UNIT_DELETE_FAILED(selectedUnit.name).message);
      setSuccessMessage(null); // Clear any previous success messages
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, unit: OrgUnit) => {
    setAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUnit(null);
  };

  const handleEditClick = () => {
    if (selectedUnit) {
      setFormData(mapUnitToFormData(selectedUnit));
      setOpenEditDialog(true);
      setAnchorEl(null); // Only close menu, keep selectedUnit
    }
  };

  const handleDeleteClick = () => {
    console.log('handleDeleteClick - selectedUnit:', selectedUnit);
    setOpenDeleteDialog(true);
    setAnchorEl(null); // Only close menu, keep selectedUnit
  };

  const handleRowClick = (unit: OrgUnit) => {
    router.push(`/org/unit/${unit.id}`);
  };


  // Handlers are now provided by the pagination hook

  // if (isLoading) {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
  //       <CircularProgress size={60} />
  //     </Box>
  //   );
  // }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            backgroundColor: '#2e4c92',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Quản lý đơn vị
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý các đơn vị tổ chức trong hệ thống
          </Typography>
        </Box>
      </Stack>

      {(error || queryError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {error || (queryError instanceof Error ? queryError.message : 'Unknown error')}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          <AlertTitle>Thành công</AlertTitle>
          {successMessage}
        </Alert>
      )}

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            {/* Loading indicator */}
            {isFetching && (
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <CircularProgress size={20} />
              </Box>
            )}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
               <TextField
                 placeholder="Tìm kiếm đơn vị..."
                 value={paginationState.search}
                 onChange={(e) => handlers.handleSearchChange(e.target.value)}
                 size="small"
                 sx={{ minWidth: 250 }}
                 InputProps={{
                   startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                 }}
               />
               
               <FormControl size="small" sx={{ minWidth: 120 }}>
                 <InputLabel>Loại</InputLabel>
                 <Select
                   value={getFilterValue('type')}
                   label="Loại"
                   onChange={(e) => updateFilter('type', e.target.value)}
                 >
                   <MenuItem value="all">Tất cả</MenuItem>
                   {getOrgUnitTypes().map((type) => (
                     <MenuItem key={type.value} value={type.value}>
                       {type.label}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>

               <FormControl size="small" sx={{ minWidth: 120 }}>
                 <InputLabel>Trạng thái</InputLabel>
                 <Select
                   value={getFilterValue('status')}
                   label="Trạng thái"
                   onChange={(e) => updateFilter('status', e.target.value)}
                 >
                   <MenuItem value="all">Tất cả</MenuItem>
                   {getOrgUnitStatuses().map((status) => (
                     <MenuItem key={status.value} value={status.value}>
                       {status.label}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                disabled={isLoading}
              >
                Làm mới
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
                sx={{ backgroundColor: '#2e4c92' }}
              >
                Thêm đơn vị
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {pagination && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Hiển thị {((pagination.page - 1) * pagination.size) + 1}-{Math.min(pagination.page * pagination.size, pagination.total)} của {pagination.total} đơn vị
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`Trang ${pagination.page}/${pagination.totalPages}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                {pagination.hasNextPage && (
                  <Chip 
                    label="Có trang tiếp" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Units Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handlers.handleSortChange('name')}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Đơn vị</span>
                    {paginationState.sort === 'name' && (
                      <span>{paginationState.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handlers.handleSortChange('code')}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Mã</span>
                    {paginationState.sort === 'code' && (
                      <span>{paginationState.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đơn vị cha</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handlers.handleSortChange('created_at')}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Ngày tạo</span>
                    {paginationState.sort === 'created_at' && (
                      <span>{paginationState.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orgUnits.map((unit) => (
                <TableRow 
                  key={unit.id} 
                  hover 
                  onClick={() => handleRowClick(unit)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 76, 146, 0.04)',
                    }
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ backgroundColor: getTypeColor(unit.type) }}>
                        {React.createElement(getTypeIcon(unit.type))}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {unit.name}
                        </Typography>
                        {unit.description && (
                          <Typography variant="caption" color="text.secondary">
                            {unit.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={unit.code}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={unit.type || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: getTypeColor(unit.type),
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={unit.status || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(unit.status),
                        color: 'white',
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {unit.parent ? (
                      <Typography variant="body2">
                        {unit.parent.name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {unit.employees?.length || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(unit.created_at).toLocaleDateString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuClick(e, unit);
                      }}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
         <TablePagination
           rowsPerPageOptions={[5, 10, 25]}
           component="div"
           count={pagination?.total || 0}
           rowsPerPage={paginationState.size}
           page={paginationState.page}
           onPageChange={handlers.handleChangePage}
           onRowsPerPageChange={handlers.handleChangeRowsPerPage}
           labelRowsPerPage="Số dòng mỗi trang:"
           labelDisplayedRows={({ from, to, count }) => 
             `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
           }
         />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            '& .MuiMenuItem-root, & .MuiListItemText-root, & .MuiListItemText-primary': {
              color: '#000000 !important',
            },
          }
        }}
      >
        <MenuItem 
          onClick={handleEditClick}
          sx={{
            '&:hover': { backgroundColor: 'rgba(46, 76, 146, 0.08)' },
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#2e4c92' }} />
          </ListItemIcon>
          <ListItemText primary="Chỉnh sửa" />
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick}
          sx={{
            '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' },
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText primary="Vô hiệu hóa" />
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm đơn vị mới</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tên đơn vị"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Mã đơn vị"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Loại đơn vị</InputLabel>
              <Select
                value={formData.type}
                label="Loại đơn vị"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {getOrgUnitTypes().map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Đơn vị cha</InputLabel>
              <Select
                value={formData.parent_id || ''}
                label="Đơn vị cha"
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
              >
                <MenuItem value="">Không có</MenuItem>
                {orgUnits.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {getOrgUnitStatuses().map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Ngày hiệu lực từ"
              type="date"
              value={formData.effective_from}
              onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ngày hiệu lực đến"
              type="date"
              value={formData.effective_to}
              onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button onClick={handleCreateUnit} variant="contained" sx={{ backgroundColor: '#2e4c92' }}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => {
        setOpenEditDialog(false);
        setSelectedUnit(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa đơn vị</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tên đơn vị"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Mã đơn vị"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Loại đơn vị</InputLabel>
              <Select
                value={formData.type}
                label="Loại đơn vị"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {getOrgUnitTypes().map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Đơn vị cha</InputLabel>
              <Select
                value={formData.parent_id || ''}
                label="Đơn vị cha"
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
              >
                <MenuItem value="">Không có</MenuItem>
                {orgUnits.filter(unit => unit.id !== selectedUnit?.id).map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {getOrgUnitStatuses().map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Ngày hiệu lực từ"
              type="date"
              value={formData.effective_from}
              onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ngày hiệu lực đến"
              type="date"
              value={formData.effective_to}
              onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditDialog(false);
            setSelectedUnit(null);
          }}>Hủy</Button>
          <Button onClick={handleEditUnit} variant="contained" sx={{ backgroundColor: '#2e4c92' }}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => {
        setOpenDeleteDialog(false);
        setSelectedUnit(null);
      }}>
        <DialogTitle>Xác nhận vô hiệu hóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn vô hiệu hóa đơn vị &quot;{selectedUnit?.name}&quot;? 
            Đơn vị sẽ bị xóa khỏi hệ thống và không thể khôi phục.
          </Typography>
          {selectedUnit?.status === 'active' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Cảnh báo</AlertTitle>
              Đây là đơn vị đang hoạt động. Việc vô hiệu hóa có thể ảnh hưởng đến các chức năng liên quan.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDeleteDialog(false);
            setSelectedUnit(null);
          }}>Hủy</Button>
          <Button onClick={handleDeleteUnit} variant="contained" color="error">
            Vô hiệu hóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
