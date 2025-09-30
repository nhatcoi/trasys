'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import {
  getProgramPriorityColor,
  getProgramPriorityLabel,
  getProgramStatusColor,
  getProgramStatusLabel,
} from '@/constants/programs';
import {
  ProgramDetail,
  ProgramDetailApiResponse,
  mapPloToOutcomeItems,
  mapProgramDetail,
} from '../program-utils';

interface ProgramDetailApiWrapper {
  success: boolean;
  data?: ProgramDetailApiResponse;
  error?: string;
}

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

export default function ProgramDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const programId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgram = useCallback(async () => {
    if (!programId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tms/programs/${programId}`);
      const result = (await response.json()) as ProgramDetailApiWrapper;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Không thể tải thông tin chương trình');
      }

      setProgram(mapProgramDetail(result.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông tin chương trình';
      setError(message);
      setProgram(null);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const ploItems = useMemo(() => mapPloToOutcomeItems(program?.plo), [program?.plo]);

  if (!programId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Không tìm thấy mã chương trình hợp lệ.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Quay lại
        </Button>
        <Typography variant="h4" component="h1">
          Chi tiết chương trình đào tạo
        </Typography>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && program && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {program.nameVi}
                </Typography>
                {program.nameEn && (
                  <Typography variant="subtitle1" color="text.secondary">
                    {program.nameEn}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Chip
                    label={getProgramStatusLabel(program.status)}
                    color={getProgramStatusColor(program.status)}
                    size="small"
                  />
                  <Chip
                    label={getProgramPriorityLabel(program.priority)}
                    color={getProgramPriorityColor(program.priority)}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Box>
              <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Mã chương trình
                </Typography>
                <Typography variant="h6">{program.code}</Typography>
                {program.version && (
                  <Typography variant="body2" color="text.secondary">
                    Phiên bản: {program.version}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push(`/tms/programs/${programId}/edit`)}
                >
                  Chỉnh sửa
                </Button>
              </Stack>
            </Stack>
            {program.description && (
              <Typography variant="body1" sx={{ mt: 3 }}>
                {program.description}
              </Typography>
            )}
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin chung
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Đơn vị quản lý</Typography>
                    <Typography fontWeight="medium">
                      {program.orgUnit ? `${program.orgUnit.name} (${program.orgUnit.code})` : 'Chưa cập nhật'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Tổng tín chỉ</Typography>
                    <Typography fontWeight="medium">{program.totalCredits}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Hiệu lực từ</Typography>
                    <Typography fontWeight="medium">{formatDate(program.effectiveFrom)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Hiệu lực đến</Typography>
                    <Typography fontWeight="medium">{formatDate(program.effectiveTo)}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Thống kê
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Số khối kiến thức
                      </Typography>
                      <Typography variant="h5">{program.blocks.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Học phần thuộc khối
                      </Typography>
                      <Typography variant="h5">
                        {program.blocks.reduce((acc, block) => acc + block.courses.length, 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Học phần độc lập
                      </Typography>
                      <Typography variant="h5">{program.standaloneCourses.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Sinh viên đang học
                      </Typography>
                      <Typography variant="h5">{program.stats.studentCount}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {ploItems.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Chuẩn đầu ra chương trình
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {ploItems.map((item, index) => (
                  <Box key={item.id || index}>
                    <Typography fontWeight="medium">
                      {index + 1}. {item.label || 'Chưa cập nhật'}
                    </Typography>
                    {item.category && (
                      <Typography variant="caption" color="text.secondary">
                        Loại: {item.category === 'general' ? 'Chuẩn chung' : 'Chuẩn cụ thể'}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cấu trúc chương trình
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {program.blocks.length === 0 ? (
              <Alert severity="info">Chưa có khối kiến thức nào được cấu hình.</Alert>
            ) : (
              program.blocks.map((block) => (
                <Accordion key={block.id} defaultExpanded sx={{ mb: 1, '&:last-of-type': { mb: 0 } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography fontWeight="medium">
                        {block.code} - {block.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {block.courses.length} học phần • Loại: {block.blockType}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {block.courses.length === 0 ? (
                      <Alert severity="info">Khối kiến thức này chưa có học phần nào.</Alert>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Mã học phần</TableCell>
                              <TableCell>Tên học phần</TableCell>
                              <TableCell align="center">Tín chỉ</TableCell>
                              <TableCell align="center">Bắt buộc</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {block.courses.map((course) => (
                              <TableRow key={course.id}>
                                <TableCell>{course.code}</TableCell>
                                <TableCell>{course.name}</TableCell>
                                <TableCell align="center">{course.credits}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={course.required ? 'Có' : 'Không'}
                                    color={course.required ? 'success' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Học phần độc lập
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {program.standaloneCourses.length === 0 ? (
              <Alert severity="info">Chưa có học phần độc lập nào.</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã học phần</TableCell>
                      <TableCell>Tên học phần</TableCell>
                      <TableCell align="center">Tín chỉ</TableCell>
                      <TableCell align="center">Bắt buộc</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {program.standaloneCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell align="center">{course.credits}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={course.required ? 'Có' : 'Không'}
                            color={course.required ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cập nhật
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography color="text.secondary">Ngày tạo</Typography>
                <Typography fontWeight="medium">{formatDate(program.createdAt)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography color="text.secondary">Lần cập nhật gần nhất</Typography>
                <Typography fontWeight="medium">{formatDate(program.updatedAt)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      )}
    </Container>
  );
}
