'use client';

import React, { useState } from 'react';
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
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useOrgUnitHistory, type OrgUnitHistory } from '@/features/org/api/use-org-units';
import { 
  getChangeTypeColor,
  getChangeTypeLabel
} from '@/utils/org-unit-utils';

interface HistoryTabProps {
  unitId: string;
}

export default function HistoryTab({ unitId }: HistoryTabProps) {
  const [filters, setFilters] = useState({
    change_type: '',
    page: 1,
    size: 20,
  });

  // Use React Query to fetch history
  const { data: historyResponse, isLoading: loading, error, refetch } = useOrgUnitHistory({
    org_unit_id: unitId,
    change_type: filters.change_type || undefined,
    page: filters.page,
    size: filters.size,
  });  

  const history = historyResponse?.items || [];

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filter changes
    }));
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Lịch sử thay đổi
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Làm mới
        </Button>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Bộ lọc
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại thay đổi</InputLabel>
                <Select
                  value={filters.change_type}
                  label="Loại thay đổi"
                  onChange={(e) => handleFilterChange('change_type', e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="create">Tạo mới</MenuItem>
                  <MenuItem value="update">Cập nhật</MenuItem>
                  <MenuItem value="delete">Xóa</MenuItem>
                  <MenuItem value="status_change">Thay đổi trạng thái</MenuItem>
                  <MenuItem value="name_change">Thay đổi tên</MenuItem>
                  <MenuItem value="parent_change">Thay đổi đơn vị cha</MenuItem>
                  <MenuItem value="type_change">Thay đổi loại</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Số lượng hiển thị</InputLabel>
                <Select
                  value={filters.size}
                  label="Số lượng hiển thị"
                  onChange={(e) => handleFilterChange('size', e.target.value.toString())}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">
              <AlertTitle>Lỗi</AlertTitle>
              {error}
            </Alert>
          ) : history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Không có lịch sử thay đổi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa có thay đổi nào được ghi nhận cho đơn vị này
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loại thay đổi</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Chi tiết</TableCell>
                    <TableCell>Ghi chú</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Chip
                        //   label={getChangeTypeLabel(record.change_type)}
                        label={record.change_type}
                          size="small"
                          sx={{
                            backgroundColor: getChangeTypeColor(record.change_type),
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.changed_at ? 
                            new Date(record.changed_at).toLocaleString('vi-VN') : 
                            'Không xác định'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={1}>
                          {record.old_name && record.new_name && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Tên:
                              </Typography>
                              <Typography variant="body2" component="div">
                                <span style={{ textDecoration: 'line-through', color: '#d32f2f' }}>
                                  {record.old_name}
                                </span>
                                {' → '}
                                <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                  {record.new_name}
                                </span>
                              </Typography>
                            </Box>
                          )}
                          {record.details && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Chi tiết:
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.875rem',
                                  backgroundColor: '#f5f5f5',
                                  p: 1,
                                  borderRadius: 1,
                                  overflow: 'auto',
                                  maxWidth: 300
                                }}
                              >
                                {JSON.stringify(record.details, null, 2)}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.details?.note || 'Không có ghi chú'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
