'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import { TreeNode, TreeNodeProps } from './TreeNode';

interface HorizontalTreeViewProps {
  data: TreeNodeProps[];
  loading?: boolean;
  error?: string | null;
}

export const HorizontalTreeView: React.FC<HorizontalTreeViewProps> = ({
  data,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <Typography variant="h6" color="text.secondary">
          Đang tải dữ liệu...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        border: '1px solid #f44336'
      }}>
        <Typography variant="h6" color="error">
          Lỗi: {error}
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        p: 4
      }}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Chưa có dữ liệu tổ chức
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hãy thêm đơn vị tổ chức để hiển thị biểu đồ
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        overflow: 'auto',
        minHeight: '500px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 'fit-content',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#2e4c92', 
            fontWeight: 'bold',
            marginBottom: 2 
          }}
        >
          Biểu đồ tổ chức dạng cây ngang
        </Typography>
        
        <Stack direction="column" spacing={2} alignItems="center">
          {data.map((rootNode) => (
            <TreeNode
              key={rootNode.id}
              {...rootNode}
              level={0}
            />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default HorizontalTreeView;
