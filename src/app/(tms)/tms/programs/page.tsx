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
  School as SchoolIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export default function ProgramsPage() {
  // Mock data - sẽ thay thế bằng API thực tế
  const programs = [
    {
      id: 1,
      code: 'CNTT',
      name: 'Công nghệ thông tin',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Hoạt động',
      faculty: 'Khoa Công nghệ thông tin',
      students: 450,
    },
    {
      id: 2,
      code: 'KT',
      name: 'Kế toán',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Hoạt động',
      faculty: 'Khoa Kinh tế',
      students: 380,
    },
    {
      id: 3,
      code: 'QTKD',
      name: 'Quản trị kinh doanh',
      degree: 'Cử nhân',
      duration: '4 năm',
      status: 'Tạm dừng',
      faculty: 'Khoa Kinh tế',
      students: 220,
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
        <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={1}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                Quản lý chương trình đào tạo
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Danh sách các chương trình đào tạo trong hệ thống
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ 
                backgroundColor: 'white', 
                color: '#1976d2',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
              }}
              href="/tms/programs/create"
            >
              Tạo chương trình mới
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mã chương trình</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên chương trình</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Bằng cấp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Khoa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số sinh viên</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {program.code}
                    </TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>{program.degree}</TableCell>
                    <TableCell>{program.duration}</TableCell>
                    <TableCell>{program.faculty}</TableCell>
                    <TableCell>{program.students}</TableCell>
                    <TableCell>
                      <Chip 
                        label={program.status} 
                        color={getStatusColor(program.status) as any}
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


