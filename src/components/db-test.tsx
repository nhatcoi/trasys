'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

export function DbTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/org/units');
      const result = await response.json();
      
      if (result.success) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ textAlign: 'center', p: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <DatabaseIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h2" gutterBottom>
              Test Database Connection
            </Typography>
            <Typography color="text.secondary">
              Kiểm tra kết nối tới PostgreSQL
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={testConnection}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DatabaseIcon />}
            sx={{ backgroundColor: '#2e4c92' }}
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
          
          {isConnected === true && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              <AlertTitle>Success</AlertTitle>
              Database connected successfully!
            </Alert>
          )}
          
          {isConnected === false && (
            <Alert severity="error" icon={<ErrorIcon />}>
              <AlertTitle>Error</AlertTitle>
              Database connection failed
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
