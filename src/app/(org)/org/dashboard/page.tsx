'use client';

import { useState, useEffect } from 'react';
import { orgApi, type OrgUnit, type OrgStats } from '@/features/org/api/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// Using OrgStats type from centralized API

// Using OrgUnit type from centralized API

interface RecentActivity {
  id: string;
  type: 'unit_created' | 'unit_updated' | 'employee_added' | 'employee_moved';
  description: string;
  timestamp: string;
  unitName?: string;
  employeeName?: string;
}

interface TopUnit {
  id: string | number;
  name: string;
  code: string;
  employeeCount: number;
  type: string;
}

export default function OrgDashboardPage() {
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Top units from stats data
  const topUnits: TopUnit[] = stats?.topUnits || [];

  // Fetch stats data using centralized API
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching stats using direct fetch...');
      
      const response = await fetch('/api/org/stats');
      const result = await response.json();
      
      console.log('Stats API response:', result);
      
      if (result.success) {
        setStats(result.data);
        console.log('Stats set:', result.data);
      } else {
        setError(result.error || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    
    // Mock recent activities
    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'unit_created',
        description: 'Đơn vị mới được tạo',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unitName: 'Phòng Marketing',
      },
      {
        id: '2',
        type: 'employee_added',
        description: 'Nhân viên mới được thêm',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        employeeName: 'Nguyễn Văn A',
        unitName: 'Phòng IT',
      },
      {
        id: '3',
        type: 'unit_updated',
        description: 'Thông tin đơn vị được cập nhật',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        unitName: 'Phòng Nhân sự',
      },
    ];
    
    setRecentActivities(mockActivities);

  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'unit_created':
        return <BusinessIcon color="success" />;
      case 'unit_updated':
        return <AssessmentIcon color="info" />;
      case 'employee_added':
        return <PeopleIcon color="primary" />;
      case 'employee_moved':
        return <TrendingUpIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'department':
        return '#2e4c92';
      case 'division':
        return '#2e4c92';
      case 'team':
        return '#ff8c00';
      case 'branch':
        return '#ff8c00';
      default:
        return '#666666';
    }
  };

  console.log('Dashboard render - loading:', loading, 'error:', error, 'stats:', stats);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

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
            Dashboard Tổ chức
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tổng quan về cấu trúc và hoạt động tổ chức
          </Typography>
        </Box>
      </Stack>
        

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Lỗi</AlertTitle>
          {String(error) || 'Có lỗi xảy ra khi tải dữ liệu'}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ backgroundColor: '#2e4c92' }}>
                  <ApartmentIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalUnits || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng đơn vị
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ backgroundColor: '#ff8c00' }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalEmployees || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng nhân viên
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ backgroundColor: '#4caf50' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.activeUnits || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đơn vị hoạt động
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ backgroundColor: '#f44336' }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats?.inactiveUnits || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đơn vị không hoạt động
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Unit Types Distribution */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Phân bố loại đơn vị
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">Phòng ban</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats?.departments || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats && stats.totalUnits > 0 ? (stats.departments / stats.totalUnits) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(46, 76, 146, 0.1)' }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">Bộ phận</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats?.divisions || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats && stats.totalUnits > 0 ? (stats.divisions / stats.totalUnits) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(46, 76, 146, 0.1)' }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">Nhóm</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats?.teams || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats && stats.totalUnits > 0 ? (stats.teams / stats.totalUnits) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 140, 0, 0.1)' }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">Chi nhánh</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {stats?.branches || 0}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={stats && stats.totalUnits > 0 ? (stats.branches / stats.totalUnits) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 140, 0, 0.1)' }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Top Units by Employee Count */}
        <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Đơn vị có nhiều nhân viên nhất
              </Typography>
              
              <List>
                {topUnits.map((unit, index) => (
                  <Box key={unit.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: getTypeColor(unit.type) }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flex: 1 }}>
                        <ListItemText
                          primary={unit.name}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={unit.code}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Chip
                              label={unit.type}
                              size="small"
                              sx={{
                                backgroundColor: getTypeColor(unit.type),
                                color: 'white',
                                fontSize: '0.7rem',
                              }}
                            />
                          </Stack>
                        }
                      />
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e4c92' }}>
                          {unit.employeeCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          nhân viên
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < topUnits.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activities */}
        <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Hoạt động gần đây
                </Typography>
                <RefreshIcon
                  sx={{ cursor: 'pointer', color: '#2e4c92' }}
                  onClick={handleRefresh}
                />
              </Stack>
              
              <List>
                {recentActivities.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: 'rgba(46, 76, 146, 0.1)' }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleString('vi-VN')}
                            </Typography>
                            {activity.unitName && (
                              <Chip
                                label={activity.unitName}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                            {activity.employeeName && (
                              <Chip
                                label={activity.employeeName}
                                size="small"
                                sx={{
                                  backgroundColor: '#ff8c00',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
