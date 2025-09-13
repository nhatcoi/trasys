'use client';

import React, { useState } from 'react';
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
  Paper,
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
  useOrgUnits, 
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
  filterOrgUnits,
  paginateItems,
  canDeleteOrgUnit,
  getDeleteErrorMessage,
  getInitialFormData,
  mapUnitToFormData,
  getOrgUnitTypes,
  getOrgUnitStatuses,
  OrgUnitType,
  OrgUnitStatus,
} from '@/utils/org-unit-utils';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Apartment as ApartmentIcon,
  Group as GroupIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export default function OrgUnitManagementPage() {
  // Custom hooks for API operations
  const { data: orgUnits = [], isLoading, error: queryError } = useOrgUnits();
  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();
  const deleteMutation = useDeleteOrgUnit();
  
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrgUnit | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateUnitData>(getInitialFormData());

  const handleCreateUnit = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setOpenCreateDialog(false);
      setFormData(getInitialFormData());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create unit');
    }
  };

  const handleEditUnit = async () => {
    if (!selectedUnit) return;
    
    try {
      await updateMutation.mutateAsync({ id: selectedUnit.id, data: formData });
      setOpenEditDialog(false);
      setSelectedUnit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update unit');
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;
    
    try {
      await deleteMutation.mutateAsync(selectedUnit.id);
      setOpenDeleteDialog(false);
      setSelectedUnit(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete unit');
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
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (!canDeleteOrgUnit(selectedUnit?.status ?? null)) {
      setError(getDeleteErrorMessage());
      handleMenuClose();
      return;
    }
    setOpenDeleteDialog(true);
    handleMenuClose();
  };


  // Filter and search
  const filteredUnits = filterOrgUnits(orgUnits, searchTerm, filterType, filterStatus);
  const paginatedUnits = paginateItems(filteredUnits, page, rowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

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

      {/* Action Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <TextField
                placeholder="Tìm kiếm đơn vị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Loại</InputLabel>
                <Select
                  value={filterType}
                  label="Loại"
                  onChange={(e) => setFilterType(e.target.value)}
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
                  value={filterStatus}
                  label="Trạng thái"
                  onChange={(e) => setFilterStatus(e.target.value)}
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

      {/* Units Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Đơn vị</TableCell>
                <TableCell>Mã</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đơn vị cha</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUnits.map((unit) => (
                <TableRow key={unit.id} hover>
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
                      onClick={(e) => handleMenuClick(e, unit)}
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
          count={filteredUnits.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
        <Tooltip 
          title={selectedUnit?.status === 'active' ? 'Không thể xóa đơn vị đang hoạt động' : ''}
          placement="left"
        >
          <span>
            <MenuItem 
              onClick={handleDeleteClick}
              disabled={selectedUnit?.status === 'active'}
              sx={{
                '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' },
                '&.Mui-disabled': {
                  opacity: 0.5,
                },
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: selectedUnit?.status === 'active' ? '#ccc' : '#f44336' }} />
              </ListItemIcon>
              <ListItemText primary="Xóa" />
            </MenuItem>
          </span>
        </Tooltip>
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
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
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
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button onClick={handleEditUnit} variant="contained" sx={{ backgroundColor: '#2e4c92' }}>
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa đơn vị "{selectedUnit?.name}"? 
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteUnit} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
