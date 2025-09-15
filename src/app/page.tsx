'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Nếu user đã đăng nhập, redirect về /hr/dashboard
    if (status === 'authenticated' && session) {
      router.push('/hr/dashboard');
    }
  }, [session, status, router]);

  // Nếu đang loading hoặc đã đăng nhập, không hiển thị gì
  if (status === 'loading' || (status === 'authenticated' && session)) {
    return null;
  }
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
            <Card sx={{ textAlign: 'center', p: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h5" gutterBottom>
                    Hệ thống HR & Quản lý
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Quản lý nhân viên, đơn xin nghỉ, đánh giá hiệu suất và cấu trúc tổ chức
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => window.location.href = '/auth/signin'}
                    sx={{ backgroundColor: '#2e4c92' }}
                  >
                    Đăng nhập để bắt đầu
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}