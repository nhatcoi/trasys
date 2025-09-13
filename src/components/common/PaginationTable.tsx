import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
  Stack,
  Chip,
  Card,
  CardContent,
} from '@mui/material';

export interface PaginationTableColumn<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface PaginationTableProps<T = unknown> {
  // Data
  data: T[];
  pagination?: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  
  // Columns
  columns: PaginationTableColumn<T>[];
  
  // Loading states
  isLoading?: boolean;
  isFetching?: boolean;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  
  // Pagination
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Row key
  getRowKey: (row: T, index: number) => string | number;
  
  // Empty state
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  
  // Styling
  sx?: Record<string, unknown>;
  showPaginationInfo?: boolean;
  rowsPerPageOptions?: number[];
}

/**
 * Common pagination table component
 * Handles sorting, pagination, loading states, and empty states
 */
export function PaginationTable<T = unknown>({
  data,
  pagination,
  columns,
  isLoading = false,
  isFetching = false,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  getRowKey,
  emptyMessage = 'Không có dữ liệu',
  emptyIcon,
  sx,
  showPaginationInfo = true,
  rowsPerPageOptions = [5, 10, 25],
}: PaginationTableProps<T>) {
  
  const renderSortIndicator = (columnKey: string) => {
    if (sortBy !== columnKey) return null;
    return (
      <span style={{ marginLeft: 4 }}>
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const handleSortClick = (columnKey: string, column: PaginationTableColumn<T>) => {
    if (column.sortable && onSortChange) {
      onSortChange(columnKey);
    }
  };

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
        <Stack alignItems="center" spacing={2}>
          {emptyIcon}
          <Typography variant="h6" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={sx}>
      {/* Pagination Info */}
      {showPaginationInfo && pagination && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Hiển thị {((pagination.page - 1) * pagination.size) + 1}-{Math.min(pagination.page * pagination.size, pagination.total)} của {pagination.total} mục
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={`Trang ${pagination.page}/${pagination.totalPages}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                {pagination.hasNextPage && (
                  <Chip 
                    label="Có trang tiếp" 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    width={column.width}
                    sx={{
                      cursor: column.sortable ? 'pointer' : 'default',
                      '&:hover': column.sortable ? { backgroundColor: 'action.hover' } : {},
                    }}
                    onClick={() => handleSortClick(column.key, column)}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{column.label}</span>
                      {renderSortIndicator(column.key)}
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                renderEmptyState()
              ) : (
                data.map((row, index) => (
                  <TableRow key={getRowKey(row, index)} hover>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={column.align || 'left'}
                        width={column.width}
                      >
                        {column.render 
                          ? column.render((row as any)[column.key], row, index)
                          : (row as any)[column.key]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} của ${count !== -1 ? count : `nhiều hơn ${to}`}`
          }
        />
      </Card>
    </Box>
  );
}
