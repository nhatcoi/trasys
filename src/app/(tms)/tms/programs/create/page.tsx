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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Autocomplete,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface FormData {
  basicInfo: {
    code: string;
    nameVi: string;
    nameEn: string;
    degree: string;
    duration: number;
    credits: number;
    orgUnitId: string;
    description: string;
  };
  objectives: Array<{
    id: string;
    objective: string;
    type: 'general' | 'specific';
  }>;
  structure: Array<{
    id: string;
    name: string;
    credits: number;
    required: boolean;
    courses: string[];
  }>;
  requirements: {
    admissionRequirements: string[];
    graduationRequirements: string[];
    languageRequirements: string;
  };
  workflow: {
    priority: string;
    notes: string;
    attachments: string[];
  };
}

const steps = [
  'Thông tin cơ bản',
  'Mục tiêu chương trình',
  'Cấu trúc chương trình',
  'Yêu cầu tốt nghiệp',
  'Xác nhận'
];

const degreeTypes = [
  { value: 'bachelor', label: 'Cử nhân' },
  { value: 'master', label: 'Thạc sĩ' },
  { value: 'phd', label: 'Tiến sĩ' },
  { value: 'diploma', label: 'Cao đẳng' }
];

const orgUnits = [
  { id: '1', name: 'Khoa Công nghệ thông tin' },
  { id: '2', name: 'Khoa Kỹ thuật phần mềm' },
  { id: '3', name: 'Khoa Khoa học dữ liệu' },
  { id: '4', name: 'Khoa An toàn thông tin' }
];

export default function CreateProgramPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      code: '',
      nameVi: '',
      nameEn: '',
      degree: 'bachelor',
      duration: 4,
      credits: 0,
      orgUnitId: '',
      description: ''
    },
    objectives: [] as Array<{
      id: string;
      objective: string;
      type: 'general' | 'specific';
    }>,
    structure: [] as Array<{
      id: string;
      name: string;
      credits: number;
      required: boolean;
      courses: string[];
    }>,
    requirements: {
      admissionRequirements: [] as string[],
      graduationRequirements: [] as string[],
      languageRequirements: ''
    },
    workflow: {
      priority: 'medium',
      notes: '',
      attachments: [] as string[]
    }
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSave = () => {
    console.log('Saving program:', formData);
    router.push('/tms/programs');
  };

  const handleSubmit = () => {
    console.log('Submitting program for approval:', formData);
    router.push('/tms/programs');
  };

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const addObjective = () => {
    const newObjective = {
      id: Date.now().toString(),
      objective: '',
      type: 'general' as const
    };
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective]
    }));
  };

  const updateObjective = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj =>
        obj.id === id ? { ...obj, [field]: value } : obj
      )
    }));
  };

  const removeObjective = (id: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(obj => obj.id !== id)
    }));
  };

  const addStructureBlock = () => {
    const newBlock = {
      id: Date.now().toString(),
      name: '',
      credits: 0,
      required: true,
      courses: [] as string[]
    };
    setFormData(prev => ({
      ...prev,
      structure: [...prev.structure, newBlock]
    }));
  };

  const updateStructureBlock = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      structure: prev.structure.map(block =>
        block.id === id ? { ...block, [field]: value } : block
      )
    }));
  };

  const removeStructureBlock = (id: string) => {
    setFormData(prev => ({
      ...prev,
      structure: prev.structure.filter(block => block.id !== id)
    }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Mã chương trình *"
                value={formData.basicInfo.code}
                onChange={(e) => updateFormData('basicInfo', { code: e.target.value })}
                placeholder="VD: CNTT"
              />
              <FormControl fullWidth>
                <InputLabel>Đơn vị tổ chức *</InputLabel>
                <Select
                  value={formData.basicInfo.orgUnitId}
                  onChange={(e) => updateFormData('basicInfo', { orgUnitId: e.target.value })}
                  label="Đơn vị tổ chức *"
                >
                  {orgUnits.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Tên chương trình (Tiếng Việt) *"
                value={formData.basicInfo.nameVi}
                onChange={(e) => updateFormData('basicInfo', { nameVi: e.target.value })}
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                fullWidth
                label="Tên chương trình (Tiếng Anh)"
                value={formData.basicInfo.nameEn}
                onChange={(e) => updateFormData('basicInfo', { nameEn: e.target.value })}
                sx={{ gridColumn: '1 / -1' }}
              />
              <FormControl fullWidth>
                <InputLabel>Bằng cấp *</InputLabel>
                <Select
                  value={formData.basicInfo.degree}
                  onChange={(e) => updateFormData('basicInfo', { degree: e.target.value })}
                  label="Bằng cấp *"
                >
                  {degreeTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Thời gian đào tạo (năm)"
                type="number"
                value={formData.basicInfo.duration}
                onChange={(e) => updateFormData('basicInfo', { duration: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 1, max: 8 }}
              />
              <TextField
                fullWidth
                label="Tổng số tín chỉ"
                type="number"
                value={formData.basicInfo.credits}
                onChange={(e) => updateFormData('basicInfo', { credits: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                label="Mô tả chương trình"
                multiline
                rows={4}
                value={formData.basicInfo.description}
                onChange={(e) => updateFormData('basicInfo', { description: e.target.value })}
                placeholder="Mô tả tổng quan về chương trình đào tạo..."
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Mục tiêu chương trình
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addObjective}>
                Thêm mục tiêu
              </Button>
            </Box>
            
            {formData.objectives.map((objective, index) => (
              <Card key={objective.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                      fullWidth
                      label={`Mục tiêu ${index + 1}`}
                      value={objective.objective}
                      onChange={(e) => updateObjective(objective.id, 'objective', e.target.value)}
                      multiline
                      rows={2}
                    />
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Loại</InputLabel>
                      <Select
                        value={objective.type}
                        onChange={(e) => updateObjective(objective.id, 'type', e.target.value)}
                        label="Loại"
                      >
                        <MenuItem value="general">Tổng quát</MenuItem>
                        <MenuItem value="specific">Cụ thể</MenuItem>
                      </Select>
                    </FormControl>
                    <IconButton
                      color="error"
                      onClick={() => removeObjective(objective.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            {formData.objectives.length === 0 && (
              <Alert severity="info">
                Chưa có mục tiêu nào. Nhấn "Thêm mục tiêu" để bắt đầu.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Cấu trúc chương trình
              </Typography>
              <Button startIcon={<AddIcon />} onClick={addStructureBlock}>
                Thêm khối kiến thức
              </Button>
            </Box>
            
            {formData.structure.map((block, index) => (
              <Accordion key={block.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {block.name || `Khối ${index + 1}`}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                      <Chip
                        label={`${block.credits} tín chỉ`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={block.required ? 'Bắt buộc' : 'Tự chọn'}
                        color={block.required ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Tên khối kiến thức"
                      value={block.name}
                      onChange={(e) => updateStructureBlock(block.id, 'name', e.target.value)}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Số tín chỉ"
                        type="number"
                        value={block.credits}
                        onChange={(e) => updateStructureBlock(block.id, 'credits', parseInt(e.target.value) || 0)}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={block.required}
                            onChange={(e) => updateStructureBlock(block.id, 'required', e.target.checked)}
                          />
                        }
                        label="Bắt buộc"
                      />
                    </Box>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={['CS101', 'CS102', 'CS103', 'MATH101', 'PHYS101']}
                      value={block.courses}
                      onChange={(_, newValue) => updateStructureBlock(block.id, 'courses', newValue)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Môn học trong khối"
                          placeholder="Nhập mã môn học hoặc chọn từ danh sách"
                        />
                      )}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        color="error"
                        onClick={() => removeStructureBlock(block.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
            
            {formData.structure.length === 0 && (
              <Alert severity="info">
                Chưa có khối kiến thức nào. Nhấn "Thêm khối kiến thức" để bắt đầu.
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Yêu cầu tốt nghiệp
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card>
                <CardHeader title="Điều kiện tuyển sinh" />
                <CardContent>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={['Tốt nghiệp THPT', 'Điểm thi đại học', 'Phỏng vấn', 'Bài kiểm tra năng lực']}
                    value={formData.requirements.admissionRequirements}
                    onChange={(_, newValue) => updateFormData('requirements', { admissionRequirements: newValue })}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Điều kiện tuyển sinh"
                        placeholder="Nhập điều kiện tuyển sinh"
                      />
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader title="Điều kiện tốt nghiệp" />
                <CardContent>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={['Hoàn thành tất cả môn học', 'Điểm trung bình >= 5.0', 'Khóa luận tốt nghiệp', 'Chứng chỉ tiếng Anh']}
                    value={formData.requirements.graduationRequirements}
                    onChange={(_, newValue) => updateFormData('requirements', { graduationRequirements: newValue })}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Điều kiện tốt nghiệp"
                        placeholder="Nhập điều kiện tốt nghiệp"
                      />
                    )}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader title="Yêu cầu ngoại ngữ" />
                <CardContent>
                  <TextField
                    fullWidth
                    label="Yêu cầu ngoại ngữ"
                    multiline
                    rows={3}
                    value={formData.requirements.languageRequirements}
                    onChange={(e) => updateFormData('requirements', { languageRequirements: e.target.value })}
                    placeholder="Mô tả yêu cầu về ngoại ngữ..."
                  />
                </CardContent>
              </Card>
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Xác nhận thông tin
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Thông tin chương trình đã được điền đầy đủ. Vui lòng kiểm tra lại trước khi lưu hoặc gửi duyệt.
            </Alert>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  value={formData.workflow.priority}
                  onChange={(e) => updateFormData('workflow', { priority: e.target.value })}
                  label="Độ ưu tiên"
                >
                  <MenuItem value="low">Thấp</MenuItem>
                  <MenuItem value="medium">Trung bình</MenuItem>
                  <MenuItem value="high">Cao</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Ghi chú (nếu có)"
                multiline
                rows={3}
                value={formData.workflow.notes}
                onChange={(e) => updateFormData('workflow', { notes: e.target.value })}
                placeholder="Thêm ghi chú cho người xem xét..."
                sx={{ gridColumn: { xs: '1 / -1', sm: '2 / -1' } }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Tóm tắt thông tin
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mã chương trình:</Typography>
                <Typography variant="body1">{formData.basicInfo.code || 'Chưa điền'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Tên chương trình:</Typography>
                <Typography variant="body1">{formData.basicInfo.nameVi || 'Chưa điền'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Thời gian đào tạo:</Typography>
                <Typography variant="body1">{formData.basicInfo.duration || 0} năm</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Tổng tín chỉ:</Typography>
                <Typography variant="body1">{formData.basicInfo.credits || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Mục tiêu chương trình:</Typography>
                <Typography variant="body1">{formData.objectives.length}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Khối kiến thức:</Typography>
                <Typography variant="body1">{formData.structure.length}</Typography>
              </Box>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          <LibraryBooksIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          {activeStep === 0 ? 'Tạo chương trình đào tạo mới' : 'Chỉnh sửa chương trình đào tạo'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Điền đầy đủ thông tin để tạo chương trình đào tạo mới
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Quay lại
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Tiếp theo
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                >
                  Lưu nháp
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<CheckCircleIcon />}
                >
                  Gửi duyệt
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
