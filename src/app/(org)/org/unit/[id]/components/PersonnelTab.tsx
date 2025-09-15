'use client';

import React from 'react';
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
  Avatar,
  Chip,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { type OrgUnit } from '@/features/org/api/use-org-units';
import { getStatusColor } from '@/utils/org-unit-utils';

interface PersonnelTabProps {
  unit: OrgUnit;
}

export default function PersonnelTab({ unit }: PersonnelTabProps) {
  // Find unit head/manager
  const unitHead = unit.Employee?.find(emp => 
    emp.position?.toLowerCase().includes('trưởng') || 
    emp.position?.toLowerCase().includes('giám đốc') ||
    emp.position?.toLowerCase().includes('head') ||
    emp.position?.toLowerCase().includes('manager')
  );

  // Group employees by position type
  const management = unit.Employee?.filter(emp => 
    emp.position?.toLowerCase().includes('trưởng') || 
    emp.position?.toLowerCase().includes('giám đốc') ||
    emp.position?.toLowerCase().includes('phó') ||
    emp.position?.toLowerCase().includes('head') ||
    emp.position?.toLowerCase().includes('manager')
  ) || [];

  const staff = unit.Employee?.filter(emp => 
    !emp.position?.toLowerCase().includes('trưởng') && 
    !emp.position?.toLowerCase().includes('giám đốc') &&
    !emp.position?.toLowerCase().includes('phó') &&
    !emp.position?.toLowerCase().includes('head') &&
    !emp.position?.toLowerCase().includes('manager')
  ) || [];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Nhân sự & Quản lý
      </Typography>

      <Stack spacing={3}>
        {/* Unit Head/Manager */}
        {unitHead && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                <SupervisorAccountIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Người đứng đầu đơn vị
              </Typography>
              
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Avatar sx={{ backgroundColor: '#2e4c92', width: 64, height: 64 }}>
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {unitHead.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {unitHead.code}
                      </Typography>
                      <Chip
                        label={unitHead.position || 'Chưa xác định'}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Stack spacing={1}>
                        {unitHead.email && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon fontSize="small" color="primary" />
                            <Typography variant="body2">
                              {unitHead.email}
                            </Typography>
                          </Stack>
                        )}
                        {unitHead.phone && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon fontSize="small" color="primary" />
                            <Typography variant="body2">
                              {unitHead.phone}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Personnel Statistics */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Thống kê nhân sự
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#2e7d32', mx: 'auto', mb: 1 }}>
                    <GroupIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {unit.Employee?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng nhân viên
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#1976d2', mx: 'auto', mb: 1 }}>
                    <SupervisorAccountIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {management.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#ed6c02', mx: 'auto', mb: 1 }}>
                    <WorkIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {staff.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ backgroundColor: '#9c27b0', mx: 'auto', mb: 1 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {unit.children?.reduce((total, child) => total + (child.Employee?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nhân viên đơn vị con
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Management Staff */}
        {management.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Ban quản lý ({management.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhân viên</TableCell>
                      <TableCell>Chức vụ</TableCell>
                      <TableCell>Liên hệ</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {management.map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: '#1976d2' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {employee.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {employee.code}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.position || 'Chưa xác định'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {employee.email && (
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <EmailIcon fontSize="small" color="primary" />
                                <Typography variant="caption">
                                  {employee.email}
                                </Typography>
                              </Stack>
                            )}
                            {employee.phone && (
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <PhoneIcon fontSize="small" color="primary" />
                                <Typography variant="caption">
                                  {employee.phone}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.status || 'unknown'}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(employee.status || 'unknown'),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Regular Staff */}
        {staff.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Nhân viên ({staff.length})
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhân viên</TableCell>
                      <TableCell>Chức vụ</TableCell>
                      <TableCell>Liên hệ</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.map((employee) => (
                      <TableRow key={employee.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ backgroundColor: '#ed6c02' }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {employee.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {employee.code}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.position || 'Chưa xác định'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {employee.email && (
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <EmailIcon fontSize="small" color="primary" />
                                <Typography variant="caption">
                                  {employee.email}
                                </Typography>
                              </Stack>
                            )}
                            {employee.phone && (
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <PhoneIcon fontSize="small" color="primary" />
                                <Typography variant="caption">
                                  {employee.phone}
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.status || 'unknown'}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(employee.status || 'unknown'),
                              color: 'white',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* No Employees Message */}
        {(!unit.Employee || unit.Employee.length === 0) && (
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có nhân viên
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đơn vị này chưa có nhân viên được phân công
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
