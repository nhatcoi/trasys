'use client';

import React from 'react';
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
  Badge,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

export default function WorkflowPage() {
  // Mock data for workflow items
  const workflowItems = [
    {
      id: 1,
      name: 'Khoa Công nghệ Thông tin',
      code: 'FIT',
      type: 'Faculty',
      currentStatus: 'draft',
      submittedBy: 'Nguyễn Văn A',
      submittedAt: '2024-01-15 09:30:00',
      reviewer: 'Trần Thị B',
      priority: 'high',
    },
    {
      id: 2,
      name: 'Phòng Đào tạo',
      code: 'TRAINING',
      type: 'Department',
      currentStatus: 'pending_review',
      submittedBy: 'Lê Văn C',
      submittedAt: '2024-01-14 14:20:00',
      reviewer: 'Phạm Thị D',
      priority: 'medium',
    },
    {
      id: 3,
      name: 'Ban Giám hiệu',
      code: 'BOARD',
      type: 'Board',
      currentStatus: 'approved',
      submittedBy: 'Hoàng Văn E',
      submittedAt: '2024-01-13 10:15:00',
      reviewer: 'Vũ Thị F',
      priority: 'high',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'pending_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'pending_review':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
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
          <AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Quy trình phê duyệt
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý quy trình phê duyệt đơn vị tổ chức
          </Typography>
        </Box>
      </Stack>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge badgeContent={2} color="primary">
                <PendingIcon color="warning" />
              </Badge>
              <Box>
                <Typography variant="h6">Chờ duyệt</Typography>
                <Typography variant="body2" color="text.secondary">
                  2 đơn vị cần duyệt
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge badgeContent={1} color="info">
                <EditIcon color="primary" />
              </Badge>
              <Box>
                <Typography variant="h6">Nháp</Typography>
                <Typography variant="body2" color="text.secondary">
                  1 đơn vị chưa gửi
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge badgeContent={1} color="success">
                <CheckCircleIcon color="success" />
              </Badge>
              <Box>
                <Typography variant="h6">Đã duyệt</Typography>
                <Typography variant="body2" color="text.secondary">
                  1 đơn vị hôm nay
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Workflow Table */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Danh sách đơn vị chờ duyệt
            </Typography>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              sx={{ backgroundColor: '#2e4c92' }}
            >
              Gửi tất cả
            </Button>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Đơn vị</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ưu tiên</TableCell>
                  <TableCell>Người gửi</TableCell>
                  <TableCell>Ngày gửi</TableCell>
                  <TableCell>Người duyệt</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workflowItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <BusinessIcon color="primary" />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.code} • {item.type}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(item.currentStatus)}
                        color={getStatusColor(item.currentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.priority}
                        color={getPriorityColor(item.priority)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{item.submittedBy}</TableCell>
                    <TableCell>{item.submittedAt}</TableCell>
                    <TableCell>{item.reviewer}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lịch sử">
                          <IconButton size="small">
                            <HistoryIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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
