'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Grid,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { type OrgUnit } from '@/features/org/api/use-org-units';
import { getTypeColor, getTypeIcon } from '@/utils/org-unit-utils';

interface BasicInfoTabProps {
  unit: OrgUnit;
}

export default function BasicInfoTab({ unit }: BasicInfoTabProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Thông tin cơ bản
      </Typography>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thông tin chính
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn vị
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {unit.code}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Loại đơn vị
                  </Typography>
                  <Chip
                    label={unit.type || 'Chưa xác định'}
                    size="small"
                    sx={{
                      backgroundColor: getTypeColor(unit.type || ''),
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Chip
                    label={unit.status || 'Chưa xác định'}
                    size="small"
                    sx={{
                      backgroundColor: getTypeColor(unit.status || ''),
                      color: 'white',
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>

                {unit.description && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mô tả
                    </Typography>
                    <Typography variant="body1">
                      {unit.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Dates and Hierarchy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thời gian & Phân cấp
              </Typography>
              
              <Stack spacing={2}>
                {unit.effective_from && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Có hiệu lực từ
                    </Typography>
                    <Typography variant="body1">
                      {new Date(unit.effective_from).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                )}

                {unit.effective_to && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Có hiệu lực đến
                    </Typography>
                    <Typography variant="body1">
                      {new Date(unit.effective_to).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body1">
                    {new Date(unit.created_at).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối
                  </Typography>
                  <Typography variant="body1">
                    {new Date(unit.updated_at).toLocaleString('vi-VN')}
                  </Typography>
                </Box>

                {unit.parent && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Đơn vị cha
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ backgroundColor: getTypeColor(unit.parent.type || ''), width: 24, height: 24 }}>
                        {React.createElement(getTypeIcon(unit.parent.type || ''), { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="body1">
                        {unit.parent.name} ({unit.parent.code})
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {unit.parent_id && !unit.parent && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ID đơn vị cha
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {unit.parent_id}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Thống kê tổng quan
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.children?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đơn vị con
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.employees?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng nhân viên
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#ed6c02', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.parentRelations?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quan hệ cấp trên
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ backgroundColor: '#9c27b0', mx: 'auto', mb: 1 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {unit.childRelations?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quan hệ cấp dưới
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
