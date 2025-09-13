'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

export default function CreateUnitPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        <AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Tạo đơn vị mới
      </Typography>

      <Card>
        <CardContent>
          <Alert severity="info">
            <AlertTitle>Đang phát triển</AlertTitle>
            Tính năng tạo đơn vị mới đang được phát triển. Sẽ có sẵn trong phiên bản tiếp theo.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
