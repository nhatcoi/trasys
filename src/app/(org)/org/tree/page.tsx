'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountTree as AccountTreeIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { HorizontalTreeView } from '@/components/HorizontalTreeView';
import { TreeNodeProps } from '@/components/TreeNode';
import { buildTree } from '@/utils/tree-utils';
import { useOrgUnits, type OrgUnit } from '@/features/org/api/use-org-units';

// Using OrgUnit type from use-org-units hook

// Employee interface removed - using type from use-org-units hook

function OrgTreeNode({ unit, level }: { unit: OrgUnit; level: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = unit.children && unit.children.length > 0;
  const employeeCount = unit.employees?.length || 0;

  const toggleExpanded = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#2e4c92';
      case 'inactive':
        return '#ff8c00';
      case 'pending':
        return '#ff8c00';
      default:
        return '#666666';
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
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

  return (
    <Paper elevation={1} sx={{ mb: 1, ml: level * 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          cursor: hasChildren ? 'pointer' : 'default',
          '&:hover': hasChildren ? { backgroundColor: 'rgba(46, 76, 146, 0.04)' } : {},
        }}
        onClick={toggleExpanded}
      >
        {/* Expand/Collapse Icon */}
        <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', mr: 2 }}>
          {hasChildren ? (
            expanded ? <ExpandMoreIcon color="primary" /> : <ChevronRightIcon color="primary" />
          ) : (
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'grey.400' }} />
          )}
        </Box>

        {/* Unit Icon */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: 'rgba(46, 76, 146, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
          }}
        >
          <BusinessIcon sx={{ color: '#2e4c92', fontSize: 20 }} />
        </Box>

        {/* Unit Info */}
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {unit.name}
            </Typography>
            <Chip
              label={unit.code}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Stack>
          
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {unit.type && (
              <Chip
                label={unit.type}
                size="small"
                sx={{ 
                  backgroundColor: getTypeColor(unit.type),
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            )}
            
            {unit.status && (
              <Chip
                label={unit.status}
                size="small"
                sx={{ 
                  backgroundColor: getStatusColor(unit.status),
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            )}
            
            {employeeCount > 0 && (
              <Chip
                icon={<PeopleIcon />}
                label={employeeCount}
                size="small"
                sx={{ 
                  backgroundColor: '#ff8c00',
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* Children */}
      {expanded && hasChildren && (
        <Box sx={{ ml: 2 }}>
          {unit.children!.map((child) => (
            <OrgTreeNode key={child.id} unit={child} level={level + 1} />
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default function OrgTreePage() {
  const [viewMode, setViewMode] = useState<'tree' | 'chart'>('tree');
  
  // Use React Query hook for data fetching
  const { data: orgUnitsResponse, isLoading: loading, error, refetch } = useOrgUnits();
  const orgUnits = (orgUnitsResponse as { items?: OrgUnit[] })?.items || [];

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'tree' | 'chart',
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Convert OrgUnit to TreeNodeProps
  const convertToTreeNodeProps = (orgUnit: OrgUnit): TreeNodeProps => {
    return {
      id: orgUnit.id,
      name: orgUnit.name,
      code: orgUnit.code,
      type: orgUnit.type,
      status: orgUnit.status,
      employeeCount: orgUnit.employees?.length || 0,
      children: orgUnit.children?.map(convertToTreeNodeProps) || [],
    };
  };

  // Refresh function available through refetch from useOrgUnits hook

  // Build tree structure from flat array using utility function
  const treeData = buildTree(orgUnits);

  return (
    <Box>
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
          <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
            T
          </Typography>
        </Box>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Cây tổ chức
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Xem cấu trúc tổ chức theo dạng cây phân cấp
          </Typography>
        </Box>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <ApartmentIcon sx={{ color: '#2e4c92' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Cây tổ chức
              </Typography>
            </Stack>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="tree" aria-label="tree view">
                  <AccountTreeIcon sx={{ mr: 1 }} />
                  Tree View
                </ToggleButton>
                <ToggleButton value="chart" aria-label="chart view">
                  <ViewModuleIcon sx={{ mr: 1 }} />
                  Biểu đồ
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
                disabled={loading}
                sx={{ backgroundColor: '#2e4c92' }}
              >
                Làm mới
              </Button>
            </Stack>
          </Stack>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error">
              <AlertTitle>Lỗi</AlertTitle>
              {String(error) || 'Có lỗi xảy ra khi tải dữ liệu'}
            </Alert>
          )}

          {!loading && !error && treeData.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ApartmentIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có đơn vị tổ chức
              </Typography>
              <Typography color="text.secondary">
                Hãy thêm đơn vị tổ chức đầu tiên để bắt đầu
              </Typography>
            </Box>
          )}

          {!loading && !error && treeData.length > 0 && (
            <Box>
              {viewMode === 'tree' ? (
                // Tree View - hiển thị cây hiện tại
                treeData.map((unit) => (
                  <OrgTreeNode key={unit.id} unit={unit} level={0} />
                ))
              ) : (
                // Chart View - hiển thị biểu đồ cây ngang
                <HorizontalTreeView
                  data={treeData.map(convertToTreeNodeProps)}
                  loading={loading}
                  error={error ? String(error) : null}
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}