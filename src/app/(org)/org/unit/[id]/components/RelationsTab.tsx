'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccountTree as AccountTreeIcon,
  Gavel as GavelIcon,
  Support as SupportIcon,
  Handshake as HandshakeIcon,
} from '@mui/icons-material';
import { type OrgUnit } from '@/features/org/api/use-org-units';
import { 
  getTypeColor, 
  getTypeIcon,
  getRelationTypeColor,
  getRelationTypeIcon,
  getRelationTypeLabel
} from '@/utils/org-unit-utils';

interface RelationsTabProps {
  unit: OrgUnit;
}

export default function RelationsTab({ unit }: RelationsTabProps) {
  const router = useRouter();

  const handleUnitClick = (unitId: string) => {
    router.push(`/org/unit/${unitId}`);
  };

  const getRelationIcon = (relationType: string) => {
    switch (relationType) {
      case 'direct': return AccountTreeIcon;
      case 'advisory': return GavelIcon;
      case 'support': return SupportIcon;
      case 'collab': return HandshakeIcon;
      default: return BusinessIcon;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Quan hệ tổ chức
      </Typography>

      <Stack spacing={3}>
        {/* Parent Relations */}
        {unit.parentRelations && unit.parentRelations.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đơn vị cấp trên ({unit.parentRelations.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Đơn vị</TableCell>
                      <TableCell>Loại quan hệ</TableCell>
                      <TableCell>Hiệu lực từ</TableCell>
                      <TableCell>Ghi chú</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unit.parentRelations.map((relation) => (
                      <TableRow 
                        key={`${relation.parent_id}-${relation.child_id}-${relation.relation_type}`} 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleUnitClick(relation.parent?.id || '')}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: getTypeColor(relation.parent?.type || ''), width: 32, height: 32 }}>
                              {React.createElement(getTypeIcon(relation.parent?.type || ''), { fontSize: 'small' })}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {relation.parent?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {relation.parent?.code}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ 
                              backgroundColor: getRelationTypeColor(relation.relation_type), 
                              width: 20, 
                              height: 20 
                            }}>
                              {React.createElement(getRelationIcon(relation.relation_type), { fontSize: 'small' })}
                            </Avatar>
                            <Typography variant="body2">
                              {getRelationTypeLabel(relation.relation_type)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(relation.effective_from).toLocaleDateString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {relation.note || 'Không có ghi chú'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnitClick(relation.parent?.id || '');
                              }}
                            >
                              <BusinessIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Child Relations */}
        {unit.childRelations && unit.childRelations.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đơn vị cấp dưới ({unit.childRelations.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Đơn vị</TableCell>
                      <TableCell>Loại quan hệ</TableCell>
                      <TableCell>Hiệu lực từ</TableCell>
                      <TableCell>Ghi chú</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unit.childRelations.map((relation) => (
                      <TableRow 
                        key={`${relation.parent_id}-${relation.child_id}-${relation.relation_type}`} 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleUnitClick(relation.child?.id || '')}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: getTypeColor(relation.child?.type || ''), width: 32, height: 32 }}>
                              {React.createElement(getTypeIcon(relation.child?.type || ''), { fontSize: 'small' })}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {relation.child?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {relation.child?.code}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ 
                              backgroundColor: getRelationTypeColor(relation.relation_type), 
                              width: 20, 
                              height: 20 
                            }}>
                              {React.createElement(getRelationIcon(relation.relation_type), { fontSize: 'small' })}
                            </Avatar>
                            <Typography variant="body2">
                              {getRelationTypeLabel(relation.relation_type)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(relation.effective_from).toLocaleDateString('vi-VN')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {relation.note || 'Không có ghi chú'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnitClick(relation.child?.id || '');
                              }}
                            >
                              <BusinessIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Direct Children (Simple Hierarchy) */}
        {unit.children && unit.children.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Đơn vị con trực tiếp ({unit.children.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Đơn vị</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Nhân viên</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unit.children.map((child) => (
                      <TableRow 
                        key={child.id} 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleUnitClick(child.id)}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: getTypeColor(child.type || ''), width: 32, height: 32 }}>
                              {React.createElement(getTypeIcon(child.type || ''), { fontSize: 'small' })}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {child.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {child.code}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={child.type || 'N/A'}
                            size="small"
                            sx={{
                              backgroundColor: getTypeColor(child.type || ''),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={child.status || 'N/A'}
                            size="small"
                            sx={{
                              backgroundColor: getTypeColor(child.status || ''),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {child.employees?.length || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Xem chi tiết">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnitClick(child.id);
                              }}
                            >
                              <BusinessIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* No Relations Message */}
        {(!unit.parentRelations || unit.parentRelations.length === 0) && 
         (!unit.childRelations || unit.childRelations.length === 0) && 
         (!unit.children || unit.children.length === 0) && (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AccountTreeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có quan hệ tổ chức
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đơn vị này chưa có đơn vị cha, đơn vị con hoặc quan hệ với các đơn vị khác
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
