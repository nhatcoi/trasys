'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Comment as CommentIcon,
  FilterList as FilterIcon,
  Replay as ReplayIcon,
  Reply as ReplyIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Publish as PublishIcon,
} from '@mui/icons-material';
import {
  DEFAULT_PROGRAM_PAGE_SIZE,
  PROGRAM_PRIORITIES,
  PROGRAM_STATUSES,
  ProgramPriority,
  ProgramStatus,
  getProgramPriorityColor,
  getProgramPriorityLabel,
  getProgramStatusColor,
  getProgramStatusLabel,
} from '@/constants/programs';
import {
  OrgUnitApiItem,
  OrgUnitOption,
  ProgramApiResponseItem,
  ProgramDetail,
  ProgramDetailApiResponse,
  ProgramListApiResponse,
  ProgramListItem,
  mapOrgUnitOptions,
  mapProgramDetail,
  mapProgramResponse,
} from '../program-utils';

interface ProgramStatsSummary {
  total: number;
  draft: number;
  submitted: number;
  reviewing: number;
  approved: number;
  rejected: number;
  published: number;
  archived: number;
}

interface ProgramStatsApiResponse {
  success: boolean;
  data?: {
    summary?: ProgramStatsSummary;
  };
  error?: string;
}

const INITIAL_STATS: ProgramStatsSummary = {
  total: 0,
  draft: 0,
  submitted: 0,
  reviewing: 0,
  approved: 0,
  rejected: 0,
  published: 0,
  archived: 0,
};

export default function ProgramsReviewPage(): JSX.Element {
  const [programs, setPrograms] = useState<ProgramListItem[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnitOption[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProgramStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<ProgramPriority | 'all'>('all');
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>('all');
  const [searchValue, setSearchValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProgramStatsSummary>(INITIAL_STATS);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchOrgUnits = useCallback(async () => {
    try {
      const response = await fetch('/api/tms/faculties?limit=200');
      const result = (await response.json()) as {
        data?: { items?: OrgUnitApiItem[] };
      };
      if (response.ok && result?.data?.items) {
        setOrgUnits(mapOrgUnitOptions(result.data.items));
      }
    } catch (err) {
      console.error('Failed to load faculties', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/tms/programs/stats');
      const result = (await response.json()) as ProgramStatsApiResponse;
      if (response.ok && result?.success) {
        setStats(result.data?.summary ?? INITIAL_STATS);
      }
    } catch (err) {
      console.error('Failed to load program stats', err);
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: '1',
        limit: String(DEFAULT_PROGRAM_PAGE_SIZE * 3),
      });

      if (selectedStatus !== 'all') {
        params.set('status', selectedStatus);
      }

      if (selectedOrgUnit !== 'all') {
        params.set('orgUnitId', selectedOrgUnit);
      }

      if (searchTerm) {
        params.set('search', searchTerm);
      }

      const response = await fetch(`/api/tms/programs?${params.toString()}`);
      const result = (await response.json()) as ProgramListApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Không thể tải danh sách chương trình');
      }

      const items: ProgramApiResponseItem[] = result.data?.items ?? [];
      setPrograms(items.map(mapProgramResponse));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải dữ liệu';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedOrgUnit, selectedStatus]);

  const fetchProgramDetail = useCallback(async (programId: string) => {
    try {
      const response = await fetch(`/api/tms/programs/${programId}`);
      const result = (await response.json()) as {
        success: boolean;
        data: ProgramDetailApiResponse;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Không thể tải chi tiết chương trình');
      }

      const detail = mapProgramDetail(result.data);
      setSelectedProgram(detail);
      setDialogOpen(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải chi tiết chương trình';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchOrgUnits();
    fetchStats();
  }, [fetchOrgUnits, fetchStats]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const applySearch = () => {
    setSearchTerm(searchValue.trim());
  };

  const resetFilters = () => {
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedOrgUnit('all');
    setSearchValue('');
    setSearchTerm('');
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (selectedPriority !== 'all' && program.priority !== selectedPriority) {
        return false;
      }
      return true;
    });
  }, [programs, selectedPriority]);

  const handleReviewAction = async (action: 'review' | 'approve' | 'reject' | 'return' | 'publish', program: ProgramListItem) => {
    const statusMap: Record<typeof action, ProgramStatus> = {
      review: ProgramStatus.REVIEWING,
      approve: ProgramStatus.APPROVED,
      reject: ProgramStatus.REJECTED,
      return: ProgramStatus.SUBMITTED,
      publish: ProgramStatus.PUBLISHED,
    };

    try {
      const response = await fetch(`/api/tms/programs/${program.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusMap[action] }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Không thể cập nhật trạng thái chương trình');
      }

      setSnackbar({ open: true, message: 'Đã cập nhật trạng thái chương trình', severity: 'success' });
      setDialogOpen(false);
      fetchPrograms();
      fetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái chương trình';
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Xem xét chương trình đào tạo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý quy trình phê duyệt chương trình đào tạo và theo dõi tiến độ xử lý
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<FilterIcon />} onClick={resetFilters}>
            Đặt lại bộ lọc
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Đang chờ xử lý
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {stats.submitted}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Đang xem xét
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {stats.reviewing}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Đã phê duyệt
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {stats.approved}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Tổng số chương trình
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {stats.total}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }}>
          <TextField
            placeholder="Tìm kiếm chương trình..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                applySearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 220 }}
          />

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={selectedStatus} label="Trạng thái" onChange={(event) => setSelectedStatus(event.target.value as ProgramStatus | 'all')}>
              <MenuItem value="all">Tất cả</MenuItem>
              {PROGRAM_STATUSES.filter((status) => status !== ProgramStatus.DRAFT && status !== ProgramStatus.ARCHIVED).map((status) => (
                <MenuItem key={status} value={status}>
                  {getProgramStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Độ ưu tiên</InputLabel>
            <Select value={selectedPriority} label="Độ ưu tiên" onChange={(event) => setSelectedPriority(event.target.value as ProgramPriority | 'all')}>
              <MenuItem value="all">Tất cả</MenuItem>
              {PROGRAM_PRIORITIES.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {getProgramPriorityLabel(priority)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Đơn vị</InputLabel>
            <Select value={selectedOrgUnit} label="Đơn vị" onChange={(event) => setSelectedOrgUnit(event.target.value)}>
              <MenuItem value="all">Tất cả đơn vị</MenuItem>
              {orgUnits.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={applySearch}>
              Tìm kiếm
            </Button>
            <Button variant="text" onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Tên chương trình</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Ưu tiên</TableCell>
                <TableCell>Thống kê</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              )}

              {error && !loading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchPrograms}>Thử lại</Button>}>
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && filteredPrograms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Alert severity="info">Không có chương trình nào.</Alert>
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && filteredPrograms.map((program) => (
                <TableRow key={program.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {program.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {program.nameVi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phiên bản {program.version || 'Mặc định'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {program.orgUnit ? (
                      <>
                        <Typography variant="body2" fontWeight="medium">
                          {program.orgUnit.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {program.orgUnit.code}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa cập nhật
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getProgramStatusLabel(program.status)}
                      color={getProgramStatusColor(program.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getProgramPriorityLabel(program.priority)}
                      color={getProgramPriorityColor(program.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {program.stats.courseCount} học phần • {program.stats.studentCount} sinh viên
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton size="small" color="primary" onClick={() => fetchProgramDetail(program.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {program.status === ProgramStatus.SUBMITTED && (
                        <Tooltip title="Đánh giá">
                          <IconButton size="small" color="inherit" onClick={() => handleReviewAction('review', program)}>
                            <CommentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {program.status === ProgramStatus.REVIEWING && (
                        <>
                          <Tooltip title="Phê duyệt">
                            <IconButton size="small" color="success" onClick={() => handleReviewAction('approve', program)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Từ chối">
                            <IconButton size="small" color="error" onClick={() => handleReviewAction('reject', program)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Trả lại chỉnh sửa">
                            <IconButton size="small" color="warning" onClick={() => handleReviewAction('return', program)}>
                              <ReplyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {program.status === ProgramStatus.APPROVED && (
                        <Tooltip title="Xuất bản">
                          <IconButton size="small" color="primary" onClick={() => handleReviewAction('publish', program)}>
                            <PublishIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết chương trình
        </DialogTitle>
        <DialogContent dividers>
          {selectedProgram ? (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6">Thông tin cơ bản</Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Mã chương trình
                    </Typography>
                    <Typography variant="body1">{selectedProgram.code}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getProgramStatusLabel(selectedProgram.status)}
                        color={getProgramStatusColor(selectedProgram.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Tên chương trình
                    </Typography>
                    <Typography variant="body1">{selectedProgram.nameVi}</Typography>
                  </Grid>
                  {selectedProgram.description && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Mô tả
                      </Typography>
                      <Typography variant="body2">{selectedProgram.description}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {selectedProgram.blocks.length > 0 && (
                <Box>
                  <Typography variant="h6">Cấu trúc chương trình</Typography>
                  <Divider sx={{ my: 1 }} />
                  <List dense>
                    {selectedProgram.blocks.map((block) => (
                      <React.Fragment key={block.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <ReplayIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${block.code} - ${block.title}`}
                            secondary={`${block.courses.length} học phần`}
                          />
                        </ListItem>
                        {block.courses.map((course) => (
                          <ListItem key={course.id} sx={{ pl: 8 }}>
                            <ListItemText
                              primary={`${course.code} - ${course.name}`}
                              secondary={`${course.credits} tín chỉ • ${course.required ? 'Bắt buộc' : 'Tự chọn'}`}
                            />
                          </ListItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Đang tải thông tin chương trình...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
          {selectedProgram && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleReviewAction('approve', selectedProgram)}
            >
              Phê duyệt
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
