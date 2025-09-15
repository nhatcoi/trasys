'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

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
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
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

export default function ConfigPage() {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'unit_type' | 'status' | 'workflow' | null>(null);

  // Mock configuration data
  const configData = {
    unitTypes: [
      { id: 1, name: 'Faculty', code: 'FACULTY', description: 'Khoa/Viện', isActive: true, sortOrder: 1 },
      { id: 2, name: 'Department', code: 'DEPARTMENT', description: 'Phòng/Ban', isActive: true, sortOrder: 2 },
      { id: 3, name: 'Center', code: 'CENTER', description: 'Trung tâm', isActive: true, sortOrder: 3 },
      { id: 4, name: 'Board', code: 'BOARD', description: 'Ban/Hội đồng', isActive: true, sortOrder: 4 },
      { id: 5, name: 'Committee', code: 'COMMITTEE', description: 'Ủy ban', isActive: false, sortOrder: 5 },
    ],
    statuses: [
      { id: 1, name: 'Draft', code: 'DRAFT', description: 'Nháp', color: '#757575', isActive: true },
      { id: 2, name: 'Pending Review', code: 'PENDING_REVIEW', description: 'Chờ duyệt', color: '#ff9800', isActive: true },
      { id: 3, name: 'Approved', code: 'APPROVED', description: 'Đã duyệt', color: '#4caf50', isActive: true },
      { id: 4, name: 'Active', code: 'ACTIVE', description: 'Hoạt động', color: '#2196f3', isActive: true },
      { id: 5, name: 'Inactive', code: 'INACTIVE', description: 'Không hoạt động', color: '#f44336', isActive: true },
      { id: 6, name: 'Archived', code: 'ARCHIVED', description: 'Lưu trữ', color: '#9e9e9e', isActive: false },
    ],
    workflow: {
      enabled: true,
      requireApproval: true,
      autoApproval: false,
      approvalLevels: 2,
      notificationEnabled: true,
      escalationEnabled: false,
      escalationDays: 7,
    },
    security: {
      auditLogEnabled: true,
      auditRetentionDays: 365,
      ipWhitelistEnabled: false,
      sessionTimeout: 30,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type: 'unit_type' | 'status' | 'workflow') => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType(null);
  };

  const renderUnitTypesConfig = () => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Loại đơn vị tổ chức
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('unit_type')}
            sx={{ backgroundColor: '#2e4c92' }}
          >
            Thêm loại
          </Button>
        </Stack>

        <List>
          {configData.unitTypes.map((type, index) => (
            <React.Fragment key={type.id}>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {type.name}
                      </Typography>
                      <Chip label={type.code} size="small" variant="outlined" />
                      <Chip 
                        label={type.isActive ? 'Hoạt động' : 'Tạm dừng'} 
                        color={type.isActive ? 'success' : 'default'}
                        size="small" 
                      />
                    </Stack>
                  }
                  secondary={type.description}
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
              {index < configData.unitTypes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderStatusesConfig = () => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Trạng thái đơn vị
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('status')}
            sx={{ backgroundColor: '#2e4c92' }}
          >
            Thêm trạng thái
          </Button>
        </Stack>

        <List>
          {configData.statuses.map((status, index) => (
            <React.Fragment key={status.id}>
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: status.color,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {status.name}
                      </Typography>
                      <Chip label={status.code} size="small" variant="outlined" />
                      <Chip 
                        label={status.isActive ? 'Hoạt động' : 'Tạm dừng'} 
                        color={status.isActive ? 'success' : 'default'}
                        size="small" 
                      />
                    </Stack>
                  }
                  secondary={status.description}
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Chỉnh sửa">
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
              {index < configData.statuses.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderWorkflowConfig = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Cấu hình quy trình phê duyệt
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.workflow.enabled} />}
              label="Bật quy trình phê duyệt"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.workflow.requireApproval} />}
              label="Yêu cầu phê duyệt"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.workflow.autoApproval} />}
              label="Tự động phê duyệt"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.workflow.notificationEnabled} />}
              label="Gửi thông báo"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Số cấp phê duyệt</InputLabel>
              <Select
                value={configData.workflow.approvalLevels}
                label="Số cấp phê duyệt"
              >
                <MenuItem value={1}>1 cấp</MenuItem>
                <MenuItem value={2}>2 cấp</MenuItem>
                <MenuItem value={3}>3 cấp</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Thời gian nhắc nhở (ngày)"
              type="number"
              value={configData.workflow.escalationDays}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: '#2e4c92' }}
          >
            Lưu cấu hình
          </Button>
          <Button variant="outlined" startIcon={<CancelIcon />}>
            Hủy
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderSecurityConfig = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Cấu hình bảo mật
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.security.auditLogEnabled} />}
              label="Bật nhật ký kiểm toán"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.security.ipWhitelistEnabled} />}
              label="Danh sách IP được phép"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Thời gian lưu trữ nhật ký (ngày)"
              type="number"
              value={configData.security.auditRetentionDays}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Thời gian hết hạn phiên (phút)"
              type="number"
              value={configData.security.sessionTimeout}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
          Chính sách mật khẩu
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Độ dài tối thiểu"
              type="number"
              value={configData.security.passwordPolicy.minLength}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.security.passwordPolicy.requireUppercase} />}
              label="Yêu cầu chữ hoa"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.security.passwordPolicy.requireLowercase} />}
              label="Yêu cầu chữ thường"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.security.passwordPolicy.requireNumbers} />}
              label="Yêu cầu số"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={configData.security.passwordPolicy.requireSpecialChars} />}
              label="Yêu cầu ký tự đặc biệt"
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ backgroundColor: '#2e4c92' }}
          >
            Lưu cấu hình
          </Button>
          <Button variant="outlined" startIcon={<CancelIcon />}>
            Hủy
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            backgroundColor: '#2e4c92',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SettingsIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Cấu hình hệ thống
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quản lý cấu hình và thiết lập hệ thống
          </Typography>
        </Box>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="configuration tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<BusinessIcon />}
            label="Loại đơn vị"
            id="config-tab-0"
            aria-controls="config-tabpanel-0"
          />
          <Tab
            icon={<AssignmentIcon />}
            label="Trạng thái"
            id="config-tab-1"
            aria-controls="config-tabpanel-1"
          />
          <Tab
            icon={<TimelineIcon />}
            label="Quy trình"
            id="config-tab-2"
            aria-controls="config-tabpanel-2"
          />
          <Tab
            icon={<SecurityIcon />}
            label="Bảo mật"
            id="config-tab-3"
            aria-controls="config-tabpanel-3"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {renderUnitTypesConfig()}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderStatusesConfig()}
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        {renderWorkflowConfig()}
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        {renderSecurityConfig()}
      </TabPanel>

      {/* Configuration Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'unit_type' && 'Thêm/Sửa loại đơn vị'}
          {dialogType === 'status' && 'Thêm/Sửa trạng thái'}
          {dialogType === 'workflow' && 'Cấu hình quy trình'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên"
              fullWidth
              placeholder="Nhập tên..."
            />
            <TextField
              label="Mã"
              fullWidth
              placeholder="Nhập mã..."
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              placeholder="Nhập mô tả..."
            />
            {dialogType === 'status' && (
              <TextField
                label="Màu sắc"
                type="color"
                fullWidth
                defaultValue="#2196f3"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" sx={{ backgroundColor: '#2e4c92' }}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
