'use client';

import { useState, useEffect } from 'react';
import { orgApi, type OrgUnit, type OrgStats } from '@/features/org/api/api';
import { API_ROUTES } from '@/constants/routes';
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

// Types
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

// Constants
const COLORS = {
  PRIMARY: '#2e4c92',
  ORANGE: '#ff8c00',
  SUCCESS: '#4caf50',
  ERROR: '#f44336',
  GRAY: '#666666',
} as const;

const MOCK_ACTIVITIES: RecentActivity[] = [
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

// Utility functions
const getActivityIcon = (type: string) => {
  const iconMap = {
    unit_created: <BusinessIcon color="success" />,
    unit_updated: <AssessmentIcon color="info" />,
    employee_added: <PeopleIcon color="primary" />,
    employee_moved: <TrendingUpIcon color="warning" />,
  };
  return iconMap[type as keyof typeof iconMap] || <InfoIcon />;
};

const getTypeColor = (type: string): string => {
  const colorMap = {
    department: COLORS.PRIMARY,
    division: COLORS.PRIMARY,
    team: COLORS.ORANGE,
    branch: COLORS.ORANGE,
  };
  return colorMap[type.toLowerCase() as keyof typeof colorMap] || COLORS.GRAY;
};

const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

const formatDateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString('vi-VN');
};

export default function OrgDashboardPage() {

  const [stats, setStats] = useState<OrgStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const topUnits: TopUnit[] = stats?.topUnits || [];

  const fetchStats = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ROUTES.ORG.STATS);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Lỗi lấy thống kê');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lấy thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = (): void => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
    setRecentActivities(MOCK_ACTIVITIES);
  }, []);

  const renderLoadingState = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
      <CircularProgress size={60} />
      <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
    </Box>
  );

  const renderHeader = () => (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 1,
          backgroundColor: COLORS.PRIMARY,
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
  );

  const renderErrorState = () => (
    <Alert severity="error" sx={{ mb: 3 }}>
      <AlertTitle>Lỗi</AlertTitle>
      {String(error) || 'Có lỗi xảy ra khi tải dữ liệu'}
    </Alert>
  );

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, backgroundColor: string) => (
    <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ backgroundColor }}>
              {icon}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  const renderStatsCards = () => {
    const statsData = [
      { title: 'Tổng đơn vị', value: stats?.totalUnits || 0, icon: <ApartmentIcon />, backgroundColor: COLORS.PRIMARY },
      { title: 'Tổng nhân viên', value: stats?.totalEmployees || 0, icon: <PeopleIcon />, backgroundColor: COLORS.ORANGE },
      { title: 'Đơn vị hoạt động', value: stats?.activeUnits || 0, icon: <CheckCircleIcon />, backgroundColor: COLORS.SUCCESS },
      { title: 'Đơn vị không hoạt động', value: stats?.inactiveUnits || 0, icon: <WarningIcon />, backgroundColor: COLORS.ERROR },
    ];

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {statsData.map((stat) => renderStatCard(stat.title, stat.value, stat.icon, stat.backgroundColor))}
      </Box>
    );
  };

  const renderUnitTypeDistribution = () => {
    const unitTypes = [
      { label: 'Phòng ban', value: stats?.departments || 0, color: 'rgba(46, 76, 146, 0.1)' },
      { label: 'Bộ phận', value: stats?.divisions || 0, color: 'rgba(46, 76, 146, 0.1)' },
      { label: 'Nhóm', value: stats?.teams || 0, color: 'rgba(255, 140, 0, 0.1)' },
      { label: 'Chi nhánh', value: stats?.branches || 0, color: 'rgba(255, 140, 0, 0.1)' },
    ];

    return (
      <Box sx={{ flex: '1 1 400px', minWidth: '400px' }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Phân bố loại đơn vị
            </Typography>
            
            <Stack spacing={2}>
              {unitTypes.map((unitType) => (
                <Box key={unitType.label}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">{unitType.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {unitType.value}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={calculatePercentage(unitType.value, stats?.totalUnits || 0)}
                    sx={{ height: 8, borderRadius: 4, backgroundColor: unitType.color }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderTopUnits = () => (
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
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.PRIMARY }}>
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
  );

  const renderRecentActivities = () => (
    <Box sx={{ flex: '1 1 100%', minWidth: '100%' }}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Hoạt động gần đây
            </Typography>
            <RefreshIcon
              sx={{ cursor: 'pointer', color: COLORS.PRIMARY }}
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
                          {formatDateTime(activity.timestamp)}
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
                              backgroundColor: COLORS.ORANGE,
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
  );

  // Main render
  if (loading) {
    return renderLoadingState();
  }

  return (
    <Box>
      {renderHeader()}
      {error && renderErrorState()}
      {renderStatsCards()}
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {renderUnitTypeDistribution()}
        {renderTopUnits()}
        {renderRecentActivities()}
      </Box>
    </Box>
  );
}
