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
  Approval as ApprovalIcon,
} from '@mui/icons-material';

export default function UnitWorkflowPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        <ApprovalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Yêu cầu phê duyệt
      </Typography>

      <Card>
        <CardContent>
          <Alert severity="info">
            <AlertTitle>Đang phát triển</AlertTitle>
            Tính năng quản lý yêu cầu phê duyệt đang được phát triển. Sẽ có sẵn trong phiên bản tiếp theo.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
