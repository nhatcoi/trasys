'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  AppBar,
  Toolbar,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Rocket as RocketIcon,
  Apartment as ApartmentIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { ThemeToggle } from '@/components/theme-toggle';
import { DbTest } from '@/components/db-test';

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: '#2e4c92' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
            Trasy App
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <CardContent>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Chào mừng đến với Trasy
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Hệ thống đào tạo đơn giản
                    </Typography>
                  </Box>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" />
                      <Typography>Material-UI đã sẵn sàng</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <RocketIcon color="primary" />
                      <Typography>Next.js App Router</Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ApartmentIcon />}
                      onClick={() => window.location.href = '/org/tree'}
                      sx={{ backgroundColor: '#2e4c92' }}
                    >
                      Xem cây tổ chức
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PeopleIcon />}
                      onClick={() => window.location.href = '/hr/employees'}
                      sx={{ borderColor: '#2e4c92', color: '#2e4c92' }}
                    >
                      Quản lý nhân viên
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <DbTest />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}