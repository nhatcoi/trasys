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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  IconButton,
  Badge,
  Alert,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Reply as ReplyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Flag as PriorityIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  COURSE_STATUSES,
  CoursePrerequisiteType,
  CoursePriority,
  CourseStatus,
  CourseType,
  WorkflowStage,
  getCourseTypeLabel,
  getPrereqChipColor,
  getPrereqLabelVi,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  getWorkflowStageLabel,
  normalizeCoursePriority,
} from '@/constants/courses';

interface CourseDetail {
  id: string;
  code: string;
  name_vi: string;
  name_en?: string;
  credits: number;
  type: CourseType | string;
  status: CourseStatus | string;
  org_unit_id: string;
  created_at: string;
  updated_at: string;
  description?: string;
  OrgUnit?: {
    name: string;
    code?: string;
  };
  workflows?: Array<{
    id: string;
    status: CourseStatus | string;
    workflow_stage: WorkflowStage | string;
    priority: CoursePriority | string;
    notes?: string;
    created_at: string;
    updated_at: string;
  }>;
  contents?: Array<{
    id: string;
    prerequisites?: string;
    learning_objectives?: Array<{
      type: string;
      objective: string;
    }>;
    assessment_methods?: Array<{
      method: string;
      weight: number;
  description: string;
    }>;
    passing_grade: number;
    created_at: string;
    updated_at: string;
  }>;
  audits?: Array<{
    id: string;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
  }>;
  course_approval_history?: Array<{
    id: string;
    action: string;
    from_status: string;
    to_status: string;
    reviewer_role: string;
    comments: string;
    created_at: string;
  }>;
  instructor_qualifications?: any[];
  course_syllabus?: any[];
  prerequisites?: Array<{
    id: string;
    course_id: string;
    prerequisite_course_id: string;
    prerequisite_type: string;
    min_grade?: number;
    description?: string;
    created_at: string;
    prerequisite_course?: {
      id: string;
      code: string;
      name_vi: string;
    };
  }>;
  instructors?: Array<{
    id: string;
    name: string;
    role: string;
    qualification: string;
    level?: string;
    status?: string;
    validFrom?: string;
    validTo?: string;
  }>;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const routeId = routeParams?.id as string;
  const [activeTab, setActiveTab] = useState(0);
  // Removed edit mode; using request flow instead
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [userRoles, setUserRoles] = useState<Array<{ name: string; description?: string }>>([]);
  const hasAcademicBoardRole = userRoles.some(r => r.name === 'academic_board');
  
  const [syllabusData, setSyllabusData] = useState<Array<{
    id: string;
    week_number: number;
    topic: string;
    objectives: string;
    materials: string;
    assignments: string;
    duration: number;
    isExamWeek: boolean;
  }>>([]);

  const [newInstructor, setNewInstructor] = useState<{ id: string; role: string; qualification: string; level?: string } | null>(null);
  
  const [workflowComment, setWorkflowComment] = useState('');
  const [orgUnits, setOrgUnits] = useState<any[]>([]);
  const [editingAssessment, setEditingAssessment] = useState(false);
  const [assessmentMethods, setAssessmentMethods] = useState<any[]>([]);
  const [learningObjectives, setLearningObjectives] = useState<any[]>([]);
  const [openAssessmentModal, setOpenAssessmentModal] = useState(false);
  const [openObjectivesModal, setOpenObjectivesModal] = useState(false);
  const [openBasicInfoModal, setOpenBasicInfoModal] = useState(false);
  const [openSyllabusModal, setOpenSyllabusModal] = useState(false);

  // Sync editData with courseDetail when opening basic info modal
  useEffect(() => {
    if (openBasicInfoModal && courseDetail) {
      setEditData({
        name_vi: courseDetail.name_vi || '',
        name_en: courseDetail.name_en || '',
        code: courseDetail.code || '',
        credits: courseDetail.credits || 0,
        description: courseDetail.description || '',
        status: courseDetail.status || CourseStatus.DRAFT,
        org_unit_id: courseDetail.org_unit_id || '',
        type: courseDetail.type || ''
      });
    }
  }, [openBasicInfoModal, courseDetail]);

  // Sync syllabusData with courseDetail when opening syllabus modal
  useEffect(() => {
    if (openSyllabusModal && courseDetail) {
      setSyllabusData((courseDetail?.course_syllabus || []).map((item, idx) => ({
        id: `${item.week_number}-${idx}`,
        week_number: item.week_number,
        topic: item.topic,
        objectives: item.objectives || '',
        materials: item.materials || '',
        assignments: item.assignments || '',
        duration: item.duration || 3,
        isExamWeek: item.isExamWeek || false
      })));
    }
  }, [openSyllabusModal, courseDetail]);
  
  const [editData, setEditData] = useState({
    name_vi: '',
    name_en: '',
    code: '',
    credits: 0,
    description: '',
    status: '',
    org_unit_id: '',
    type: ''
  });

  useEffect(() => {
    fetchOrgUnits();
  }, []);

  // Fetch current user's roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesRes = await fetch('/api/hr/user-roles/current');
        const rolesJson: { success: boolean; data?: Array<{ role?: { name?: string; description?: string } }> } = await rolesRes.json();
        if (rolesJson?.success && Array.isArray(rolesJson.data)) {
          const roles: Array<{ name: string; description?: string }> = rolesJson.data
            .map((ur) => ({ name: ur?.role?.name || '', description: ur?.role?.description }))
            .filter((r) => !!r.name);
          const uniqueByName = Array.from(new Map(roles.map((r) => [r.name, r])).values());
          setUserRoles(uniqueByName);
        }
      } catch (e) {
        console.error('Failed to fetch user roles', e);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!courseDetail) return;
    setEditData({
      name_vi: courseDetail.name_vi || '',
      name_en: courseDetail.name_en || '',
      code: courseDetail.code || '',
      credits: courseDetail.credits || 0,
      description: courseDetail.description || '',
      status: courseDetail.status || '',
      org_unit_id: courseDetail.org_unit_id || '',
      type: courseDetail.type || ''
    });

    if (!editingAssessment) {
      setAssessmentMethods(courseDetail.contents?.[0]?.assessment_methods || []);
      setLearningObjectives(courseDetail.contents?.[0]?.learning_objectives || []);
    }
  }, [courseDetail]);


  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/tms/courses/${routeId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const courseData = result.data;

          const versions = Array.isArray(courseData.CourseVersion) ? courseData.CourseVersion : [];
          const syllabusApi = versions
            .flatMap((v: any) => Array.isArray(v.CourseSyllabus) ? v.CourseSyllabus : [])
            .sort((a: any, b: any) => (a.week_number || 0) - (b.week_number || 0));

          const transformedCourse: CourseDetail = {
            ...courseData,
            id: courseData.id.toString(),
            org_unit_id: courseData.org_unit_id?.toString(),
            course_syllabus: syllabusApi,
            instructors: courseData.instructor_qualifications?.map((item: any) => ({
              id: item.id.toString(),
              name: `Instructor ${item.instructor_id}`,
              role: item.qualification_type,
              qualification: item.qualification_type,
              level: item.qualification_level,
              status: item.status,
              validFrom: item.valid_from,
              validTo: item.valid_to
            })) || []
          };
          
          console.log(transformedCourse);
          setCourseDetail(transformedCourse);
        } else {
          setError('Không thể tải thông tin học phần');
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
        setError('Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (routeId) {
      fetchCourseDetail();
    }
  }, [routeId]);

  // Submit request for approval with any changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editData,
          status: CourseStatus.SUBMITTED,
          workflow_stage: WorkflowStage.ACADEMIC_OFFICE
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCourseDetail(prev => prev ? {
          ...prev,
          name_vi: editData.name_vi,
          name_en: editData.name_en,
          code: editData.code,
          credits: editData.credits,
          description: editData.description
        } : null);
        
        // no edit mode; we just show toast
        setToast({ open: true, message: 'Đã gửi yêu cầu phê duyệt!', severity: 'success' });
      } else {
        setError(result.error || 'Có lỗi xảy ra khi lưu thông tin');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu thông tin');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Request to revert course to DRAFT for further edits
  const handleRequestDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: CourseStatus.DRAFT, workflow_stage: WorkflowStage.FACULTY })
      });
      const result = await response.json();
      if (result.success) {
        setCourseDetail(prev => prev ? {
          ...prev,
          status: CourseStatus.DRAFT,
          workflows: prev.workflows ? [{
            ...prev.workflows[0],
            status: CourseStatus.DRAFT,
            workflow_stage: WorkflowStage.FACULTY
          }, ...prev.workflows.slice(1)] : prev.workflows
        } : prev);
        setToast({ open: true, message: 'Đã gửi yêu cầu. Học phần chuyển về trạng thái Nháp.', severity: 'success' });
      } else {
        setError(result.error || 'Không thể gửi yêu cầu');
      }
    } catch (err) {
      setError('Có lỗi khi gửi yêu cầu');
      console.error('Request draft error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Academic Board publish action -> set status to PUBLISHED
  const handlePublishAcademicBoard = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: CourseStatus.PUBLISHED, workflow_stage: WorkflowStage.ACADEMIC_BOARD })
      });
      const result = await response.json();
      if (result.success) {
        setCourseDetail(prev => prev ? {
          ...prev,
          status: CourseStatus.PUBLISHED,
          workflows: prev.workflows ? [{
            ...prev.workflows[0],
            status: CourseStatus.PUBLISHED,
            workflow_stage: WorkflowStage.ACADEMIC_BOARD
          }, ...prev.workflows.slice(1)] : prev.workflows
        } : prev);
        setToast({ open: true, message: 'Hội đồng khoa học đã công bố học phần.', severity: 'success' });
      } else {
        setError(result.error || 'Không thể công bố học phần');
      }
    } catch (err) {
      setError('Có lỗi khi công bố học phần');
      console.error('Publish error:', err);
    } finally {
      setSaving(false);
    }
  };


  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch org units for dropdown
  const fetchOrgUnits = async () => {
    try {
      const response = await fetch('/api/org/units?limit=100');
      const result = await response.json();
      if (result.success) {
        setOrgUnits(result.data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch org units:', error);
    }
  };

  // Assessment methods handlers
  const handleAssessmentMethodChange = (index: number, field: string, value: any) => {
    setAssessmentMethods(prev => prev.map((method, i) => 
      i === index ? { ...method, [field]: value } : method
    ));
  };

  const addAssessmentMethod = () => {
    setAssessmentMethods(prev => [...prev, {
      method: 'assignment',
      weight: 0,
      description: ''
    }]);
  };

  const removeAssessmentMethod = (index: number) => {
    setAssessmentMethods(prev => prev.filter((_, i) => i !== index));
  };

  // Learning objectives handlers
  const handleLearningObjectiveChange = (index: number, field: string, value: string) => {
    setLearningObjectives(prev => prev.map((objective, i) => 
      i === index ? { ...objective, [field]: value } : objective
    ));
  };

  const addLearningObjective = () => {
    setLearningObjectives(prev => [...prev, {
      type: 'knowledge',
      objective: ''
    }]);
  };

  const removeLearningObjective = (index: number) => {
    setLearningObjectives(prev => prev.filter((_, i) => i !== index));
  };

  // Save assessment data
  const handleAssessmentSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment_methods: assessmentMethods,
          learning_objectives: learningObjectives
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Cập nhật courseDetail với dữ liệu mới
        setCourseDetail(result.data);
        
        // Cập nhật local state để hiển thị ngay lập tức
        const newAssessmentMethods = result.data.contents?.[0]?.assessment_methods || [];
        const newLearningObjectives = result.data.contents?.[0]?.learning_objectives || [];
        
        setAssessmentMethods(newAssessmentMethods);
        setLearningObjectives(newLearningObjectives);
        
        setOpenAssessmentModal(false);
        alert('Cập nhật thành công!');
      } else {
        alert('Lỗi khi cập nhật: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleObjectivesSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learning_objectives: learningObjectives
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCourseDetail(result.data);
        const newLearningObjectives = result.data.contents?.[0]?.learning_objectives || [];
        setLearningObjectives(newLearningObjectives);
        setOpenObjectivesModal(false);
        alert('Cập nhật thành công!');
      } else {
        alert('Lỗi khi cập nhật: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving objectives:', error);
      alert('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleBasicInfoSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name_vi: editData.name_vi,
          name_en: editData.name_en,
          code: editData.code,
          credits: editData.credits,
          description: editData.description,
          status: editData.status
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Cập nhật courseDetail với dữ liệu mới
        setCourseDetail(result.data);
        setOpenBasicInfoModal(false);
        alert('Cập nhật thành công!');
      } else {
        alert('Lỗi khi cập nhật: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving basic info:', error);
      alert('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleSyllabusModalSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syllabus: syllabusData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCourseDetail(result.data);
        setOpenSyllabusModal(false);
        alert('Cập nhật thành công!');
      } else {
        alert('Lỗi khi cập nhật: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving syllabus:', error);
      alert('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };


  // Handle syllabus item change
  const handleSyllabusItemChange = (index: number, field: string, value: any) => {
    const id = syllabusData[index]?.id;
    setSyllabusData(prev => prev.map((item) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Add new syllabus item
  const addSyllabusItem = () => {
    const newWeek = Math.max(...syllabusData.map(item => item.week_number), 0) + 1;
    setSyllabusData(prev => [...prev, {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      week_number: newWeek,
      topic: '',
      objectives: '',
      materials: '',
      assignments: '',
      duration: 3,
      isExamWeek: false
    }]);
  };


  const removeSyllabusItem = (index: number) => {
    const id = syllabusData[index]?.id;
    setSyllabusData(prev => prev.filter((item) => item.id !== id));
  };


  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Đang tải thông tin học phần...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !courseDetail) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Không tìm thấy thông tin học phần'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </Container>
    );
  }
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type: string) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setNewInstructor(null);
    setWorkflowComment('');
  };

  // Handle workflow actions (approve/reject/request_changes/forward/return/final_approve/final_reject)
  const handleWorkflowAction = async (action: string) => {
    try {
      setSaving(true);
      setError(null);
      
      // Map actions to status, workflow stage, and reviewer role
      const actionMapping: Record<string, { status: string; workflow_stage: WorkflowStage; reviewer_role: WorkflowStage | string }> = {
        approve: { status: CourseStatus.APPROVED, workflow_stage: WorkflowStage.ACADEMIC_OFFICE, reviewer_role: WorkflowStage.ACADEMIC_OFFICE },
        reject: { status: CourseStatus.REJECTED, workflow_stage: WorkflowStage.FACULTY, reviewer_role: WorkflowStage.ACADEMIC_OFFICE },
        request_changes: { status: CourseStatus.DRAFT, workflow_stage: WorkflowStage.FACULTY, reviewer_role: WorkflowStage.ACADEMIC_OFFICE },
        forward: { status: CourseStatus.SUBMITTED, workflow_stage: WorkflowStage.ACADEMIC_BOARD, reviewer_role: WorkflowStage.ACADEMIC_OFFICE },
        final_approve: { status: CourseStatus.PUBLISHED, workflow_stage: WorkflowStage.ACADEMIC_BOARD, reviewer_role: WorkflowStage.ACADEMIC_BOARD },
        final_reject: { status: CourseStatus.REJECTED, workflow_stage: WorkflowStage.ACADEMIC_BOARD, reviewer_role: WorkflowStage.ACADEMIC_BOARD },
        delete: { status: 'DELETED', workflow_stage: WorkflowStage.ACADEMIC_OFFICE, reviewer_role: WorkflowStage.ACADEMIC_OFFICE }
      };
      
      const mapping = actionMapping[action];
      if (!mapping) {
        throw new Error(`Unknown workflow action: ${action}`);
      }
      
      const payload = {
        workflow_action: action,
        comment: workflowComment,
        status: mapping.status,
      } as const;
      
      let response;
      if (action === 'delete') {
        // For delete action, use DELETE method
        response = await fetch(`/api/tms/courses/${routeId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        // For other actions, use PUT method
        response = await fetch(`/api/tms/courses/${routeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setCourseDetail(prev => prev ? {
          ...prev,
          workflows: prev.workflows?.map((wf, index) => index === 0 ? {
            ...wf,
            status: mapping.status,
            workflow_stage: mapping.workflow_stage,
            notes: workflowComment || wf.notes,
            updated_at: new Date().toISOString()
          } : wf) || [],
          course_approval_history: [
            ...(prev.course_approval_history || []),
            {
              id: Date.now().toString(),
              action: action.toUpperCase(),
              from_status: prev.status || CourseStatus.DRAFT,
              to_status: mapping.status,
              reviewer_role: mapping.reviewer_role,
              comments: workflowComment,
              created_at: new Date().toISOString()
            }
          ]
        } : prev);
        
        const successMessages: Record<string, string> = {
          'approve': 'Phê duyệt thành công!',
          'reject': 'Từ chối thành công!',
          'request_changes': 'Yêu cầu chỉnh sửa đã gửi!',
          'forward': 'Chuyển tiếp thành công!',
          'final_approve': 'Phê duyệt cuối cùng thành công!',
          'final_reject': 'Từ chối cuối cùng thành công!',
          'delete': 'Xóa học phần thành công!'
        };
        
        setToast({ 
          open: true, 
          message: successMessages[action] || 'Thao tác thành công!', 
          severity: action === 'delete' ? 'warning' : 'success' 
        });
        handleCloseDialog();
      } else {
        const errorMessages: Record<string, string> = {
          'approve': 'Không thể phê duyệt học phần',
          'reject': 'Không thể từ chối học phần',
          'request_changes': 'Không thể yêu cầu chỉnh sửa',
          'forward': 'Không thể chuyển tiếp',
          'final_approve': 'Không thể phê duyệt cuối cùng',
          'final_reject': 'Không thể từ chối cuối cùng',
          'delete': 'Không thể xóa học phần'
        };
        
        setError(result.error || errorMessages[action] || 'Không thể thực hiện thao tác');
      }
    } catch (err) {
      console.error(err);
      const catchErrorMessages: Record<string, string> = {
        'approve': 'Có lỗi khi phê duyệt học phần',
        'reject': 'Có lỗi khi từ chối học phần',
        'request_changes': 'Có lỗi khi yêu cầu chỉnh sửa',
        'forward': 'Có lỗi khi chuyển tiếp',
        'final_approve': 'Có lỗi khi phê duyệt cuối cùng',
        'final_reject': 'Có lỗi khi từ chối cuối cùng',
        'delete': 'Có lỗi khi xóa học phần'
      };
      
      setError(catchErrorMessages[action] || 'Có lỗi khi thực hiện thao tác');
    } finally {
      setSaving(false);
    }
  };

  // Add instructor
  const handleAddInstructor = async () => {
    if (!newInstructor) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        instructors: [
          {
            instructor_id: newInstructor.id,
            qualification: newInstructor.qualification || 'GENERAL',
            qualification_level: newInstructor.level || 'STANDARD',
            status: 'PENDING'
          }
        ]
      } as any;
      const response = await fetch(`/api/tms/courses/${routeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setCourseDetail(prev => prev ? {
          ...prev,
          instructors: [
            ...(prev.instructors || []),
            {
              id: String(newInstructor.id),
              name: `Instructor ${newInstructor.id}`,
              role: newInstructor.role || 'MAIN',
              qualification: newInstructor.qualification || 'GENERAL',
              level: newInstructor.level || 'STANDARD'
            }
          ]
        } : prev);
        setToast({ open: true, message: 'Thêm giảng viên thành công!', severity: 'success' });
        handleCloseDialog();
      } else {
        setError(result.error || 'Không thể thêm giảng viên');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi khi thêm giảng viên');
    } finally {
      setSaving(false);
    }
  };

  const TabPanel = ({ children, value, index }: any) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  // --

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {courseDetail.name_vi}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {courseDetail.code} - {courseDetail.credits} tín chỉ
            </Typography>
          {userRoles.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userRoles.map((r) => (
                <Tooltip key={r.name} title={r.description || ''}>
                  <Chip size="small" label={`Vai trò: ${r.name} - ${r.description}`} />
                </Tooltip>
              ))}
            </Box>
          )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={getStatusLabel(courseDetail.status || CourseStatus.DRAFT)}
              color={getStatusColor(courseDetail.status || CourseStatus.DRAFT) as any}
              sx={{ mr: 1 }}
            />
            <Chip
              label={getWorkflowStageLabel(courseDetail.workflows?.[0]?.workflow_stage || WorkflowStage.FACULTY)}
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              disabled={saving}
              onClick={handleRequestDraft}
            >
              {courseDetail.status === CourseStatus.REJECTED ? 'Gửi yêu cầu lại' :
               (courseDetail.status === CourseStatus.APPROVED || courseDetail.status === CourseStatus.PUBLISHED) ? 'Gửi yêu cầu chỉnh sửa' : 'Gửi yêu cầu chỉnh sửa'}
            </Button>
          </Box>
        </Box>
      </Box>

    {courseDetail.status === CourseStatus.REJECTED && (
      <Alert severity="error" sx={{ mb: 3 }}>
        Học phần bị từ chối - thực hiện chỉnh sửa lại và gửi yêu cầu đi
      </Alert>
    )}

      {/* Course Information Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">{courseDetail.credits}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tín chỉ
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">{courseDetail.course_syllabus?.length || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
              Tuần học
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">{courseDetail.instructors?.length || 0}</Typography>
            <Typography variant="body2" color="text.secondary">
                Giảng viên
            </Typography>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <AssessmentIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">{getCourseTypeLabel(courseDetail.type || '')}</Typography>
            <Typography variant="body2" color="text.secondary">
              Loại học phần
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Thông tin chung" />
            <Tab label="Giáo trình" />
            <Tab label="Đánh giá" />
            <Tab label="Giảng viên" />
            <Tab label="Workflow" />
          </Tabs>
        </Box>

        {/* General Information Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
            <Card>
              <CardHeader 
                title="Thông tin cơ bản" 
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setOpenBasicInfoModal(true)}
                  >
                    Chỉnh sửa
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Tên học phần (Tiếng Việt)
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {courseDetail.name_vi}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Tên học phần (Tiếng Anh)
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {courseDetail.name_en || 'Chưa có'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Mã học phần
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {courseDetail.code}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Số tín chỉ
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {courseDetail.credits}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Mô tả
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {courseDetail.description || 'Chưa có mô tả'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader title="Điều kiện tiên quyết" />
              <CardContent>
                {courseDetail.prerequisites && courseDetail.prerequisites.length > 0 ? (
                <List>
                    {courseDetail.prerequisites.map((prereq: any, index: number) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <AssignmentIcon color="primary" />
                        </ListItemIcon>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {prereq.prerequisite_course?.code}
                            </Typography>
                            <Chip 
                              label={getPrereqLabelVi(prereq.prerequisite_type)} 
                              size="small" 
                              color={getPrereqChipColor(prereq.prerequisite_type) as any}
                              variant="outlined"
                            />
                            {/* {prereq.min_grade && (
                              <Chip 
                                label={`Điểm tối thiểu: ${prereq.min_grade}`} 
                                size="small" 
                                color="info"
                                variant="outlined"
                              />
                            )} */}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {prereq.prerequisite_course?.name_vi}
                          </Typography>
                          {prereq.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {prereq.description}
                            </Typography>
                          )}
                        </Box>
                  </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có điều kiện tiên quyết
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader title="Thông tin bổ sung" />
              <CardContent>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Đơn vị
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {courseDetail.OrgUnit?.name || 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Chương trình
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Công nghệ thông tin
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Người tạo
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        System
                      </Typography>
                    </Box>
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Ngày nộp
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {new Date(courseDetail.created_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Syllabus Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardHeader 
              title="Giáo trình học" 
              action={
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenSyllabusModal(true)}
                >
                  Chỉnh sửa
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tuần</TableCell>
                      <TableCell>Chủ đề</TableCell>
                      <TableCell>Mục tiêu</TableCell>
                      <TableCell>Tài liệu</TableCell>
                      <TableCell>Bài tập</TableCell>
                      <TableCell>Thời lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseDetail.course_syllabus?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.week_number}</TableCell>
                        <TableCell>{item.topic}</TableCell>
                        <TableCell>{item.objectives}</TableCell>
                        <TableCell>{item.materials}</TableCell>
                        <TableCell>{item.assignments}</TableCell>
                        <TableCell>{item.duration}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Assessment Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
            <Card>
    <CardHeader 
      title="Phương thức đánh giá" 
      action={
        <Button
          size="small"
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setOpenAssessmentModal(true)}
        >
          Chỉnh sửa
        </Button>
      }
    />
              <CardContent>
                {assessmentMethods.length > 0 ? (
                  <List>
                    {assessmentMethods.map((method, index) => (
                      <ListItem key={`assessment-display-${index}-${method.method}`} sx={{ px: 0 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                            {method.method === 'attendance' ? 'Điểm danh' :
                             method.method === 'assignment' ? 'Bài tập' :
                             method.method === 'midterm' ? 'Giữa kỳ' :
                             method.method === 'final' ? 'Cuối kỳ' :
                             method.method === 'participation' ? 'Tham gia' :
                             method.method}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                            {method.weight}%
                          </Typography>
                          {method.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                              {method.description}
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có phương thức đánh giá nào.
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader 
                title="Mục tiêu học tập" 
                action={
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setOpenObjectivesModal(true)}
                  >
                    Chỉnh sửa
                  </Button>
                }
              />
              <CardContent>
                {learningObjectives.length > 0 ? (
                  <List>
                    {learningObjectives.map((objective, index) => (
                      <ListItem key={`objective-display-${index}-${objective.type}`} sx={{ px: 0 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            <Typography component="span" variant="body2" color="primary" fontWeight="bold" sx={{ mr: 1 }}>
                              {index + 1}.
                            </Typography>
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1, fontStyle: 'italic' }}>
                              [{objective.type === 'knowledge' ? 'Kiến thức' :
                                objective.type === 'skill' ? 'Kỹ năng' :
                                objective.type === 'attitude' ? 'Thái độ' :
                                objective.type}]
                            </Typography>
                            {objective.objective}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có mục tiêu học tập nào.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Instructors Tab */}
        <TabPanel value={activeTab} index={3}>
          <Card>
            <CardHeader 
              title="Danh sách giảng viên" 
              action={
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog('instructor')}
                >
                  Thêm giảng viên
                </Button>
              }
            />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Vai trò</TableCell>
                      <TableCell>Trình độ</TableCell>
                      <TableCell>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseDetail.instructors?.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell>{instructor.name}</TableCell>
                        <TableCell>{instructor.role}</TableCell>
                        <TableCell>{instructor.qualification}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <CancelIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Workflow Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
            <Card>
              <CardHeader title="Trạng thái hiện tại" />
              <CardContent>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ 
                        bgcolor: courseDetail.status === CourseStatus.DRAFT ? 'warning.main' : 
                                 courseDetail.status === CourseStatus.APPROVED ? 'success.main' :
                                 courseDetail.status === CourseStatus.REJECTED ? 'error.main' : 'info.main',
                        width: 32,
                        height: 32
                      }}>
                        {courseDetail.status === CourseStatus.DRAFT ? <EditIcon /> :
                         courseDetail.status === CourseStatus.APPROVED ? <CheckCircleIcon /> :
                         courseDetail.status === CourseStatus.REJECTED ? <CancelIcon /> : <SendIcon />}
                      </Avatar>
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Trạng thái
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 0.5 }}>
                        {courseDetail.status === CourseStatus.DRAFT ? 'Bản nháp' :
                         courseDetail.status === CourseStatus.APPROVED ? 'Đã phê duyệt' :
                         courseDetail.status === CourseStatus.REJECTED ? 'Bị từ chối' : 
                         courseDetail.status || 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <AssignmentIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Giai đoạn
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {courseDetail.workflows?.[0]?.workflow_stage === WorkflowStage.FACULTY ? 'Khoa' :
                         courseDetail.workflows?.[0]?.workflow_stage === WorkflowStage.ACADEMIC_OFFICE ? 'Phòng Đào tạo' :
                         courseDetail.workflows?.[0]?.workflow_stage === WorkflowStage.ACADEMIC_BOARD ? 'Hội đồng khoa học' :
                         courseDetail.workflows?.[0]?.workflow_stage || 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <PriorityIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Độ ưu tiên
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {courseDetail.workflows?.[0]?.priority
                          ? getPriorityLabel(
                              normalizeCoursePriority(courseDetail.workflows[0].priority)
                            )
                          : 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </ListItem>

                  {courseDetail.workflows?.[0]?.notes && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CommentIcon color="primary" />
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                          Ghi chú
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {courseDetail.workflows[0].notes}
                        </Typography>
                      </Box>
                    </ListItem>
                  )}

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarIcon color="primary" />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                        Ngày cập nhật
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {courseDetail.workflows?.[0]?.updated_at ? 
                          new Date(courseDetail.workflows[0].updated_at).toLocaleString('vi-VN') : 'Chưa xác định'}
                      </Typography>
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Lịch sử phê duyệt" />
              <CardContent>
                {courseDetail.course_approval_history && courseDetail.course_approval_history.length > 0 ? (
                  <List>
                      {courseDetail.course_approval_history?.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {(() => {
                            const action = (item.action || '').toUpperCase();
                            if (action === 'APPROVE' || action === 'FINAL_APPROVE' || action === 'PUBLISH') {
                              return (
                                <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                                  <CheckCircleIcon />
                                </Avatar>
                              );
                            }
                            if (action === 'REJECT' || action === 'FINAL_REJECT') {
                              return (
                                <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                                  <CancelIcon />
                                </Avatar>
                              );
                            }
                            if (action === 'REQUEST_CHANGES' || action === 'RETURN') {
                              return (
                                <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                                  <EditIcon />
                                </Avatar>
                              );
                            }
                            if (action === 'FORWARD') {
                              return (
                                <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                                  <SendIcon />
                                </Avatar>
                              );
                            }
                            if (action === 'DELETE') {
                              return (
                                <Avatar sx={{ bgcolor: 'grey.700', width: 32, height: 32 }}>
                                  <DeleteIcon />
                                </Avatar>
                              );
                            }
                            return (
                              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                <CheckCircleIcon />
                              </Avatar>
                            );
                          })()}
                        </ListItemIcon>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                                {item.action}
                              </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              <strong>{item.reviewer_role}</strong> - {new Date(item.created_at).toLocaleString('vi-VN')}
                              </Typography>
                            {item.comments && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                "{item.comments}"
                              </Typography>
                            )}
                            </Box>
                      </ListItem>
                        {index < (courseDetail.course_approval_history?.length || 0) - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có lịch sử phê duyệt
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader title="Hành động" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Phòng Đào Tạo - Quyền quản lý workflow */}
                  <PermissionGuard requiredPermissions={['tms.course.manage']}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                      Phòng Đào Tạo
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleOpenDialog('approve')}
                      disabled={courseDetail.status !== CourseStatus.DRAFT}
                    >
                      Phê duyệt
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenDialog('reject')}
                      disabled={courseDetail.status !== CourseStatus.DRAFT}
                    >
                      Từ chối
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog('request_changes')}
                      disabled={courseDetail.status === CourseStatus.DRAFT}
                    >
                      Yêu cầu chỉnh sửa
                    </Button>
                    
                    {hasAcademicBoardRole && (
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<SendIcon />}
                        onClick={handlePublishAcademicBoard}
                        disabled={courseDetail.status !== 'APPROVED'}
                      >
                        Hội đồng khoa học công bố
                      </Button>
                    )}
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDialog('delete')}
                      disabled={courseDetail.status === CourseStatus.PUBLISHED}
                    >
                      Xóa học phần
                    </Button>
                  </PermissionGuard>

                  {/* Hội đồng Khoa học - Quyền phê duyệt cuối cùng */}
                  <PermissionGuard requiredPermissions={['tms.course.final_approve']}>
                    <Typography variant="subtitle2" color="secondary" sx={{ mb: 1, mt: 2 }}>
                      Hội đồng Khoa học
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleOpenDialog('final_approve')}
                      disabled={courseDetail.status === CourseStatus.PUBLISHED}
                    >
                      Phê duyệt cuối cùng
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenDialog('final_reject')}
                      disabled={courseDetail.status === CourseStatus.REJECTED}
                    >
                      Từ chối cuối cùng
                    </Button>
                  </PermissionGuard>

                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog for various actions */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'syllabus' && 'Chỉnh sửa Giáo trình'}
          {dialogType === 'instructor' && 'Thêm giảng viên'}
          {dialogType === 'approve' && 'Phê duyệt học phần'}
          {dialogType === 'reject' && 'Từ chối học phần -> Trả về Khoa'}
          {dialogType === 'request_changes' && 'Yêu cầu chỉnh sửa học phần'}
          {dialogType === 'forward' && 'Chuyển tiếp học phần'}
          {dialogType === 'final_approve' && 'Phê duyệt cuối cùng'}
          {dialogType === 'final_reject' && 'Từ chối cuối cùng'}
          {dialogType === 'delete' && 'Xóa học phần'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'instructor' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="ID giảng viên (employee_id)"
                value={newInstructor?.id || ''}
                onChange={(e) => setNewInstructor(prev => ({
                  id: e.target.value,
                  role: prev?.role || 'MAIN',
                  qualification: prev?.qualification || 'GENERAL',
                  level: prev?.level || 'STANDARD'
                }))}
              />
              <TextField
                fullWidth
                label="Vai trò"
                value={newInstructor?.role || 'MAIN'}
                onChange={(e) => setNewInstructor(prev => ({
                  id: prev?.id || '',
                  role: e.target.value,
                  qualification: prev?.qualification || 'GENERAL',
                  level: prev?.level || 'STANDARD'
                }))}
              />
              <TextField
                fullWidth
                label="Trình độ/Chứng chỉ"
                value={newInstructor?.qualification || 'GENERAL'}
                onChange={(e) => setNewInstructor(prev => ({
                  id: prev?.id || '',
                  role: prev?.role || 'MAIN',
                  qualification: e.target.value,
                  level: prev?.level || 'STANDARD'
                }))}
              />
              <TextField
                fullWidth
                label="Cấp độ"
                value={newInstructor?.level || 'STANDARD'}
                onChange={(e) => setNewInstructor(prev => ({
                  id: prev?.id || '',
                  role: prev?.role || 'MAIN',
                  qualification: prev?.qualification || 'GENERAL',
                  level: e.target.value
                }))}
              />
            </Box>
          )}
          {dialogType === 'approve' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Bình luận phê duyệt"
                multiline
                rows={3}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập bình luận phê duyệt (nếu có)"
              />
            </Box>
          )}
          
          {dialogType === 'reject' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Lý do từ chối"
                multiline
                rows={3}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập lý do từ chối"
                required
              />
            </Box>
          )}

          {dialogType === 'request_changes' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Yêu cầu chỉnh sửa"
                multiline
                rows={4}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập chi tiết yêu cầu chỉnh sửa học phần"
                required
              />
            </Box>
          )}

          {dialogType === 'forward' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                fullWidth
                label="Ghi chú chuyển tiếp"
                multiline
                rows={3}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập ghi chú khi chuyển tiếp lên Hội đồng Khoa học"
              />
            </Box>
          )}

          

          {dialogType === 'final_approve' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="success">
                Học phần sẽ được phê duyệt cuối cùng và chuyển sang trạng thái PUBLISHED.
              </Alert>
              <TextField
                fullWidth
                label="Ghi chú phê duyệt cuối cùng"
                multiline
                rows={3}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập ghi chú phê duyệt cuối cùng (nếu có)"
              />
            </Box>
          )}

          {dialogType === 'final_reject' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="error">
                Học phần sẽ bị từ chối cuối cùng và không thể sử dụng.
              </Alert>
              <TextField
                fullWidth
                label="Lý do từ chối cuối cùng"
                multiline
                rows={3}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập lý do từ chối cuối cùng"
                required
              />
            </Box>
          )}



          {dialogType === 'delete' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="error">
                <Typography variant="h6" sx={{ mb: 1 }}>
                  ⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!
                </Typography>
                <Typography>
                  Học phần sẽ bị xóa vĩnh viễn khỏi hệ thống. Tất cả dữ liệu liên quan sẽ bị mất.
                </Typography>
              </Alert>
              <TextField
                fullWidth
                label="Lý do xóa"
                multiline
                rows={4}
                value={workflowComment}
                onChange={(e) => setWorkflowComment(e.target.value)}
                placeholder="Nhập lý do xóa học phần (bắt buộc)"
                required
              />
              <Alert severity="info">
                <Typography variant="body2">
                  Để xác nhận xóa, vui lòng nhập "XÓA" vào ô bên dưới:
                </Typography>
                <TextField
                  fullWidth
                  label="Xác nhận xóa"
                  placeholder="Nhập 'XÓA' để xác nhận"
                  sx={{ mt: 1 }}
                />
              </Alert>
            </Box>
          )}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          {dialogType === 'instructor' ? (
            <Button variant="contained" onClick={handleAddInstructor} disabled={!newInstructor?.id}>
              Thêm
            </Button>
          ) : dialogType === 'approve' ? (
            <Button variant="contained" color="success" onClick={() => handleWorkflowAction('approve')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Phê duyệt'}
            </Button>
          ) : dialogType === 'reject' ? (
            <Button variant="contained" color="error" onClick={() => handleWorkflowAction('reject')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Từ chối'}
            </Button>
          ) : dialogType === 'request_changes' ? (
            <Button variant="contained" color="warning" onClick={() => handleWorkflowAction('request_changes')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Yêu cầu chỉnh sửa'}
            </Button>
          ) : dialogType === 'forward' ? (
            <Button variant="contained" color="info" onClick={() => handleWorkflowAction('forward')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Chuyển tiếp'}
            </Button>
          ) : dialogType === 'final_approve' ? (
            <Button variant="contained" color="success" onClick={() => handleWorkflowAction('final_approve')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Phê duyệt cuối cùng'}
            </Button>
          ) : dialogType === 'final_reject' ? (
            <Button variant="contained" color="error" onClick={() => handleWorkflowAction('final_reject')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Từ chối cuối cùng'}
            </Button>
          ) : dialogType === 'delete' ? (
            <Button variant="contained" color="error" onClick={() => handleWorkflowAction('delete')} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Xóa vĩnh viễn'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCloseDialog}>
              Lưu
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Assessment Methods Modal */}
      <Dialog open={openAssessmentModal} onClose={() => setOpenAssessmentModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa phương thức đánh giá</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {assessmentMethods.map((method, index) => (
              <Card key={`modal-assessment-${index}-${method.method}`} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Loại</InputLabel>
                    <Select
                      value={method.method}
                      onChange={(e) => handleAssessmentMethodChange(index, 'method', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="attendance">Điểm danh</MenuItem>
                      <MenuItem value="assignment">Bài tập</MenuItem>
                      <MenuItem value="midterm">Giữa kỳ</MenuItem>
                      <MenuItem value="final">Cuối kỳ</MenuItem>
                      <MenuItem value="participation">Tham gia</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Trọng số (%)"
                    type="number"
                    value={method.weight}
                    onChange={(e) => handleAssessmentMethodChange(index, 'weight', parseInt(e.target.value) || 0)}
                    size="small"
                    sx={{ width: 120 }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeAssessmentMethod(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <TextField
                  label="Mô tả"
                  value={method.description}
                  onChange={(e) => handleAssessmentMethodChange(index, 'description', e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 1 }}
                />
              </Card>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addAssessmentMethod}
              sx={{ alignSelf: 'flex-start' }}
            >
              Thêm phương thức
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssessmentModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleAssessmentSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Learning Objectives Modal */}
      <Dialog open={openObjectivesModal} onClose={() => setOpenObjectivesModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa mục tiêu học tập</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {learningObjectives.map((objective, index) => (
              <Card key={`modal-objective-${index}-${objective.type}`} variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Loại</InputLabel>
                    <Select
                      value={objective.type}
                      onChange={(e) => handleLearningObjectiveChange(index, 'type', e.target.value)}
                      size="small"
                    >
                      <MenuItem value="knowledge">Kiến thức</MenuItem>
                      <MenuItem value="skill">Kỹ năng</MenuItem>
                      <MenuItem value="attitude">Thái độ</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Mục tiêu"
                    value={objective.objective}
                    onChange={(e) => handleLearningObjectiveChange(index, 'objective', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeLearningObjective(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addLearningObjective}
              sx={{ alignSelf: 'flex-start' }}
            >
              Thêm mục tiêu
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenObjectivesModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleObjectivesSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Basic Info Modal */}
      <Dialog open={openBasicInfoModal} onClose={() => setOpenBasicInfoModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin cơ bản</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Tên học phần (Tiếng Việt)"
              value={editData.name_vi}
              onChange={(e) => handleInputChange('name_vi', e.target.value)}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Tên học phần (Tiếng Anh)"
              value={editData.name_en}
              onChange={(e) => handleInputChange('name_en', e.target.value)}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Mã học phần"
              value={editData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Số tín chỉ"
              type="number"
              value={editData.credits}
              onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 0)}
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={editData.status}
                onChange={(e) => handleInputChange('status', e.target.value as CourseStatus)}
                variant="outlined"
              >
                {COURSE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={4}
              value={editData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBasicInfoModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleBasicInfoSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Syllabus Modal */}
      <Dialog open={openSyllabusModal} onClose={() => setOpenSyllabusModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Chỉnh sửa giáo trình học</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {syllabusData.map((item, index) => (
              <Card key={item.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <TextField
                      label="Tuần"
                      type="number"
                      value={item.week_number}
                      onChange={(e) => handleSyllabusItemChange(index, 'week', parseInt(e.target.value) || 0)}
                      sx={{ width: 100 }}
                    />
                    <TextField
                      fullWidth
                      label="Chủ đề"
                      value={item.topic}
                      onChange={(e) => handleSyllabusItemChange(index, 'topic', e.target.value)}
                    />
                    <TextField
                      label="Thời lượng (giờ)"
                      type="number"
                      value={item.duration}
                      onChange={(e) => handleSyllabusItemChange(index, 'duration', parseFloat(e.target.value) || 0)}
                      sx={{ width: 150 }}
                    />
                    <IconButton 
                      color="error" 
                      onClick={() => removeSyllabusItem(index)}
                      disabled={syllabusData.length === 1}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Mục tiêu học tập"
                      multiline
                      rows={2}
                      value={item.objectives}
                      onChange={(e) => handleSyllabusItemChange(index, 'objectives', e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Tài liệu học tập"
                      multiline
                      rows={2}
                      value={item.materials}
                      onChange={(e) => handleSyllabusItemChange(index, 'materials', e.target.value)}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Bài tập"
                    multiline
                    rows={2}
                    value={item.assignments}
                    onChange={(e) => handleSyllabusItemChange(index, 'assignments', e.target.value)}
                  />
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addSyllabusItem}
              sx={{ alignSelf: 'flex-start' }}
            >
              Thêm tuần học
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSyllabusModal(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSyllabusModalSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
