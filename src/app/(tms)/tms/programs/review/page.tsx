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
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Comment as CommentIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon
} from '@mui/icons-material';

export default function ProgramsReviewPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const programs = [
    {
      id: 1,
      code: 'CNTT',
      name: 'Công nghệ thông tin',
      orgUnit: 'Khoa Công nghệ thông tin',
      status: 'SUBMITTED',
      priority: 'HIGH',
      submittedBy: 'Nguyễn Văn A',
      submittedAt: '2024-01-15',
      currentReviewer: 'Trần Thị B',
      duration: 4,
      credits: 140,
      degree: 'Cử nhân'
    },
    {
      id: 2,
      code: 'KTPM',
      name: 'Kỹ thuật phần mềm',
      orgUnit: 'Khoa Kỹ thuật phần mềm',
      status: 'REVIEWING',
      priority: 'MEDIUM',
      submittedBy: 'Lê Văn C',
      submittedAt: '2024-01-14',
      currentReviewer: 'Phạm Thị D',
      duration: 4,
      credits: 135,
      degree: 'Cử nhân'
    },
    {
      id: 3,
      code: 'KHDL',
      name: 'Khoa học dữ liệu',
      orgUnit: 'Khoa Khoa học dữ liệu',
      status: 'APPROVED',
      priority: 'HIGH',
      submittedBy: 'Hoàng Văn E',
      submittedAt: '2024-01-10',
      currentReviewer: null,
      duration: 4,
      credits: 130,
      degree: 'Cử nhân'
    }
  ];

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

  const filteredPrograms = programs.filter(program => {
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || program.priority === selectedPriority;
    const matchesSearch = searchTerm === '' || 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleViewDetails = (program: any) => {
    setSelectedProgram(program);
    setOpenDialog(true);
  };

  const handleReviewAction = (action: string, programId: number) => {
    console.log(`Performing ${action} on program ${programId}`);
    setOpenDialog(false);
  };

  const getActionButtons = (program: any) => {
    const buttons = [];
    
    buttons.push(
      <Button
        key="view"
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={() => handleViewDetails(program)}
      >
        Xem
      </Button>
    );

    if (program.status === 'SUBMITTED') {
      buttons.push(
        <Button
          key="review"
          size="small"
          variant="contained"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleReviewAction('review', program.id)}
        >
          Xem xét
        </Button>
      );
    }

    if (program.status === 'REVIEWING') {
      buttons.push(
        <Button
          key="approve"
          size="small"
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => handleReviewAction('approve', program.id)}
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
          onClick={() => handleReviewAction('reject', program.id)}
        >
          Từ chối
        </Button>
      );
      buttons.push(
        <Button
          key="return"
          size="small"
          startIcon={<ReplyIcon />}
          onClick={() => handleReviewAction('return', program.id)}
        >
          Trả về
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AssessmentIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Xem xét chương trình đào tạo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem xét và phê duyệt các chương trình đào tạo
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Tìm kiếm chương trình..."
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
              setSelectedPriority('all');
              setSearchTerm('');
            }}
          >
            Xóa bộ lọc
          </Button>
        </Box>
      </Paper>

      {/* Programs Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Danh sách chương trình đào tạo ({filteredPrograms.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã chương trình</TableCell>
                <TableCell>Tên chương trình</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Độ ưu tiên</TableCell>
                <TableCell>Thông tin cơ bản</TableCell>
                <TableCell>Người gửi</TableCell>
                <TableCell>Ngày gửi</TableCell>
                <TableCell>Người xem xét</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {program.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {program.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{program.orgUnit}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getStatusLabel(program.status)}
                      color={getStatusColor(program.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getPriorityLabel(program.priority)}
                      color={getPriorityColor(program.priority) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {program.degree} • {program.duration} năm • {program.credits} tín chỉ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        {program.submittedBy.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">{program.submittedBy}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{program.submittedAt}</Typography>
                  </TableCell>
                  <TableCell>
                    {program.currentReviewer ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          {program.currentReviewer.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{program.currentReviewer}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa phân công
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {getActionButtons(program)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Program Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Chi tiết chương trình: {selectedProgram?.code} - {selectedProgram?.name}
        </DialogTitle>
        <DialogContent>
          {selectedProgram && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Mã chương trình:</Typography>
                    <Typography variant="body1">{selectedProgram.code}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tên chương trình:</Typography>
                    <Typography variant="body1">{selectedProgram.name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Đơn vị:</Typography>
                    <Typography variant="body1">{selectedProgram.orgUnit}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Bằng cấp:</Typography>
                    <Typography variant="body1">{selectedProgram.degree}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Thời gian đào tạo:</Typography>
                    <Typography variant="body1">{selectedProgram.duration} năm</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Tổng tín chỉ:</Typography>
                    <Typography variant="body1">{selectedProgram.credits}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                    <Chip
                      label={getStatusLabel(selectedProgram.status)}
                      color={getStatusColor(selectedProgram.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Độ ưu tiên:</Typography>
                    <Chip
                      label={getPriorityLabel(selectedProgram.priority)}
                      color={getPriorityColor(selectedProgram.priority) as any}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Lịch sử xem xét
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Tạo mới"
                      secondary={`Bởi ${selectedProgram.submittedBy} vào ${selectedProgram.submittedAt}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Đang chờ xem xét"
                      secondary="Chờ Hội đồng khoa học xem xét"
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
  );
}
