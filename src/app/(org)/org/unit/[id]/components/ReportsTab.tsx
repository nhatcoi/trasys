'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Avatar,
  Paper,
  Button,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';
import { type OrgUnit } from '@/features/org/api/use-org-units';

interface ReportsTabProps {
  unit: OrgUnit;
}

export default function ReportsTab({ unit }: ReportsTabProps) {
  // Calculate statistics
  const totalEmployees = unit.employees?.length || 0;
  const totalChildren = unit.children?.length || 0;
  const totalSubEmployees = unit.children?.reduce((total, child) => total + (child.employees?.length || 0), 0) || 0;
  const grandTotalEmployees = totalEmployees + totalSubEmployees;

  const managementCount = unit.employees?.filter(emp => 
    emp.position?.toLowerCase().includes('trưởng') || 
    emp.position?.toLowerCase().includes('giám đốc') ||
    emp.position?.toLowerCase().includes('phó') ||
    emp.position?.toLowerCase().includes('head') ||
    emp.position?.toLowerCase().includes('manager')
  ).length || 0;

  const staffCount = totalEmployees - managementCount;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Báo cáo & Thống kê
      </Typography>

      <Stack spacing={3}>
        {/* Executive Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Tổng quan
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                    <BusinessIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {totalChildren}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đơn vị con
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                    <GroupIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {grandTotalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng nhân viên
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#ed6c02', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                    <SupervisorAccountIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {managementCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#9c27b0', mx: 'auto', mb: 1, width: 56, height: 56 }}>
                    <PersonIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {staffCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Organizational Structure Report */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Cơ cấu tổ chức
              </Typography>
              <Button variant="outlined" startIcon={<PieChartIcon />}>
                Xem biểu đồ
              </Button>
            </Stack>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Phân bổ theo loại đơn vị
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Tổng đơn vị:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {1 + totalChildren}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Đơn vị hiện tại:</Typography>
                      <Typography variant="body2">1</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Đơn vị con:</Typography>
                      <Typography variant="body2">{totalChildren}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Phân bổ nhân sự
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Nhân viên trực tiếp:</Typography>
                      <Typography variant="body2">{totalEmployees}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Nhân viên đơn vị con:</Typography>
                      <Typography variant="body2">{totalSubEmployees}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Tổng cộng:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {grandTotalEmployees}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Personnel Analysis */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Phân tích nhân sự
              </Typography>
              <Button variant="outlined" startIcon={<BarChartIcon />}>
                Xem chi tiết
              </Button>
            </Stack>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {totalEmployees > 0 ? Math.round((managementCount / totalEmployees) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ quản lý
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                    {totalEmployees > 0 ? Math.round((staffCount / totalEmployees) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tỷ lệ nhân viên
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    {totalChildren > 0 ? Math.round((grandTotalEmployees / (1 + totalChildren)) * 10) / 10 : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên/đơn vị TB
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Thao tác nhanh
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button 
                variant="contained" 
                startIcon={<AssessmentIcon />}
                sx={{ backgroundColor: '#2e4c92' }}
              >
                Xuất báo cáo PDF
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<TrendingUpIcon />}
              >
                Báo cáo xu hướng
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<PieChartIcon />}
              >
                Biểu đồ cơ cấu
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<BarChartIcon />}
              >
                So sánh đơn vị
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Placeholder for future charts */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Biểu đồ & Phân tích nâng cao
            </Typography>
            
            <Box sx={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              border: '2px dashed #ccc'
            }}>
              <Stack alignItems="center" spacing={2}>
                <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  Biểu đồ sẽ được hiển thị ở đây
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tính năng đang được phát triển
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
