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
  Divider,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';

export default function CurriculumPage() {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const programs = [
    { id: '1', name: 'Công nghệ thông tin', code: 'IT', credits: 140, duration: 4 },
    { id: '2', name: 'Kỹ thuật phần mềm', code: 'SE', credits: 135, duration: 4 },
    { id: '3', name: 'Khoa học dữ liệu', code: 'DS', credits: 130, duration: 4 }
  ];

  const curriculumBlocks = [
    {
      id: 1,
      name: 'Kiến thức giáo dục đại cương',
      type: 'GENERAL',
      credits: 45,
      required: true,
      courses: [
        { id: 1, code: 'MATH101', name: 'Toán cao cấp', credits: 3, semester: 1 },
        { id: 2, code: 'PHYS101', name: 'Vật lý đại cương', credits: 3, semester: 1 },
        { id: 3, code: 'ENG101', name: 'Tiếng Anh cơ bản', credits: 2, semester: 2 }
      ]
    },
    {
      id: 2,
      name: 'Kiến thức cơ sở ngành',
      type: 'FOUNDATION',
      credits: 35,
      required: true,
      courses: [
        { id: 4, code: 'CS101', name: 'Lập trình cơ bản', credits: 4, semester: 2 },
        { id: 5, code: 'CS102', name: 'Cấu trúc dữ liệu', credits: 3, semester: 3 },
        { id: 6, code: 'CS103', name: 'Thuật toán', credits: 3, semester: 4 }
      ]
    }
  ];

  const handleOpenDialog = (type: string) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'GENERAL': return 'primary';
      case 'FOUNDATION': return 'secondary';
      case 'MAJOR': return 'success';
      case 'THESIS': return 'warning';
      default: return 'default';
    }
  };

  const getBlockTypeLabel = (type: string) => {
    switch (type) {
      case 'GENERAL': return 'Đại cương';
      case 'FOUNDATION': return 'Cơ sở';
      case 'MAJOR': return 'Chuyên ngành';
      case 'THESIS': return 'Tốt nghiệp';
      default: return type;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <MenuBookIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Chương trình đào tạo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý chương trình đào tạo và khung chương trình
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Program Selection */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Chọn chương trình đào tạo</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => handleOpenDialog('import')}
              >
                Nhập từ file
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => handleOpenDialog('export')}
              >
                Xuất file
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('program')}
              >
                Thêm chương trình
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <FormControl fullWidth>
            <InputLabel>Chương trình đào tạo</InputLabel>
            <Select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              label="Chương trình đào tạo"
            >
              {programs.map((program) => (
                <MenuItem key={program.id} value={program.id}>
                  {program.name} ({program.code}) - {program.credits} tín chỉ
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Program Overview */}
        {selectedProgram && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin chương trình
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {(() => {
              const program = programs.find(p => p.id === selectedProgram);
              return program ? (
                <Box>
                  <Typography variant="h5" gutterBottom>{program.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Mã chương trình: {program.code}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <SchoolIcon sx={{ fontSize: 30, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">{program.credits}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tín chỉ
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent sx={{ textAlign: 'center', py: 2 }}>
                        <ScheduleIcon sx={{ fontSize: 30, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6">{program.duration}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Năm
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" startIcon={<EditIcon />} fullWidth>
                      Chỉnh sửa
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} fullWidth>
                      Xóa
                    </Button>
                  </Box>
                </Box>
              ) : null;
            })()}
          </Paper>
        )}
      </Box>

      {/* Curriculum Structure */}
      {selectedProgram && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Cấu trúc chương trình</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('block')}
            >
              Thêm khối kiến thức
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {curriculumBlocks.map((block) => (
            <Accordion key={block.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {block.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                    <Chip
                      label={getBlockTypeLabel(block.type)}
                      color={getBlockTypeColor(block.type) as any}
                      size="small"
                    />
                    <Chip
                      label={`${block.credits} tín chỉ`}
                      variant="outlined"
                      size="small"
                    />
                    <Badge badgeContent={block.courses.length} color="primary">
                      <AssessmentIcon />
                    </Badge>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Mã môn</TableCell>
                        <TableCell>Tên môn học</TableCell>
                        <TableCell align="center">Tín chỉ</TableCell>
                        <TableCell align="center">Học kỳ</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {block.courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.code}</TableCell>
                          <TableCell>{course.name}</TableCell>
                          <TableCell align="center">{course.credits}</TableCell>
                          <TableCell align="center">{course.semester}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" startIcon={<AddIcon />}>
                    Thêm môn học
                  </Button>
                  <Button size="small" startIcon={<EditIcon />}>
                    Sửa khối
                  </Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />}>
                    Xóa khối
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* Statistics */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thống kê chương trình
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">3</Typography>
              <Typography variant="body2" color="text.secondary">
                Chương trình
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6">156</Typography>
              <Typography variant="body2" color="text.secondary">
                Môn học
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">12</Typography>
              <Typography variant="body2" color="text.secondary">
                Khối kiến thức
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">8</Typography>
              <Typography variant="body2" color="text.secondary">
                Học kỳ
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Paper>

      {/* Dialog for various actions */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'program' && 'Thêm chương trình đào tạo'}
          {dialogType === 'block' && 'Thêm khối kiến thức'}
          {dialogType === 'import' && 'Nhập chương trình từ file'}
          {dialogType === 'export' && 'Xuất chương trình ra file'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'program' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField fullWidth label="Tên chương trình" />
              <TextField fullWidth label="Mã chương trình" />
              <TextField fullWidth label="Tổng tín chỉ" type="number" />
              <TextField fullWidth label="Thời gian đào tạo (năm)" type="number" />
              <TextField fullWidth label="Mô tả" multiline rows={3} />
            </Box>
          )}
          
          {dialogType === 'block' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField fullWidth label="Tên khối kiến thức" />
              <FormControl fullWidth>
                <InputLabel>Loại khối</InputLabel>
                <Select label="Loại khối">
                  <MenuItem value="GENERAL">Kiến thức giáo dục đại cương</MenuItem>
                  <MenuItem value="FOUNDATION">Kiến thức cơ sở ngành</MenuItem>
                  <MenuItem value="MAJOR">Kiến thức chuyên ngành</MenuItem>
                  <MenuItem value="THESIS">Khóa luận tốt nghiệp</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Tổng tín chỉ" type="number" />
              <TextField fullWidth label="Mô tả" multiline rows={3} />
            </Box>
          )}
          
          {(dialogType === 'import' || dialogType === 'export') && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {dialogType === 'import' 
                  ? 'Chọn file Excel hoặc CSV để nhập chương trình đào tạo'
                  : 'Chọn định dạng file để xuất chương trình đào tạo'
                }
              </Typography>
              <Button variant="outlined" component="label">
                {dialogType === 'import' ? 'Chọn file' : 'Xuất file'}
                <input type="file" hidden accept={dialogType === 'import' ? '.xlsx,.csv' : ''} />
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {dialogType === 'import' ? 'Nhập' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
