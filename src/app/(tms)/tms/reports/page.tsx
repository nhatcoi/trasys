'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  BookOnline as BookOnlineIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

export default function TmsReportsPage() {
  const reportCategories = [
    {
      title: 'Báo cáo chương trình đào tạo',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      reports: [
        'Danh sách chương trình đào tạo theo khoa',
        'Thống kê số lượng sinh viên theo chương trình',
        'Báo cáo chất lượng chương trình đào tạo',
        'So sánh chương trình đào tạo',
      ],
    },
    {
      title: 'Báo cáo học phần',
      icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      reports: [
        'Danh sách học phần theo khoa',
        'Thống kê học phần bắt buộc/tự chọn',
        'Báo cáo tình hình mở lớp học phần',
        'Đánh giá chất lượng học phần',
      ],
    },
    {
      title: 'Báo cáo kế hoạch đào tạo',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      reports: [
        'Kế hoạch đào tạo theo học kỳ',
        'Thời khóa biểu giảng dạy',
        'Báo cáo sử dụng phòng học',
        'Thống kê giờ giảng của giảng viên',
      ],
    },
    {
      title: 'Báo cáo sinh viên',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      reports: [
        'Thống kê sinh viên theo ngành',
        'Báo cáo tình hình đăng ký học phần',
        'Thống kê sinh viên theo khoa',
        'Báo cáo kết quả học tập',
      ],
    },
  ];

  const quickReports = [
    {
      title: 'Dashboard TMS',
      description: 'Tổng quan hệ thống quản lý đào tạo',
      icon: <BarChartIcon />,
      color: '#1976d2',
    },
    {
      title: 'Thống kê theo biểu đồ',
      description: 'Biểu đồ thống kê các chỉ số đào tạo',
      icon: <PieChartIcon />,
      color: '#2e7d32',
    },
    {
      title: 'Xu hướng đào tạo',
      description: 'Phân tích xu hướng đào tạo theo thời gian',
      icon: <TimelineIcon />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #00695c 0%, #26a69a 100%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <AssessmentIcon sx={{ fontSize: 64 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              Báo cáo & Phân tích TMS
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Hệ thống báo cáo và phân tích dữ liệu đào tạo
            </Typography>
          </Stack>
        </Paper>

        {/* Quick Reports */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Báo cáo nhanh
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          {quickReports.map((report, index) => (
            <Card key={index} sx={{ height: '100%', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s ease-in-out' } }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: report.color }}>
                      {report.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.description}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: report.color }}
                    startIcon={<TrendingUpIcon />}
                  >
                    Xem báo cáo
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Report Categories */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Danh mục báo cáo chi tiết
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {reportCategories.map((category, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: category.color }}>
                      {category.icon}
                    </Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {category.title}
                    </Typography>
                  </Stack>
                  
                  <List dense>
                    {category.reports.map((report, reportIndex) => (
                      <React.Fragment key={reportIndex}>
                        <ListItem>
                          <ListItemIcon>
                            <AssessmentIcon sx={{ color: category.color }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={report}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                        {reportIndex < category.reports.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  
                  <Button 
                    variant="outlined" 
                    sx={{ borderColor: category.color, color: category.color }}
                    startIcon={<DownloadIcon />}
                  >
                    Xem tất cả
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}