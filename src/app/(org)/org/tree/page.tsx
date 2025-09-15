'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Apartment as ApartmentIcon,
  Refresh as RefreshIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { OrgTreeNode } from '@/components/OrgTreeNode';
import { buildTree } from '@/utils/tree-utils';
import { orgApi, type OrgUnit } from '@/features/org/api/api';


export default function OrgTreePage() {
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch org units data
  const fetchOrgUnitsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orgApi.units.getForTree();
      
      if (response.success) {
        setOrgUnits(response.data || []);
      } else {
        setError('Failed to fetch org units');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch org units');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  React.useEffect(() => {
    fetchOrgUnitsData();
  }, []);

  // Refresh function
  const refetch = () => {
    fetchOrgUnitsData();
  };



  // Build cấu trúc cây từ mảng flat
  // Convert string IDs to numbers for buildTree function
  const normalizedOrgUnits = orgUnits.map(unit => ({
    ...unit,
    id: parseInt(unit.id, 10),
    parent_id: unit.parent_id ? parseInt(unit.parent_id, 10) : null,
  }));

  const treeData = buildTree(normalizedOrgUnits);

  // Convert back to string IDs for OrgTreeNode component
  const convertedTreeData = treeData.map(unit => ({
    ...unit,
    id: unit.id.toString(),
    parent_id: unit.parent_id?.toString() || null,
  }));

  console.log("convertedTreeData", convertedTreeData);

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

          {!loading && !error && convertedTreeData.length === 0 && (
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

          {!loading && !error && convertedTreeData.length > 0 && (
            <Box>
              {/* Tree View - hiển thị cây hiện tại */}
              {convertedTreeData.map((unit) => (
                <OrgTreeNode key={unit.id} unit={unit} level={0} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}