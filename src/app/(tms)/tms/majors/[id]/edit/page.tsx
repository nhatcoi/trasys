'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

interface OrgUnit {
  id: number;
  name: string;
  code: string;
}

interface MajorFormData {
  code: string;
  name_vi: string;
  name_en: string;
  short_name: string;
  slug: string;
  national_code: string;
  is_moet_standard: boolean;
  degree_level: string;
  field_cluster: string;
  specialization_model: string;
  org_unit_id: number;
  parent_major_id: number | null;
  duration_years: number;
  total_credits_min: number;
  total_credits_max: number;
  semesters_per_year: number;
  start_terms: string;
  default_quota: number;
  status: string;
  established_at: string;
  closed_at: string;
  description: string;
  notes: string;
  campuses: Array<{ campus_id: number; is_primary: boolean }>;
  languages: Array<{ lang: string; level: string }>;
  modalities: Array<{ modality: string; note: string }>;
  accreditations: Array<{
    scheme: string;
    level: string;
    valid_from: string;
    valid_to: string;
    cert_no: string;
    agency: string;
    note: string;
  }>;
  aliases: Array<{
    name: string;
    lang: string;
    valid_from: string;
    valid_to: string;
  }>;
  documents: Array<{
    doc_type: string;
    title: string;
    ref_no: string;
    issued_by: string;
    issued_at: string;
    file_url: string;
    note: string;
  }>;
}

export default function EditMajorPage() {
  const router = useRouter();
  const params = useParams();
  const majorId = params.id as string;
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  
  const [formData, setFormData] = useState<MajorFormData>({
    code: '',
    name_vi: '',
    name_en: '',
    short_name: '',
    slug: '',
    national_code: '',
    is_moet_standard: false,
    degree_level: 'bachelor',
    field_cluster: '',
    specialization_model: 'none',
    org_unit_id: 0,
    parent_major_id: null,
    duration_years: 4.0,
    total_credits_min: 120,
    total_credits_max: 150,
    semesters_per_year: 2,
    start_terms: 'Fall',
    default_quota: 100,
    status: 'draft',
    established_at: '',
    closed_at: '',
    description: '',
    notes: '',
    campuses: [],
    languages: [{ lang: 'vi', level: 'main' }],
    modalities: [{ modality: 'fulltime', note: '' }],
    accreditations: [],
    aliases: [],
    documents: [],
  });

  // Fetch major data and org units
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch major data
        const majorResponse = await fetch(`/api/tms/majors/${majorId}`);
        const majorData = await majorResponse.json();
        
        if (majorData.success) {
          const major = majorData.data;
          setFormData({
            code: major.code || '',
            name_vi: major.name_vi || '',
            name_en: major.name_en || '',
            short_name: major.short_name || '',
            slug: major.slug || '',
            national_code: major.national_code || '',
            is_moet_standard: major.is_moet_standard || false,
            degree_level: major.degree_level || 'bachelor',
            field_cluster: major.field_cluster || '',
            specialization_model: major.specialization_model || 'none',
            org_unit_id: major.org_unit_id || 0,
            parent_major_id: major.parent_major_id || null,
            duration_years: major.duration_years || 4.0,
            total_credits_min: major.total_credits_min || 120,
            total_credits_max: major.total_credits_max || 150,
            semesters_per_year: major.semesters_per_year || 2,
            start_terms: major.start_terms || 'Fall',
            default_quota: major.default_quota || 100,
            status: major.status || 'draft',
            established_at: major.established_at || '',
            closed_at: major.closed_at || '',
            description: major.description || '',
            notes: major.notes || '',
            campuses: major.campuses || [],
            languages: major.languages || [{ lang: 'vi', level: 'main' }],
            modalities: major.modalities || [{ modality: 'fulltime', note: '' }],
            accreditations: major.accreditations || [],
            aliases: major.aliases || [],
            documents: major.documents || [],
          });
        } else {
          setError(majorData.error || 'Failed to fetch major');
        }

        // Fetch org units
        const orgResponse = await fetch('/api/tms/majors/org-units');
        const orgData = await orgResponse.json();
        if (orgData.success && Array.isArray(orgData.data)) {
          setOrgUnits(orgData.data);
        } else {
          console.error('Invalid org units data:', orgData);
          setOrgUnits([]);
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (majorId) {
      fetchData();
    }
  }, [majorId]);

  const steps = [
    'Thông tin cơ bản',
    'Thông tin chi tiết',
    'Campus & Ngôn ngữ',
    'Chứng nhận & Tài liệu',
  ];

  const handleInputChange = (field: keyof MajorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof MajorFormData, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => 
        i === index ? { ...item, ...value } : item
      )
    }));
  };

  const addArrayItem = (field: keyof MajorFormData, newItem: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), newItem]
    }));
  };

  const removeArrayItem = (field: keyof MajorFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validation
      if (!formData.code || !formData.name_vi || !formData.org_unit_id) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const response = await fetch(`/api/tms/majors/${majorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/tms/majors/${majorId}`);
      } else {
        setError(data.error || 'Failed to update major');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => router.back()}
              sx={{ color: 'white' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Stack spacing={1}>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                Chỉnh sửa ngành đào tạo
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {formData.name_vi} ({formData.code})
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Form Content */}
        <Paper sx={{ p: 4 }}>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Thông tin cơ bản
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mã ngành *"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="VD: CNTT"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên ngắn"
                    value={formData.short_name}
                    onChange={(e) => handleInputChange('short_name', e.target.value)}
                    placeholder="VD: CNTT"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên tiếng Việt *"
                    value={formData.name_vi}
                    onChange={(e) => handleInputChange('name_vi', e.target.value)}
                    placeholder="VD: Công nghệ thông tin"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên tiếng Anh"
                    value={formData.name_en}
                    onChange={(e) => handleInputChange('name_en', e.target.value)}
                    placeholder="VD: Information Technology"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Đơn vị quản lý *</InputLabel>
                    <Select
                      value={formData.org_unit_id}
                      label="Đơn vị quản lý *"
                      onChange={(e) => handleInputChange('org_unit_id', e.target.value)}
                    >
                      {Array.isArray(orgUnits) && orgUnits.length > 0 ? (
                        orgUnits.map((unit) => (
                          <MenuItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.code})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          {orgUnits.length === 0 ? 'Đang tải đơn vị...' : 'Không có đơn vị nào'}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Bằng cấp *</InputLabel>
                    <Select
                      value={formData.degree_level}
                      label="Bằng cấp *"
                      onChange={(e) => handleInputChange('degree_level', e.target.value)}
                    >
                      <MenuItem value="associate">Cao đẳng</MenuItem>
                      <MenuItem value="bachelor">Cử nhân</MenuItem>
                      <MenuItem value="master">Thạc sĩ</MenuItem>
                      <MenuItem value="doctor">Tiến sĩ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Thời gian đào tạo (năm)"
                    type="number"
                    value={formData.duration_years}
                    onChange={(e) => handleInputChange('duration_years', parseFloat(e.target.value))}
                    inputProps={{ min: 0.5, max: 10, step: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số tín chỉ tối thiểu"
                    type="number"
                    value={formData.total_credits_min}
                    onChange={(e) => handleInputChange('total_credits_min', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 1000 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số tín chỉ tối đa"
                    type="number"
                    value={formData.total_credits_max}
                    onChange={(e) => handleInputChange('total_credits_max', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 1000 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Chỉ tiêu mặc định"
                    type="number"
                    value={formData.default_quota}
                    onChange={(e) => handleInputChange('default_quota', parseInt(e.target.value))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_moet_standard}
                        onChange={(e) => handleInputChange('is_moet_standard', e.target.checked)}
                      />
                    }
                    label="Chuẩn MOET"
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* Step 2: Detailed Information */}
          {activeStep === 1 && (
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Thông tin chi tiết
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mã quốc gia"
                    value={formData.national_code}
                    onChange={(e) => handleInputChange('national_code', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nhóm ngành"
                    value={formData.field_cluster}
                    onChange={(e) => handleInputChange('field_cluster', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Mô hình chuyên ngành</InputLabel>
                    <Select
                      value={formData.specialization_model}
                      label="Mô hình chuyên ngành"
                      onChange={(e) => handleInputChange('specialization_model', e.target.value)}
                    >
                      <MenuItem value="none">Không chuyên ngành</MenuItem>
                      <MenuItem value="major">Có chuyên ngành</MenuItem>
                      <MenuItem value="track">Có hướng chuyên sâu</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số học kỳ/năm"
                    type="number"
                    value={formData.semesters_per_year}
                    onChange={(e) => handleInputChange('semesters_per_year', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 4 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Học kỳ bắt đầu"
                    value={formData.start_terms}
                    onChange={(e) => handleInputChange('start_terms', e.target.value)}
                    placeholder="VD: Fall, Spring"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ngày thành lập"
                    type="date"
                    value={formData.established_at}
                    onChange={(e) => handleInputChange('established_at', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={formData.status}
                      label="Trạng thái"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="draft">Nháp</MenuItem>
                      <MenuItem value="proposed">Đề xuất</MenuItem>
                      <MenuItem value="active">Hoạt động</MenuItem>
                      <MenuItem value="suspended">Tạm dừng</MenuItem>
                      <MenuItem value="closed">Đã đóng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* Step 3: Campus & Languages */}
          {activeStep === 2 && (
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Campus & Ngôn ngữ giảng dạy
              </Typography>
              
              {/* Languages */}
              <Card>
                <CardHeader 
                  title="Ngôn ngữ giảng dạy"
                  action={
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => addArrayItem('languages', { lang: '', level: 'secondary' })}
                    >
                      Thêm ngôn ngữ
                    </Button>
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    {formData.languages.map((lang, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="center">
                        <TextField
                          label="Ngôn ngữ"
                          value={lang.lang}
                          onChange={(e) => handleArrayChange('languages', index, { lang: e.target.value })}
                          sx={{ flex: 1 }}
                        />
                        <FormControl sx={{ minWidth: 120 }}>
                          <InputLabel>Cấp độ</InputLabel>
                          <Select
                            value={lang.level}
                            label="Cấp độ"
                            onChange={(e) => handleArrayChange('languages', index, { level: e.target.value })}
                          >
                            <MenuItem value="main">Chính</MenuItem>
                            <MenuItem value="secondary">Phụ</MenuItem>
                          </Select>
                        </FormControl>
                        <IconButton
                          color="error"
                          onClick={() => removeArrayItem('languages', index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Modalities */}
              <Card>
                <CardHeader 
                  title="Hình thức đào tạo"
                  action={
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => addArrayItem('modalities', { modality: '', note: '' })}
                    >
                      Thêm hình thức
                    </Button>
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    {formData.modalities.map((mod, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="center">
                        <TextField
                          label="Hình thức"
                          value={mod.modality}
                          onChange={(e) => handleArrayChange('modalities', index, { modality: e.target.value })}
                          sx={{ flex: 1 }}
                          placeholder="VD: fulltime, parttime"
                        />
                        <TextField
                          label="Ghi chú"
                          value={mod.note}
                          onChange={(e) => handleArrayChange('modalities', index, { note: e.target.value })}
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => removeArrayItem('modalities', index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* Step 4: Accreditations & Documents */}
          {activeStep === 3 && (
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Chứng nhận & Tài liệu
              </Typography>
              
              {/* Accreditations */}
              <Card>
                <CardHeader 
                  title="Chứng nhận"
                  action={
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => addArrayItem('accreditations', {
                        scheme: '',
                        level: '',
                        valid_from: '',
                        valid_to: '',
                        cert_no: '',
                        agency: '',
                        note: ''
                      })}
                    >
                      Thêm chứng nhận
                    </Button>
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    {formData.accreditations.map((acc, index) => (
                      <Paper key={index} sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" spacing={2}>
                            <TextField
                              label="Tên chứng nhận"
                              value={acc.scheme}
                              onChange={(e) => handleArrayChange('accreditations', index, { scheme: e.target.value })}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="Cấp độ"
                              value={acc.level}
                              onChange={(e) => handleArrayChange('accreditations', index, { level: e.target.value })}
                              sx={{ flex: 1 }}
                            />
                          </Stack>
                          <Stack direction="row" spacing={2}>
                            <TextField
                              label="Từ ngày"
                              type="date"
                              value={acc.valid_from}
                              onChange={(e) => handleArrayChange('accreditations', index, { valid_from: e.target.value })}
                              InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                              label="Đến ngày"
                              type="date"
                              value={acc.valid_to}
                              onChange={(e) => handleArrayChange('accreditations', index, { valid_to: e.target.value })}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Stack>
                          <Stack direction="row" spacing={2}>
                            <TextField
                              label="Số chứng nhận"
                              value={acc.cert_no}
                              onChange={(e) => handleArrayChange('accreditations', index, { cert_no: e.target.value })}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="Tổ chức cấp"
                              value={acc.agency}
                              onChange={(e) => handleArrayChange('accreditations', index, { agency: e.target.value })}
                              sx={{ flex: 1 }}
                            />
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <TextField
                              label="Ghi chú"
                              value={acc.note}
                              onChange={(e) => handleArrayChange('accreditations', index, { note: e.target.value })}
                              sx={{ flex: 1 }}
                            />
                            <IconButton
                              color="error"
                              onClick={() => removeArrayItem('accreditations', index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" justifyContent="space-between" mt={4}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Quay lại
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
