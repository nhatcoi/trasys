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
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('overview');

  // Mock data for reports
  const reportData = {
    overview: {
      totalUnits: 45,
      totalEmployees: 1250,
      activeUnits: 42,
      unitsWithoutHead: 8,
      unitsWithoutStaff: 3,
    },
    byCampus: [
      { campus: 'Campus A', units: 20, employees: 650 },
      { campus: 'Campus B', units: 15, employees: 400 },
      { campus: 'Campus C', units: 10, employees: 200 },
    ],
    byType: [
      { type: 'Faculty', count: 12, percentage: 26.7 },
      { type: 'Department', count: 18, percentage: 40.0 },
      { type: 'Center', count: 8, percentage: 17.8 },
      { type: 'Board', count: 4, percentage: 8.9 },
      { type: 'Committee', count: 3, percentage: 6.7 },
    ],
    unitsWithoutHead: [
      { name: 'Phòng Đào tạo', code: 'TRAINING', type: 'Department', days: 15 },
      { name: 'Trung tâm Ngoại ngữ', code: 'LANG_CENTER', type: 'Center', days: 8 },
      { name: 'Ban Tài chính', code: 'FINANCE', type: 'Board', days: 22 },
    ],
    unitsWithoutStaff: [
      { name: 'Phòng Nghiên cứu', code: 'RESEARCH', type: 'Department', employees: 0 },
      { name: 'Ban An toàn', code: 'SAFETY', type: 'Committee', employees: 0 },
    ],
  };

  const reportTypes = [
    {
      id: 'overview',
      title: 'Tổng quan',
      description: 'Thống kê tổng quan về tổ chức',
      icon: <AssessmentIcon />,
      color: '#2e4c92',
    },
    {
      id: 'by_campus',
      title: 'Theo campus',
      description: 'Phân bố đơn vị và nhân sự theo campus',
      icon: <BusinessIcon />,
      color: '#1976d2',
    },
    {
      id: 'by_type',
      title: 'Theo loại đơn vị',
      description: 'Thống kê theo loại đơn vị tổ chức',
      icon: <PieChartIcon />,
      color: '#388e3c',
    },
    {
      id: 'missing_head',
      title: 'Thiếu trưởng đơn vị',
      description: 'Danh sách đơn vị chưa có trưởng',
      icon: <SupervisorAccountIcon />,
      color: '#f57c00',
    },
    {
      id: 'missing_staff',
      title: 'Thiếu nhân sự',
      description: 'Đơn vị chưa có nhân viên',
      icon: <GroupIcon />,
      color: '#d32f2f',
    },
  ];

  const renderOverviewReport = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <BusinessIcon sx={{ color: '#2e4c92', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {reportData.overview.totalUnits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng số đơn vị
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <GroupIcon sx={{ color: '#1976d2', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {reportData.overview.totalEmployees}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng nhân viên
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TrendingUpIcon sx={{ color: '#388e3c', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {reportData.overview.activeUnits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đơn vị hoạt động
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <WarningIcon sx={{ color: '#f57c00', fontSize: 32 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {reportData.overview.unitsWithoutHead}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thiếu trưởng đơn vị
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderByCampusReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Phân bố theo Campus
        </Typography>
        <List>
          {reportData.byCampus.map((campus, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={campus.campus}
                  secondary={`${campus.units} đơn vị • ${campus.employees} nhân viên`}
                />
                <Chip
                  label={`${Math.round((campus.units / reportData.overview.totalUnits) * 100)}%`}
                  color="primary"
                  variant="outlined"
                />
              </ListItem>
              {index < reportData.byCampus.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderByTypeReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Phân bố theo loại đơn vị
        </Typography>
        <List>
          {reportData.byType.map((type, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <PieChartIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={type.type}
                  secondary={`${type.count} đơn vị`}
                />
                <Chip
                  label={`${type.percentage}%`}
                  color="secondary"
                  variant="outlined"
                />
              </ListItem>
              {index < reportData.byType.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderMissingHeadReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Đơn vị thiếu trưởng
        </Typography>
        <List>
          {reportData.unitsWithoutHead.map((unit, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={unit.name}
                  secondary={`${unit.code} • ${unit.type}`}
                />
                <Chip
                  label={`${unit.days} ngày`}
                  color="warning"
                  variant="outlined"
                />
              </ListItem>
              {index < reportData.unitsWithoutHead.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderMissingStaffReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Đơn vị thiếu nhân sự
        </Typography>
        <List>
          {reportData.unitsWithoutStaff.map((unit, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <GroupIcon color="error" />
                </ListItemIcon>
                <ListItemText
                  primary={unit.name}
                  secondary={`${unit.code} • ${unit.type}`}
                />
                <Chip
                  label={`${unit.employees} nhân viên`}
                  color="error"
                  variant="outlined"
                />
              </ListItem>
              {index < reportData.unitsWithoutStaff.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'by_campus':
        return renderByCampusReport();
      case 'by_type':
        return renderByTypeReport();
      case 'missing_head':
        return renderMissingHeadReport();
      case 'missing_staff':
        return renderMissingStaffReport();
      default:
        return renderOverviewReport();
    }
  };

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
          <AssessmentIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Báo cáo tổ chức
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thống kê và phân tích cấu trúc tổ chức
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* Report Types Sidebar */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <FilterListIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Loại báo cáo
                </Typography>
              </Stack>
              
              <List>
                {reportTypes.map((report, index) => (
                  <React.Fragment key={report.id}>
                    <ListItem
                      button
                      selected={selectedReport === report.id}
                      onClick={() => setSelectedReport(report.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        '&.Mui-selected': {
                          backgroundColor: `${report.color}15`,
                          '&:hover': {
                            backgroundColor: `${report.color}25`,
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: selectedReport === report.id ? report.color : 'inherit' }}>
                        {report.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={report.title}
                        secondary={report.description}
                        primaryTypographyProps={{
                          fontWeight: selectedReport === report.id ? 'bold' : 'normal',
                          color: selectedReport === report.id ? report.color : 'inherit',
                        }}
                      />
                    </ListItem>
                    {index < reportTypes.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {reportTypes.find(r => r.id === selectedReport)?.title}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Làm mới dữ liệu">
                    <IconButton>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    sx={{ backgroundColor: '#2e4c92' }}
                  >
                    Xuất báo cáo
                  </Button>
                </Stack>
              </Stack>

              {renderReportContent()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
