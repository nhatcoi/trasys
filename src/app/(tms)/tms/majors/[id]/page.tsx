'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  BookmarkBorder as BookmarkIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  Verified as VerifiedIcon,
  People as PeopleIcon,
  AttachFile as AttachFileIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

interface Major {
  id: number;
  code: string;
  name_vi: string;
  name_en?: string;
  short_name?: string;
  slug?: string;
  national_code?: string;
  is_moet_standard?: boolean;
  degree_level: string;
  field_cluster?: string;
  specialization_model?: string;
  org_unit_id: number;
  parent_major_id?: number;
  duration_years?: number;
  total_credits_min?: number;
  total_credits_max?: number;
  semesters_per_year?: number;
  start_terms?: string;
  default_quota?: number;
  status: string;
  established_at?: string;
  closed_at?: string;
  description?: string;
  notes?: string;
  campuses?: Array<{ campus_id: number; is_primary: boolean }>;
  languages?: Array<{ lang: string; level: string }>;
  modalities?: Array<{ modality: string; note?: string }>;
  accreditations?: Array<{
    scheme: string;
    level?: string;
    valid_from?: string;
    valid_to?: string;
    cert_no?: string;
    agency?: string;
    note?: string;
  }>;
  aliases?: Array<{
    name: string;
    lang?: string;
    valid_from?: string;
    valid_to?: string;
  }>;
  documents?: Array<{
    doc_type: string;
    title: string;
    ref_no?: string;
    issued_by?: string;
    issued_at?: string;
    file_url?: string;
    note?: string;
  }>;
  OrgUnit?: {
    id: number;
    name: string;
    code: string;
    type?: string;
  };
  Major?: {
    id: number;
    code: string;
    name_vi: string;
    name_en?: string;
  };
  other_majors?: Array<{
    id: number;
    code: string;
    name_vi: string;
    name_en?: string;
  }>;
  Program?: Array<{
    id: number;
    code?: string;
    name_vi?: string;
    name_en?: string;
    version: string;
    status: string;
    total_credits: number;
    effective_from?: string;
    effective_to?: string;
  }>;
  MajorOutcome?: Array<{
    id: number;
    code: string;
    content: string;
    version?: string;
    is_active?: boolean;
  }>;
  MajorQuotaYear?: Array<{
    id: number;
    year: number;
    quota: number;
    note?: string;
  }>;
  MajorTuition?: Array<{
    id: number;
    year: number;
    tuition_group: string;
    amount_vnd: number;
    note?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`major-tabpanel-${index}`}
      aria-labelledby={`major-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function MajorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const majorId = params.id as string;
  
  const [major, setMajor] = useState<Major | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch major data
  useEffect(() => {
    const fetchMajor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tms/majors/${majorId}`);
        const data = await response.json();

        if (data.success) {
          setMajor(data.data);
        } else {
          setError(data.error || 'Failed to fetch major');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (majorId) {
      fetchMajor();
    }
  }, [majorId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'warning';
      case 'closed':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'suspended':
        return 'Tạm dừng';
      case 'closed':
        return 'Đã đóng';
      case 'draft':
        return 'Nháp';
      case 'proposed':
        return 'Đề xuất';
      default:
        return status;
    }
  };

  const getDegreeLevelText = (level: string) => {
    switch (level) {
      case 'bachelor':
        return 'Cử nhân';
      case 'master':
        return 'Thạc sĩ';
      case 'doctor':
        return 'Tiến sĩ';
      case 'associate':
        return 'Cao đẳng';
      default:
        return level;
    }
  };

  const handleDelete = async () => {
    if (!major) return;

    try {
      const response = await fetch(`/api/tms/majors/${major.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/tms/majors');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete major');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 400 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Đang tải thông tin ngành đào tạo...
            </Typography>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (error || !major) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Ngành đào tạo không tồn tại'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <IconButton
              onClick={() => router.back()}
              sx={{ color: 'white' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                {major.name_vi}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {major.name_en} • {major.code}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ 
                  backgroundColor: 'white', 
                  color: '#ed6c02',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
                }}
                onClick={() => router.push(`/tms/majors/${major.id}/edit`)}
              >
                Chỉnh sửa
              </Button>
              <Chip 
                label={getStatusText(major.status)}
                color={getStatusColor(major.status) as any}
                sx={{ backgroundColor: 'white', color: '#ed6c02' }}
              />
            </Stack>
          </Stack>

          {/* Quick Stats */}
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {major.Program?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Chương trình
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {major.MajorOutcome?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Chuẩn đầu ra
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {major.duration_years || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Năm đào tạo
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {major.default_quota || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Chỉ tiêu
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Thông tin chung" />
            <Tab label="Chương trình đào tạo" />
            <Tab label="Chuẩn đầu ra" />
            <Tab label="Chỉ tiêu & Học phí" />
            <Tab label="Chứng nhận & Tài liệu" />
          </Tabs>

          {/* Tab 1: General Information */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Thông tin cơ bản" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <BookmarkIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Bằng cấp"
                          secondary={getDegreeLevelText(major.degree_level)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Thời gian đào tạo"
                          secondary={`${major.duration_years || 0} năm`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Đơn vị quản lý"
                          secondary={`${major.OrgUnit?.name} (${major.OrgUnit?.code})`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <PeopleIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Chỉ tiêu mặc định"
                          secondary={`${major.default_quota || 0} sinh viên`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Languages & Modalities */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Ngôn ngữ & Hình thức" />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Ngôn ngữ giảng dạy
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {major.languages?.map((lang, index) => (
                            <Chip 
                              key={index}
                              label={`${lang.lang.toUpperCase()} (${lang.level})`}
                              size="small"
                              icon={<LanguageIcon />}
                            />
                          ))}
                        </Stack>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Hình thức đào tạo
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {major.modalities?.map((mod, index) => (
                            <Chip 
                              key={index}
                              label={mod.modality}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Description */}
              {major.description && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Mô tả" />
                    <CardContent>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {major.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Tab 2: Programs */}
          <TabPanel value={tabValue} index={1}>
            <Stack spacing={3}>
              <Typography variant="h6">
                Chương trình đào tạo ({major.Program?.length || 0})
              </Typography>
              
              {major.Program && major.Program.length > 0 ? (
                <Grid container spacing={2}>
                  {major.Program.map((program) => (
                    <Grid item xs={12} sm={6} md={4} key={program.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Stack spacing={1}>
                            <Typography variant="h6" color="primary">
                              {program.code || 'N/A'}
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {program.name_vi || 'Chưa có tên'}
                            </Typography>
                            {program.name_en && (
                              <Typography variant="body2" color="text.secondary">
                                {program.name_en}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={2}>
                              <Chip 
                                label={program.version}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                label={program.status}
                                size="small"
                                color={program.status === 'ACTIVE' ? 'success' : 'default'}
                              />
                            </Stack>
                            <Typography variant="body2">
                              {program.total_credits} tín chỉ
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có chương trình đào tạo
                  </Typography>
                </Paper>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 3: Learning Outcomes */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={3}>
              <Typography variant="h6">
                Chuẩn đầu ra ({major.MajorOutcome?.length || 0})
              </Typography>
              
              {major.MajorOutcome && major.MajorOutcome.length > 0 ? (
                <Stack spacing={2}>
                  {major.MajorOutcome.map((outcome, index) => (
                    <Card key={outcome.id}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Typography variant="h6" color="primary" sx={{ minWidth: 60 }}>
                            {outcome.code}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">
                              {outcome.content}
                            </Typography>
                            {outcome.version && (
                              <Chip 
                                label={`Phiên bản ${outcome.version}`}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Chưa có chuẩn đầu ra
                  </Typography>
                </Paper>
              )}
            </Stack>
          </TabPanel>

          {/* Tab 4: Quotas & Tuition */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {/* Quotas */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Chỉ tiêu theo năm" />
                  <CardContent>
                    {major.MajorQuotaYear && major.MajorQuotaYear.length > 0 ? (
                      <List>
                        {major.MajorQuotaYear.map((quota) => (
                          <ListItem key={quota.id}>
                            <ListItemText 
                              primary={`Năm ${quota.year}`}
                              secondary={`${quota.quota} sinh viên`}
                            />
                            {quota.note && (
                              <Typography variant="caption" color="text.secondary">
                                {quota.note}
                              </Typography>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        Chưa có thông tin chỉ tiêu
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Tuition */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Học phí theo năm" />
                  <CardContent>
                    {major.MajorTuition && major.MajorTuition.length > 0 ? (
                      <List>
                        {major.MajorTuition.map((tuition) => (
                          <ListItem key={tuition.id}>
                            <ListItemText 
                              primary={`Năm ${tuition.year} - ${tuition.tuition_group}`}
                              secondary={`${tuition.amount_vnd.toLocaleString('vi-VN')} VNĐ`}
                            />
                            {tuition.note && (
                              <Typography variant="caption" color="text.secondary">
                                {tuition.note}
                              </Typography>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        Chưa có thông tin học phí
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 5: Accreditations & Documents */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              {/* Accreditations */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Chứng nhận"
                    avatar={<VerifiedIcon />}
                  />
                  <CardContent>
                    {major.accreditations && major.accreditations.length > 0 ? (
                      <Stack spacing={2}>
                        {major.accreditations.map((acc, index) => (
                          <Paper key={index} sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {acc.scheme}
                              </Typography>
                              {acc.level && (
                                <Typography variant="body2" color="text.secondary">
                                  Cấp độ: {acc.level}
                                </Typography>
                              )}
                              {acc.agency && (
                                <Typography variant="body2" color="text.secondary">
                                  Tổ chức: {acc.agency}
                                </Typography>
                              )}
                              {acc.cert_no && (
                                <Typography variant="body2" color="text.secondary">
                                  Số chứng nhận: {acc.cert_no}
                                </Typography>
                              )}
                              {acc.valid_from && acc.valid_to && (
                                <Typography variant="body2" color="text.secondary">
                                  Hiệu lực: {acc.valid_from} - {acc.valid_to}
                                </Typography>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">
                        Chưa có chứng nhận
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Documents */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Tài liệu"
                    avatar={<AttachFileIcon />}
                  />
                  <CardContent>
                    {major.documents && major.documents.length > 0 ? (
                      <Stack spacing={2}>
                        {major.documents.map((doc, index) => (
                          <Paper key={index} sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {doc.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Loại: {doc.doc_type}
                              </Typography>
                              {doc.ref_no && (
                                <Typography variant="body2" color="text.secondary">
                                  Số tham chiếu: {doc.ref_no}
                                </Typography>
                              )}
                              {doc.issued_by && (
                                <Typography variant="body2" color="text.secondary">
                                  Cấp bởi: {doc.issued_by}
                                </Typography>
                              )}
                              {doc.issued_at && (
                                <Typography variant="body2" color="text.secondary">
                                  Ngày cấp: {new Date(doc.issued_at).toLocaleDateString('vi-VN')}
                                </Typography>
                              )}
                              {doc.file_url && (
                                <Button
                                  size="small"
                                  startIcon={<AttachFileIcon />}
                                  href={doc.file_url}
                                  target="_blank"
                                >
                                  Xem tài liệu
                                </Button>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">
                        Chưa có tài liệu
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa ngành đào tạo "{major.name_vi}" không?
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleDelete}
              color="error"
              variant="contained"
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

