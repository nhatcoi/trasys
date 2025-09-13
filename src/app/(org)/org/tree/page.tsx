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
  AccountTree as AccountTreeIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import { HorizontalTreeView } from '@/components/HorizontalTreeView';
import { TreeNodeProps } from '@/components/TreeNode';
import { OrgTreeNode } from '@/components/OrgTreeNode';
import { buildTree } from '@/utils/tree-utils';
import { useOrgUnits, type OrgUnit } from '@/features/org/api/use-org-units';


export default function OrgTreePage() {
  const [viewMode, setViewMode] = useState<'tree' | 'chart'>('tree');
  
  // lấy data status = active
  const { data: orgUnitsResponse, isLoading: loading, error, refetch } = useOrgUnits({ status: 'active' });
  const orgUnits = (orgUnitsResponse as { items?: OrgUnit[] })?.items || [];

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'tree' | 'chart',
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Convert sang TreeNodeProps
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

  // Build cấu trúc cây từ mảng flat
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