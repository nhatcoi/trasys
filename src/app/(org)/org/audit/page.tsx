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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Grid,
} from '@mui/material';
import {
  History as HistoryIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

export default function AuditPage() {
  const [filters, setFilters] = useState({
    action: 'all',
    user: '',
    dateFrom: null,
    dateTo: null,
  });

  // Mock audit log data
  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      action: 'create',
      entityType: 'org_unit',
      entityName: 'Khoa Công nghệ Thông tin',
      entityCode: 'FIT',
      user: 'Nguyễn Văn A',
      userRole: 'Admin',
      ipAddress: '192.168.1.100',
      details: {
        changes: {
          name: { from: null, to: 'Khoa Công nghệ Thông tin' },
          code: { from: null, to: 'FIT' },
          type: { from: null, to: 'Faculty' },
        },
      },
    },
    {
      id: 2,
      timestamp: '2024-01-15 10:15:42',
      action: 'update',
      entityType: 'org_unit',
      entityName: 'Phòng Đào tạo',
      entityCode: 'TRAINING',
      user: 'Trần Thị B',
      userRole: 'Manager',
      ipAddress: '192.168.1.101',
      details: {
        changes: {
          name: { from: 'Phòng Đào tạo cũ', to: 'Phòng Đào tạo' },
          status: { from: 'draft', to: 'active' },
        },
      },
    },
    {
      id: 3,
      timestamp: '2024-01-14 16:45:18',
      action: 'delete',
      entityType: 'org_unit',
      entityName: 'Phòng Test',
      entityCode: 'TEST',
      user: 'Lê Văn C',
      userRole: 'Admin',
      ipAddress: '192.168.1.102',
      details: {
        changes: {
          status: { from: 'active', to: 'deleted' },
        },
      },
    },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'error';
      case 'view':
        return 'info';
      default:
        return 'default';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Tạo mới';
      case 'update':
        return 'Cập nhật';
      case 'delete':
        return 'Xóa';
      case 'view':
        return 'Xem';
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <AddIcon />;
      case 'update':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'view':
        return <VisibilityIcon />;
      default:
        return <HistoryIcon />;
    }
  };

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
          <HistoryIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Lịch sử thay đổi
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi tất cả các thay đổi trong hệ thống
          </Typography>
        </Box>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Bộ lọc
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Hành động</InputLabel>
                <Select
                  value={filters.action}
                  label="Hành động"
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="create">Tạo mới</MenuItem>
                  <MenuItem value="update">Cập nhật</MenuItem>
                  <MenuItem value="delete">Xóa</MenuItem>
                  <MenuItem value="view">Xem</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Người dùng"
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                placeholder="Tìm theo tên người dùng"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Từ ngày"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Đến ngày"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" sx={{ backgroundColor: '#2e4c92' }}>
              Áp dụng
            </Button>
            <Button variant="outlined">
              Xóa bộ lọc
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Xuất báo cáo
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Nhật ký hoạt động
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {auditLogs.length} bản ghi
            </Typography>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Hành động</TableCell>
                  <TableCell>Đối tượng</TableCell>
                  <TableCell>Người thực hiện</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Chi tiết</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {log.timestamp}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getActionIcon(log.action)}
                        <Chip
                          label={getActionLabel(log.action)}
                          color={getActionColor(log.action)}
                          size="small"
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon color="primary" fontSize="small" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {log.entityName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.entityCode}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PersonIcon color="primary" fontSize="small" />
                        <Box>
                          <Typography variant="body2">
                            {log.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.userRole}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {Object.keys(log.details.changes).length} thay đổi
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
