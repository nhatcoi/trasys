'use client';

import { useState, useEffect } from 'react';
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
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

interface OrgUnit {
  id: number;
  parent_id: number | null;
  type: string | null;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
  description: string | null;
  status: string | null;
  effective_from: string | null;
  effective_to: string | null;
  children?: OrgUnit[];
  employees?: Employee[];
  parent?: OrgUnit;
}

interface Employee {
  id: string;
  user_id: string | null;
  employee_no: string | null;
  employment_ty: string | null;
  status: string | null;
  hired_at: string | null;
  terminated_at: string | null;
  created_at: string;
  updated_at: string;
  org_unit_id: number | null;
  org_unit?: OrgUnit;
}

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
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/org/units');
      const result = await response.json();
      
      if (result.success) {
        // Build tree structure from flat array
        const buildOrgTree = (units: OrgUnit[]): OrgUnit[] => {
          const unitMap = new Map<number, OrgUnit & { children: OrgUnit[] }>();
          const roots: OrgUnit[] = [];

          // First pass: create map of all units
          units.forEach(unit => {
            unitMap.set(unit.id, { ...unit, children: [] });
          });

          // Second pass: build tree structure
          units.forEach(unit => {
            const unitWithChildren = unitMap.get(unit.id)!;
            
            if (unit.parent_id === null) {
              // Root level unit
              roots.push(unitWithChildren);
            } else {
              // Child unit
              const parent = unitMap.get(unit.parent_id);
              if (parent) {
                parent.children.push(unitWithChildren);
              }
            }
          });

          return roots;
        };

        const treeData = buildOrgTree(result.data);
        setOrgUnits(treeData);
      } else {
        setError(result.error || 'Failed to fetch organization units');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgUnits();
  }, []);

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
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchOrgUnits}
              disabled={loading}
              sx={{ backgroundColor: '#2e4c92' }}
            >
              Làm mới
            </Button>
          </Stack>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error">
              <AlertTitle>Lỗi</AlertTitle>
              {error}
            </Alert>
          )}

          {!loading && !error && orgUnits.length === 0 && (
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

          {!loading && !error && orgUnits.length > 0 && (
            <Box>
              {orgUnits.map((unit) => (
                <OrgTreeNode key={unit.id} unit={unit} level={0} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}