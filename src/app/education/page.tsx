'use client';

import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import {
  School as SchoolIcon,
} from '@mui/icons-material';

export default function EducationPage() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Paper elevation={0} sx={{ p: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)', color: 'white', borderRadius: 2, mb: 4 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <SchoolIcon sx={{ fontSize: 64 }} />
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              Quản lý đào tạo
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Ngành, chương trình đào tạo, học phần, kế hoạch giảng dạy
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Tính năng sắp có:
          </Typography>
          <Stack spacing={2}>
            <Typography>• Quản lý ngành đào tạo</Typography>
            <Typography>• Quản lý chương trình đào tạo</Typography>
            <Typography>• Quản lý học phần</Typography>
            <Typography>• Kế hoạch giảng dạy</Typography>
            <Typography>• Báo cáo đào tạo</Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
