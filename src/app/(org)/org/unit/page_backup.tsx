'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
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
  canDeleteOrgUnit,
  getDeleteErrorMessage,
  getInitialFormData,
  mapUnitToFormData,
  getOrgUnitTypes,
  getOrgUnitStatuses,
} from '@/utils/org-unit-utils';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Memoized Filter Bar Component
const FilterBar = memo(({ 
  searchTerm, 
  filterType, 
  filterStatus, 
  onSearchChange, 
  onFilterChange,
  isFetching 
}: {
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (type: string, status: string) => void;
  isFetching: boolean;
}) => {
  return (
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
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
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
                onChange={(e) => onFilterChange(e.target.value, filterStatus)}
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
                onChange={(e) => onFilterChange(filterType, e.target.value)}
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
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {/* handleCreateClick() */}}
            >
              Thêm đơn vị
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});

FilterBar.displayName = 'FilterBar';

// Memoized Pagination Info Component
const PaginationInfo = memo(({ pagination }: { pagination: any }) => {
  if (!pagination) return null;
  
  return (
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
  );
});

PaginationInfo.displayName = 'PaginationInfo';

// Memoized Table Component
const OrgUnitsTable = memo(({ 
  orgUnits, 
  pagination, 
  sortBy, 
  sortOrder, 
  onSortChange, 
  onPageChange, 
  onRowsPerPageChange, 
  page, 
  rowsPerPage 
}: {
  orgUnits: any[];
  pagination: any;
  sortBy: string;
  sortOrder: string;
  onSortChange: (field: string) => void;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  page: number;
  rowsPerPage: number;
}) => {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => onSortChange('name')}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Đơn vị</span>
                  {sortBy === 'name' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Stack>
              </TableCell>
              <TableCell 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => onSortChange('code')}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Mã</span>
                  {sortBy === 'code' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Stack>
              </TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Đơn vị cha</TableCell>
              <TableCell>Nhân viên</TableCell>
              <TableCell 
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                onClick={() => onSortChange('created_at')}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Ngày tạo</span>
                  {sortBy === 'created_at' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Stack>
              </TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orgUnits.map((unit) => (
              <TableRow key={unit.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ backgroundColor: getTypeColor(unit.type) }}>
                      {React.createElement(getTypeIcon(unit.type))}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {unit.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {unit.description || 'Không có mô tả'}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {unit.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={unit.type} 
                    size="small" 
                    sx={{ backgroundColor: getTypeColor(unit.type), color: 'white' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={unit.status} 
                    size="small" 
                    color={getStatusColor(unit.status)}
                    variant="outlined"
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
                    onClick={(e) => {/* handleMenuClick(e, unit) */}}
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
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Số dòng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
        }
      />
    </Card>
  );
});

OrgUnitsTable.displayName = 'OrgUnitsTable';

export default function OrgUnitManagementPage() {
  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // API query parameters - memoized to prevent unnecessary re-renders
  const queryParams = useMemo(() => ({
    page: page + 1, // API uses 1-based pagination
    size: rowsPerPage,
    sort: sortBy,
    order: sortOrder,
    search: debouncedSearchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    type: filterType !== 'all' ? filterType : undefined,
  }), [page, rowsPerPage, sortBy, sortOrder, debouncedSearchTerm, filterStatus, filterType]);
  
  // Custom hooks for API operations
  const { data: orgUnitsResponse, isLoading, isFetching, error: queryError } = useOrgUnits(queryParams);
  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();
  const deleteMutation = useDeleteOrgUnit();
  
  const [error, setError] = useState<string | null>(null);
  
  // Extract data from response
  const orgUnits = orgUnitsResponse?.items || [];
  const pagination = orgUnitsResponse?.pagination;

  // Debug logging
  console.log('Query params:', queryParams);
  console.log('API response:', orgUnitsResponse);
  console.log('Org units:', orgUnits);
  console.log('Pagination:', pagination);
  console.log('Loading:', isLoading);
  console.log('Error:', queryError);
  
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


  // Memoized handlers to prevent unnecessary re-renders
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(0); // Reset to first page when searching
  }, []);

  const handleFilterChange = useCallback((type: string, status: string) => {
    setFilterType(type);
    setFilterStatus(status);
    setPage(0); // Reset to first page when filtering
  }, []);

  const handleSortChange = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(0); // Reset to first page when sorting
  }, [sortBy, sortOrder]);

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

      {/* Filter Bar - Memoized */}
      <FilterBar
        searchTerm={searchTerm}
        filterType={filterType}
        filterStatus={filterStatus}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        isFetching={isFetching}
      />

      {/* Pagination Info - Memoized */}
      <PaginationInfo pagination={pagination} />

      {/* Units Table - Memoized */}
      <OrgUnitsTable
        orgUnits={orgUnits}
        pagination={pagination}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
      />
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handleSortChange('name')}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Đơn vị</span>
                    {sortBy === 'name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handleSortChange('code')}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Mã</span>
                    {sortBy === 'code' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Đơn vị cha</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => handleSortChange('created_at')}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <span>Ngày tạo</span>
                    {sortBy === 'created_at' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orgUnits.map((unit) => (
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
          count={pagination?.total || 0}
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
