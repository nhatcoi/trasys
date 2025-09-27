'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
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
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Stack,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Room as RoomIcon,
  Group as GroupIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  People as PeopleIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AssignmentInd as AssignmentIndIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

export default function FacultySubjectsPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const facultySubjects = [
    {
      id: 1,
      facultyName: 'Khoa Công nghệ thông tin',
      facultyCode: 'CNTT',
      totalSubjects: 45,
      activeSubjects: 38,
      draftSubjects: 5,
      pendingSubjects: 2,
      totalInstructors: 25,
      dean: 'Nguyễn Văn A',
      subjects: [
        {
          id: 1,
          code: 'CS101',
          name: 'Lập trình hướng đối tượng',
          credits: 4,
          type: 'Lý thuyết + Thực hành',
          status: 'ACTIVE',
          instructor: 'Trần Thị B',
          students: 120,
          semester: 'Học kỳ 1'
        },
        {
          id: 2,
          code: 'CS102',
          name: 'Cấu trúc dữ liệu và giải thuật',
          credits: 3,
          type: 'Lý thuyết',
          status: 'ACTIVE',
          instructor: 'Lê Văn C',
          students: 95,
          semester: 'Học kỳ 2'
        },
        {
          id: 3,
          code: 'CS103',
          name: 'Cơ sở dữ liệu',
          credits: 3,
          type: 'Lý thuyết + Thực hành',
          status: 'DRAFT',
          instructor: 'Phạm Thị D',
          students: 0,
          semester: 'Học kỳ 3'
        }
      ]
    },
    {
      id: 2,
      facultyName: 'Khoa Toán - Tin',
      facultyCode: 'MATH',
      totalSubjects: 32,
      activeSubjects: 28,
      draftSubjects: 3,
      pendingSubjects: 1,
      totalInstructors: 18,
      dean: 'Hoàng Văn E',
      subjects: [
        {
          id: 4,
          code: 'MATH101',
          name: 'Toán cao cấp',
          credits: 4,
          type: 'Lý thuyết',
          status: 'ACTIVE',
          instructor: 'Vũ Thị F',
          students: 150,
          semester: 'Học kỳ 1'
        },
        {
          id: 5,
          code: 'MATH102',
          name: 'Xác suất thống kê',
          credits: 3,
          type: 'Lý thuyết',
          status: 'ACTIVE',
          instructor: 'Đỗ Văn G',
          students: 120,
          semester: 'Học kỳ 2'
        }
      ]
    },
    {
      id: 3,
      facultyName: 'Khoa Kinh tế',
      facultyCode: 'ECON',
      totalSubjects: 28,
      activeSubjects: 25,
      draftSubjects: 2,
      pendingSubjects: 1,
      totalInstructors: 15,
      dean: 'Bùi Thị H',
      subjects: [
        {
          id: 6,
          code: 'ECON101',
          name: 'Kinh tế vi mô',
          credits: 3,
          type: 'Lý thuyết',
          status: 'ACTIVE',
          instructor: 'Lý Văn I',
          students: 80,
          semester: 'Học kỳ 1'
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'default';
      case 'PENDING': return 'warning';
      case 'INACTIVE': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'DRAFT': return 'Nháp';
      case 'PENDING': return 'Chờ duyệt';
      case 'INACTIVE': return 'Không hoạt động';
      default: return status;
    }
  };

  const filteredFaculties = facultySubjects.filter(faculty => {
    const matchesFaculty = selectedFaculty === 'all' || faculty.facultyCode === selectedFaculty;
    return matchesFaculty;
  });

  const handleViewDetails = (subject: any) => {
    setSelectedSubject(subject);
    setOpenDialog(true);
  };

  const handleEditSubject = (subjectId: number) => {
    console.log('Editing subject:', subjectId);
  };

  const handleDeleteSubject = (subjectId: number) => {
    console.log('Deleting subject:', subjectId);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssignmentIndIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Học phần thuộc Khoa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi học phần thuộc từng khoa trong hệ thống
        </Typography>
      </Box>

      {/* Statistics */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">{facultySubjects.length}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số khoa
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h6">{facultySubjects.reduce((sum, faculty) => sum + faculty.totalSubjects, 0)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng học phần
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h6">{facultySubjects.reduce((sum, faculty) => sum + faculty.totalInstructors, 0)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng giảng viên
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <GroupIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h6">{facultySubjects.reduce((sum, faculty) => sum + faculty.subjects.reduce((subSum, sub) => subSum + sub.students, 0), 0)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng sinh viên
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Khoa</InputLabel>
            <Select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              label="Khoa"
            >
              <MenuItem value="all">Tất cả khoa</MenuItem>
              {facultySubjects.map((faculty) => (
                <MenuItem key={faculty.id} value={faculty.facultyCode}>
                  {faculty.facultyName} ({faculty.facultyCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={() => setSelectedFaculty('all')}
          >
            Xóa bộ lọc
          </Button>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button variant="outlined" startIcon={<PrintIcon />}>
              In báo cáo
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Xuất Excel
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Faculty Subjects List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredFaculties.map((faculty) => (
          <Accordion key={faculty.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <SchoolIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {faculty.facultyName} ({faculty.facultyCode})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trưởng khoa: {faculty.dean} • {faculty.totalSubjects} học phần • {faculty.totalInstructors} giảng viên
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                  <Chip
                    label={`${faculty.activeSubjects} hoạt động`}
                    color="success"
                    size="small"
                  />
                  <Chip
                    label={`${faculty.draftSubjects} nháp`}
                    color="default"
                    size="small"
                  />
                  <Chip
                    label={`${faculty.pendingSubjects} chờ duyệt`}
                    color="warning"
                    size="small"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Danh sách học phần ({faculty.subjects.length})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => console.log('Add subject to faculty:', faculty.id)}
                  >
                    Thêm học phần
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã môn</TableCell>
                        <TableCell>Tên học phần</TableCell>
                        <TableCell>Tín chỉ</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell>Giảng viên</TableCell>
                        <TableCell>Sinh viên</TableCell>
                        <TableCell>Học kỳ</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faculty.subjects.map((subject) => (
                        <TableRow key={subject.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {subject.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{subject.name}</Typography>
                          </TableCell>
                          <TableCell>{subject.credits}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {subject.type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                {subject.instructor.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">{subject.instructor}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{subject.students}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{subject.semester}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(subject.status)}
                              color={getStatusColor(subject.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" onClick={() => handleViewDetails(subject)}>
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleEditSubject(subject.id)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteSubject(subject.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Thống kê học phần
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Hoạt động</Typography>
                        <Typography variant="body2">{faculty.activeSubjects}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(faculty.activeSubjects / faculty.totalSubjects) * 100}
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      />
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Nháp</Typography>
                        <Typography variant="body2">{faculty.draftSubjects}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(faculty.draftSubjects / faculty.totalSubjects) * 100}
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Chờ duyệt</Typography>
                        <Typography variant="body2">{faculty.pendingSubjects}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(faculty.pendingSubjects / faculty.totalSubjects) * 100}
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Thông tin khoa
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <SupervisorAccountIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Trưởng khoa" 
                          secondary={faculty.dean}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Giảng viên" 
                          secondary={`${faculty.totalInstructors} người`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Học phần" 
                          secondary={`${faculty.totalSubjects} môn`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Hành động nhanh
                    </Typography>
                    <Stack spacing={1}>
                      <Button size="small" variant="outlined" startIcon={<AddIcon />}>
                        Thêm học phần
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<PersonIcon />}>
                        Quản lý giảng viên
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<SettingsIcon />}>
                        Cài đặt khoa
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Subject Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết học phần: {selectedSubject?.code} - {selectedSubject?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSubject && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Mã học phần:</Typography>
                  <Typography variant="body1">{selectedSubject.code}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tên học phần:</Typography>
                  <Typography variant="body1">{selectedSubject.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Tín chỉ:</Typography>
                  <Typography variant="body1">{selectedSubject.credits}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Loại:</Typography>
                  <Typography variant="body1">{selectedSubject.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Giảng viên:</Typography>
                  <Typography variant="body1">{selectedSubject.instructor}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Số sinh viên:</Typography>
                  <Typography variant="body1">{selectedSubject.students}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Học kỳ:</Typography>
                  <Typography variant="body1">{selectedSubject.semester}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                  <Chip
                    label={getStatusLabel(selectedSubject.status)}
                    color={getStatusColor(selectedSubject.status) as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          <Button variant="contained">Chỉnh sửa</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
