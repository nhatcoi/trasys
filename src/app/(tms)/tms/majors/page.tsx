'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SchoolOutlined as SchoolOutlinedIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export default function MajorsPage() {
  // Mock data - sẽ thay thế bằng API thực tế
  const majors = [
    {
      id: 1,
      code: 'CNTT',
      name: 'Công nghệ thông tin',
      department: 'Khoa Công nghệ thông tin',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Hoạt động',
      programs: 3,
      students: 450,
    },
    {
      id: 2,
      code: 'KT',
      name: 'Kế toán',
      department: 'Khoa Kinh tế',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Hoạt động',
      programs: 2,
      students: 380,
    },
    {
      id: 3,
      code: 'QTKD',
      name: 'Quản trị kinh doanh',
      department: 'Khoa Kinh tế',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Hoạt động',
      programs: 1,
      students: 220,
    },
    {
      id: 4,
      code: 'KTMT',
      name: 'Kỹ thuật máy tính',
      department: 'Khoa Công nghệ thông tin',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Tạm dừng',
      programs: 1,
      students: 150,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoạt động':
        return 'success';
      case 'Tạm dừng':
        return 'warning';
      case 'Không hoạt động':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={1}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                Quản lý ngành đào tạo
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Danh sách các ngành đào tạo trong hệ thống
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ 
                backgroundColor: 'white', 
                color: '#ed6c02',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
              }}
            >
              Thêm ngành mới
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã ngành</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên ngành</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Khoa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Bằng cấp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số chương trình</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số sinh viên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {majors.map((major) => (
                  <TableRow key={major.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {major.code}
                    </TableCell>
                    <TableCell>{major.name}</TableCell>
                    <TableCell>{major.department}</TableCell>
                    <TableCell>{major.degree}</TableCell>
                    <TableCell>{major.duration}</TableCell>
                    <TableCell>{major.programs}</TableCell>
                    <TableCell>{major.students}</TableCell>
                    <TableCell>
                      <Chip 
                        label={major.status} 
                        color={getStatusColor(major.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Xem chi tiết">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="secondary">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}


