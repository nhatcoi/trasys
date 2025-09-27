'use client';

import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Badge,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Pagination,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  Publish as PublishIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  code: string;
  name_vi: string;
  name_en?: string;
  credits: number;
  type: string;
  status: string;
  workflow_stage: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  OrgUnit?: {
    name: string;
  };
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Fetch faculties from API
  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/tms/faculties');
      const result = await response.json();

      if (response.ok) {
        setFaculties(result.data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch faculties:', err);
    }
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedFaculty !== 'all' && { orgUnitId: selectedFaculty }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/tms/courses?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch courses');
      }

      // Use the new API structure with data.items
      if (result.success && result.data) {
        setCourses(result.data.items || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load courses on component mount and when filters change
  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [page, selectedStatus, selectedFaculty, searchTerm]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'SUBMITTED': return 'primary';
      case 'REVIEWING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PUBLISHED': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Nháp';
      case 'SUBMITTED': return 'Đã gửi';
      case 'REVIEWING': return 'Đang xem xét';
      case 'APPROVED': return 'Đã phê duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'PUBLISHED': return 'Đã xuất bản';
      default: return status;
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'FACULTY': return 'Khoa';
      case 'ACADEMIC_OFFICE': return 'Văn phòng đào tạo';
      case 'ACADEMIC_BOARD': return 'Hội đồng khoa học';
      default: return stage;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Cao';
      case 'MEDIUM': return 'Trung bình';
      case 'LOW': return 'Thấp';
      default: return priority;
    }
  };

  // Filter courses (now handled by API)
  const filteredCourses = courses;

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setOpenDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/tms/courses/${course.id}/edit`);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học phần này?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tms/courses/${courseId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete course');
      }

      // Check if deletion was successful
      if (result.success) {
        setSuccessMessage('Xóa học phần thành công!');
        setShowSnackbar(true);
        // Refresh courses list
        fetchCourses();
      } else {
        throw new Error(result.error || 'Failed to delete course');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleWorkflowAction = (action: string, subjectId: number) => {
    console.log(`Performing ${action} on subject ${subjectId}`);
    setOpenDialog(false);
  };

  const getActionButtons = (subject: any) => {
    const buttons = [];
    
    buttons.push(
      <Button
        key="view"
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={() => handleViewDetails(subject)}
      >
        Xem
      </Button>
    );

    if (subject.status === 'SUBMITTED') {
      buttons.push(
        <Button
          key="review"
          size="small"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleWorkflowAction('review', subject.id)}
        >
          Xem xét
        </Button>
      );
    }

    if (subject.status === 'REVIEWING') {
      if (subject.workflowStage === 'ACADEMIC_OFFICE') {
        buttons.push(
          <Button
            key="approve"
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleWorkflowAction('approve', subject.id)}
          >
            Phê duyệt
          </Button>
        );
        buttons.push(
          <Button
            key="reject"
            size="small"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleWorkflowAction('reject', subject.id)}
          >
            Từ chối
          </Button>
        );
      }
    }

    if (subject.status === 'APPROVED') {
      buttons.push(
        <Button
          key="publish"
          size="small"
          variant="contained"
          color="info"
          startIcon={<PublishIcon />}
          onClick={() => handleWorkflowAction('publish', subject.id)}
        >
          Xuất bản
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssignmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Quản lý học phần
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi các học phần trong hệ thống
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Học phần ({filteredCourses.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/tms/courses/create')}
          >
            Tạo học phần mới
          </Button>
        </Stack>
      </Paper>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Tìm kiếm học phần..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="DRAFT">Nháp</MenuItem>
              <MenuItem value="SUBMITTED">Đã gửi</MenuItem>
              <MenuItem value="REVIEWING">Đang xem xét</MenuItem>
              <MenuItem value="APPROVED">Đã phê duyệt</MenuItem>
              <MenuItem value="REJECTED">Từ chối</MenuItem>
              <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Khoa</InputLabel>
            <Select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              label="Khoa"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="all">Tất cả khoa</MenuItem>
              {faculties.map((faculty) => (
                <MenuItem key={faculty.id} value={faculty.id}>
                  {faculty.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Độ ưu tiên</InputLabel>
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              label="Độ ưu tiên"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="HIGH">Cao</MenuItem>
              <MenuItem value="MEDIUM">Trung bình</MenuItem>
              <MenuItem value="LOW">Thấp</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => {
              setSelectedStatus('all');
              setSelectedFaculty('all');
              setSelectedPriority('all');
              setSearchTerm('');
            }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      </Paper>

      {/* Subjects Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách học phần
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã môn</TableCell>
                <TableCell>Tên học phần</TableCell>
                <TableCell>Khoa</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Giai đoạn</TableCell>
                <TableCell align="center">Độ ưu tiên</TableCell>
                <TableCell>Người gửi</TableCell>
                <TableCell>Ngày gửi</TableCell>
                <TableCell>Người xem xét</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography>Đang tải...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : error ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Không có học phần nào</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                <TableRow 
                  key={course.id} 
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/tms/courses/${course.id}`)}
                >
                  <TableCell>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold"
                      sx={{ 
                        cursor: 'pointer', 
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tms/courses/${course.id}`);
                      }}
                    >
                      {course.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tms/courses/${course.id}`);
                      }}
                    >
                      {course.name_vi}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.credits} tín chỉ • {course.type}
                    </Typography>
                  </TableCell>
                  <TableCell>{course.OrgUnit?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label="Kiến thức chuyên ngành" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(course.status)}
                      color={getStatusColor(course.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStageLabel(course.workflow_stage)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label="Trung bình"
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {course.submitted_at ? new Date(course.submitted_at).toLocaleDateString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      Chưa phân công
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(course);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tms/courses/${course.id}`);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* Course Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết học phần: {selectedCourse?.code} - {selectedCourse?.name_vi}
        </DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Mã học phần:</Typography>
                    <Typography variant="body1">{selectedCourse.code}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tên học phần:</Typography>
                    <Typography variant="body1">{selectedCourse.name_vi}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Khoa:</Typography>
                    <Typography variant="body1">{selectedCourse.OrgUnit?.name || 'N/A'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Danh mục:</Typography>
                    <Typography variant="body1">Kiến thức chuyên ngành</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tín chỉ:</Typography>
                    <Typography variant="body1">{selectedCourse.credits}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Loại:</Typography>
                    <Typography variant="body1">{selectedCourse.type}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                    <Chip
                      label={getStatusLabel(selectedCourse.status)}
                      color={getStatusColor(selectedCourse.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Giai đoạn:</Typography>
                    <Typography variant="body1">{getStageLabel(selectedCourse.workflow_stage)}</Typography>
                  </Box>
                </Box>
              </Box>

              {selectedCourse.status === 'REJECTED' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Lý do từ chối:</Typography>
                  <Typography variant="body2">N/A</Typography>
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Lịch sử phê duyệt
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tạo mới"
                      secondary={`Bởi N/A vào ${selectedCourse.submitted_at ? new Date(selectedCourse.submitted_at).toLocaleDateString() : 'N/A'}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Đang chờ duyệt"
                      secondary={`Tại ${getStageLabel(selectedCourse.workflow_stage)}`}
                    />
                  </ListItem>
                </List>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Ghi chú và bình luận
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Thêm ghi chú..."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button startIcon={<CommentIcon />} size="small">
                          Thêm
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Thực hiện thao tác
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={successMessage}
      />
    </Container>
  );
}
