'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Badge,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  SchoolOutlined as SchoolOutlinedIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  BookmarkBorder as BookmarkIcon,
  Schedule as ScheduleIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Major {
  id: number;
  code: string;
  name_vi: string;
  name_en?: string;
  short_name?: string;
  degree_level: string;
  duration_years?: number;
  status: string;
  org_unit_id: number;
  OrgUnit?: {
    id: number;
    name: string;
    code: string;
  };
  campuses?: Array<{ campus_id: number; is_primary: boolean }>;
  languages?: Array<{ lang: string; level: string }>;
  modalities?: Array<{ modality: string; note?: string }>;
  _count?: {
    Program: number;
    MajorOutcome: number;
    MajorQuotaYear: number;
    MajorTuition: number;
  };
  created_at?: string;
}

export default function MajorsPage() {
  const router = useRouter();
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [orgUnitFilter, setOrgUnitFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; major: Major | null }>({
    open: false,
    major: null
  });

  // Fetch majors data
  const fetchMajors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(degreeFilter && { degree_level: degreeFilter }),
        ...(orgUnitFilter && { org_unit_id: orgUnitFilter }),
      });

      const response = await fetch(`/api/tms/majors?${params}`);
      const data = await response.json();

      if (data.success) {
        setMajors(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.error || 'Failed to fetch majors');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, [page, searchTerm, statusFilter, degreeFilter, orgUnitFilter]);

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

  const handleDelete = async (major: Major) => {
    try {
      const response = await fetch(`/api/tms/majors/${major.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchMajors(); // Refresh the list
        setDeleteDialog({ open: false, major: null });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete major');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  if (loading && majors.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            <Grid container spacing={3}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
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
              onClick={() => router.push('/tms/majors/create')}
            >
              Thêm ngành mới
            </Button>
          </Stack>
        </Paper>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              placeholder="Tìm kiếm ngành đào tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="suspended">Tạm dừng</MenuItem>
                <MenuItem value="closed">Đã đóng</MenuItem>
                <MenuItem value="draft">Nháp</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Bằng cấp</InputLabel>
              <Select
                value={degreeFilter}
                label="Bằng cấp"
                onChange={(e) => setDegreeFilter(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="associate">Cao đẳng</MenuItem>
                <MenuItem value="bachelor">Cử nhân</MenuItem>
                <MenuItem value="master">Thạc sĩ</MenuItem>
                <MenuItem value="doctor">Tiến sĩ</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDegreeFilter('');
                setOrgUnitFilter('');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Stack>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Majors Grid */}
        <Grid container spacing={3}>
          {majors.map((major) => (
            <Grid item xs={12} sm={6} md={4} key={major.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Stack>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {major.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {major.OrgUnit?.name}
                      </Typography>
                    </Stack>
                    <Chip 
                      label={getStatusText(major.status)}
                      color={getStatusColor(major.status) as any}
                      size="small"
                    />
                  </Stack>

                  {/* Major Info */}
                  <Stack spacing={1} mb={2}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {major.name_vi}
                    </Typography>
                    {major.name_en && (
                      <Typography variant="body2" color="text.secondary">
                        {major.name_en}
                      </Typography>
                    )}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BookmarkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {getDegreeLevelText(major.degree_level)}
                      </Typography>
                    </Stack>
                    {major.duration_years && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {major.duration_years} năm
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  {/* Stats */}
                  <Stack direction="row" spacing={2} mb={2}>
                    <Badge badgeContent={major._count?.Program || 0} color="primary">
                      <Tooltip title="Số chương trình">
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <BookmarkIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">Chương trình</Typography>
                        </Stack>
                      </Tooltip>
                    </Badge>
                    <Badge badgeContent={major._count?.MajorOutcome || 0} color="secondary">
                      <Tooltip title="Chuẩn đầu ra">
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TrendingUpIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption">Chuẩn đầu ra</Typography>
                        </Stack>
                      </Tooltip>
                    </Badge>
                  </Stack>

                  {/* Languages & Modalities */}
                  <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                    {major.languages?.slice(0, 2).map((lang, index) => (
                      <Chip 
                        key={index}
                        label={lang.lang.toUpperCase()}
                        size="small"
                        variant="outlined"
                        icon={<LanguageIcon />}
                      />
                    ))}
                    {major.modalities?.slice(0, 1).map((mod, index) => (
                      <Chip 
                        key={index}
                        label={mod.modality}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Actions */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => router.push(`/tms/majors/${major.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          size="small" 
                          color="secondary"
                          onClick={() => router.push(`/tms/majors/${major.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => setDeleteDialog({ open: true, major })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    
                    <Typography variant="caption" color="text.secondary">
                      {new Date(major.created_at || '').toLocaleDateString('vi-VN')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Empty State */}
        {!loading && majors.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <SchoolOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              Không tìm thấy ngành đào tạo nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thử thay đổi bộ lọc hoặc tạo ngành đào tạo mới
            </Typography>
          </Paper>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Stack alignItems="center" mt={4}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Stack>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, major: null })}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa ngành đào tạo "{deleteDialog.major?.name_vi}" không?
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, major: null })}>
              Hủy
            </Button>
            <Button 
              onClick={() => deleteDialog.major && handleDelete(deleteDialog.major)}
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


