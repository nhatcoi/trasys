'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
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
  Stepper,
  Step,
  StepLabel,
  StepContent
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
  Domain as DomainIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import {
  COURSE_PRIORITIES,
  COURSE_STATUSES,
  WORKFLOW_STAGES,
  CoursePriority,
  CourseStatus,
  WorkflowStage,
  getCourseTypeLabel,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getWorkflowStageLabel,
  normalizeCoursePriority,
} from '@/constants/courses';

export default function SubjectApprovalPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | 'all'>('all');
  const [selectedStage, setSelectedStage] = useState<WorkflowStage | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<CoursePriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0
  });
  const [hasAcademicBoardRole, setHasAcademicBoardRole] = useState<boolean>(false);
  const [processIndex, setProcessIndex] = useState<number>(0);

  const approvalSteps = [
    { label: 'Khoa tạo', status: 'completed' },
    { label: 'Văn phòng đào tạo', status: 'active' },
    { label: 'Hội đồng khoa học', status: 'pending' }
  ];


  const fetchStats = async () => {
    try {
      const response = await fetch('/api/tms/courses/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats({
          pending: result.data.pending || 0,
          reviewing: result.data.reviewing || 0,
          approved: result.data.approved || 0,
          rejected: result.data.rejected || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCurrentUserRoles = async () => {
    try {
      const response = await fetch('/api/hr/user-roles/current');
      const result = await response.json();
      if (result?.success && Array.isArray(result.data)) {
        const hasRole = result.data.some((item: any) => (item?.role?.name || '').toLowerCase() === 'academic_board');
        setHasAcademicBoardRole(hasRole);
      }
    } catch (error) {
      console.error('Error fetching current user roles:', error);
      setHasAcademicBoardRole(false);
    }
  };

  const fetchSubjectsData = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      });
          
      const response = await fetch(`/api/tms/courses?${params}`);
      const result = await response.json();
      
      if (result.success && result.data?.items) {
        const transformedSubjects = result.data.items.map((course: any) => {
          const status = (course.status || CourseStatus.DRAFT) as CourseStatus;
          const workflowStage = (course.workflow_stage || WorkflowStage.FACULTY) as WorkflowStage;
          const priority = normalizeCoursePriority(course.workflow_priority || course.priority);

          return {
            id: course.id,
            code: course.code,
            name: course.name_vi,
            faculty: course.OrgUnit?.name || 'Chưa xác định',
            status,
            workflowStage,
            priority,
            submittedBy: 'System', // TODO: Get from audit data
            submittedAt: new Date(course.created_at).toISOString().split('T')[0],
            currentReviewer: null, // TODO: Get from workflow data
            credits: course.credits,
            type: getCourseTypeLabel(course.type),
            category: 'Kiến thức chuyên ngành', // Default category
          };
        });
        
        setSubjects(transformedSubjects);
      } else {
        setError('Không thể tải danh sách học phần');
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Lỗi khi tải dữ liệu');
    }
  };

// Fetch subjects from API
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data
      await Promise.all([
        fetchSubjectsData(),
        fetchStats(),
        fetchCurrentUserRoles(),
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const getProcessIndexBySubject = (subject: any): number => {
    if (subject?.status === CourseStatus.DRAFT) return 0; // Khoa
    if (subject?.status === CourseStatus.APPROVED) return 1; // Phòng Đào Tạo
    if (subject?.status === CourseStatus.PUBLISHED) return 2; // Hội Đồng KH

    switch (subject?.workflowStage) {
      case WorkflowStage.FACULTY: return 0;
      case WorkflowStage.ACADEMIC_OFFICE: return 1;
      case WorkflowStage.ACADEMIC_BOARD: return 2;
      default: return 0;
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesStatus = selectedStatus === 'all' || subject.status === selectedStatus;
    const matchesStage = selectedStage === 'all' || subject.workflowStage === selectedStage;
    const matchesPriority = selectedPriority === 'all' || subject.priority === selectedPriority;
    const matchesSearch = searchTerm === '' || 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesStage && matchesPriority && matchesSearch;
  });

  const handleViewDetails = (subject: any) => {
    router.push(`/tms/courses/${subject.id}`);
  };

  const handleApprovalAction = async (action: string, subjectId: number) => {
    try {
      console.log(`Performing ${action} on subject ${subjectId}`);
      
      if (action === 'approve') {
        const response = await fetch(`/api/tms/courses/${subjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflow_action: 'approve',
            status: CourseStatus.APPROVED
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Refresh the data
          await fetchSubjectsData();
          await fetchStats();
          alert('Phê duyệt thành công!');
        } else {
          alert('Lỗi khi phê duyệt: ' + result.error);
        }
      }
      
      if (action === 'publish') {
        const response = await fetch(`/api/tms/courses/${subjectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflow_action: 'final_approve',
            status: CourseStatus.PUBLISHED
          }),
        });

        const result = await response.json();

        if (result.success) {
          await fetchSubjectsData();
          await fetchStats();
          alert('Xuất bản thành công!');
        } else {
          alert('Lỗi khi xuất bản: ' + result.error);
        }
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error performing approval action:', error);
      alert('Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  // Use PermissionGuard for per-button permission enforcement

  const getActionButtons = (subject: any) => {
    const buttons = [];
    
    buttons.push(
      <Button
        key="view"
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetails(subject);
        }}
      >
        Xem
      </Button>
    );

    if (subject.status === CourseStatus.DRAFT) {
      buttons.push(
        <PermissionGuard key="approve-draft" requiredPermissions={['tms.course.approve']}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleApprovalAction('approve', subject.id);
            }}
          >
            Phê duyệt
          </Button>
        </PermissionGuard>
      );
    }

    if (subject.status === CourseStatus.SUBMITTED && subject.workflowStage === WorkflowStage.ACADEMIC_OFFICE) {
      buttons.push(
        <Button
          key="review"
          size="small"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleApprovalAction('review', subject.id);
          }}
        >
          Xem xét
        </Button>
      );
    }

    if (subject.status === CourseStatus.REVIEWING) {
      if (subject.workflowStage === WorkflowStage.ACADEMIC_OFFICE) {
        buttons.push(
          <PermissionGuard key="approve" requiredPermissions={['tms.course.approve']}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleApprovalAction('approve', subject.id);
              }}
            >
              Phê duyệt
            </Button>
          </PermissionGuard>
        );
        buttons.push(
          <PermissionGuard key="reject" requiredPermissions={['tms.course.reject']}>
            <Button
              size="small"
              color="error"
              startIcon={<CancelIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleApprovalAction('reject', subject.id);
              }}
            >
              Từ chối
            </Button>
          </PermissionGuard>
        );
      }
    }

    if (subject.status === CourseStatus.APPROVED) {
      buttons.push(
        <Button
          key="publish"
          size="small"
          variant="contained"
          color="info"
          startIcon={<PublishIcon />}
          disabled={!hasAcademicBoardRole}
          onClick={(e) => {
            e.stopPropagation();
            handleApprovalAction('publish', subject.id);
          }}
        >
          Xuất bản
        </Button>
      );
    }

    return buttons;
  };

  return (
    <PermissionGuard requiredPermissions={['tms.course.approve', 'tms.course.reject']}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Phê duyệt học phần
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Xem xét và phê duyệt các học phần trong hệ thống
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Chỉ có <strong>Văn phòng đào tạo</strong> và <strong>Hội đồng khoa học</strong> mới được phê duyệt.
          </Alert>
        </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Đang tải danh sách học phần...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
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
              onChange={(e) => setSelectedStatus(e.target.value as CourseStatus | 'all')}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {COURSE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Giai đoạn</InputLabel>
            <Select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as WorkflowStage | 'all')}
              label="Giai đoạn"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {WORKFLOW_STAGES.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {getWorkflowStageLabel(stage)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Độ ưu tiên</InputLabel>
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as CoursePriority | 'all')}
              label="Độ ưu tiên"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              {COURSE_PRIORITIES.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {getPriorityLabel(priority)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => {
              setSelectedStatus('all');
              setSelectedStage('all');
              setSelectedPriority('all');
              setSearchTerm('');
            }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      </Paper>

      {/* Approval Process Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quy trình phê duyệt
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Enhanced animated progress bar with icons and knob */}
        <Box sx={{ position: 'relative', px: 1, py: 3 }}>
          {(() => {
            const progress = (processIndex / 2) * 100; // 0, 50, 100
            const stages = [
              { label: 'Khoa', Icon: SchoolIcon },
              { label: 'Văn phòng đào tạo', Icon: DomainIcon },
              { label: 'Hội đồng khoa học', Icon: ScienceIcon },
            ];
            return (
              <>
                {/* Keyframes */}
                <Box sx={{
                  '@keyframes glow': {
                    '0%': { boxShadow: '0 0 0 0 rgba(25,118,210,0.5)' },
                    '70%': { boxShadow: '0 0 0 12px rgba(25,118,210,0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(25,118,210,0)' },
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.06)' },
                    '100%': { transform: 'scale(1)' },
                  }
                }} />

                {/* Track */}
                <Box sx={{ position: 'relative', height: 10, bgcolor: 'action.hover', borderRadius: 9999 }}>
                  {/* Fill */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: 10,
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #42a5f5 0%, #1e88e5 50%, #1565c0 100%)',
                      borderRadius: 9999,
                      transition: 'width 500ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />

                  {/* Knob removed per request */}
                </Box>

                {/* Stage markers */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                  {stages.map((s, idx) => {
                    const ActiveIcon = s.Icon as any;
                    const active = idx <= processIndex;
                    return (
                      <Box key={s.label} sx={{ textAlign: 'center', minWidth: 0 }}>
                        <Box sx={{ position: 'relative', height: 28 }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: active ? 'primary.main' : 'divider',
                              color: active ? 'primary.contrastText' : 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background-color 250ms ease',
                            }}
                          >
                            <ActiveIcon sx={{ fontSize: 16 }} />
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            );
          })()}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">{stats.pending}</Typography>
              <Typography variant="body2" color="text.secondary">Chờ duyệt</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">{stats.reviewing}</Typography>
              <Typography variant="body2" color="text.secondary">Đang xem xét</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">{stats.approved}</Typography>
              <Typography variant="body2" color="text.secondary">Đã phê duyệt</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error.main">{stats.rejected}</Typography>
              <Typography variant="body2" color="text.secondary">Từ chối</Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Subjects Table */}
      {!loading && !error && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Danh sách học phần ({filteredSubjects.length})
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
              {filteredSubjects.map((subject) => (
                <TableRow 
                  key={subject.id} 
                  hover
                  onClick={() => setProcessIndex(getProcessIndexBySubject(subject))}
                  sx={{ cursor: 'default' }}
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {subject.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {subject.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {subject.credits} tín chỉ • {subject.type}
                    </Typography>
                  </TableCell>
                  <TableCell>{subject.faculty}</TableCell>
                  <TableCell>
                    <Chip label={subject.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(subject.status)}
                      color={getStatusColor(subject.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getWorkflowStageLabel(subject.workflowStage)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getPriorityLabel(subject.priority)}
                      color={getPriorityColor(subject.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        {subject.submittedBy.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{subject.submittedBy}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{subject.submittedAt}</Typography>
                  </TableCell>
                  <TableCell>
                    {subject.currentReviewer ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          {subject.currentReviewer.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{subject.currentReviewer}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa phân công
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {getActionButtons(subject)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Paper>
      )}

      {/* Subject Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết học phần: {selectedSubject?.code} - {selectedSubject?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSubject && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Mã học phần:</Typography>
                    <Typography variant="body1">{selectedSubject.code}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tên học phần:</Typography>
                    <Typography variant="body1">{selectedSubject.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Khoa:</Typography>
                    <Typography variant="body1">{selectedSubject.faculty}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Danh mục:</Typography>
                    <Typography variant="body1">{selectedSubject.category}</Typography>
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
                    <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                    <Chip
                      label={getStatusLabel(selectedSubject.status)}
                      color={getStatusColor(selectedSubject.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Giai đoạn:</Typography>
                    <Typography variant="body1">{getWorkflowStageLabel(selectedSubject.workflowStage)}</Typography>
                  </Box>
                </Box>
              </Box>

              {selectedSubject.status === 'REJECTED' && selectedSubject.rejectionReason && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Lý do từ chối:</Typography>
                  <Typography variant="body2">{selectedSubject.rejectionReason}</Typography>
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
                      secondary={`Bởi ${selectedSubject.submittedBy} vào ${selectedSubject.submittedAt}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Đang chờ duyệt"
                      secondary={`Tại ${getWorkflowStageLabel(selectedSubject.workflowStage)}`}
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
      </Container>
    </PermissionGuard>
  );
}
