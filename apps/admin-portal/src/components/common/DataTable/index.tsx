import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  TextField,
  IconButton,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import { MdSearch, MdArrowUpward, MdArrowDownward, MdDownload } from 'react-icons/md';

interface Column<T> {
  id: keyof T | 'actions';
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  totalElements?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSearchChange?: (search: string) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[] | number[]) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  totalElements = data.length,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id);
      setSelected(newSelected);
      onSelectionChange?.(newSelected as any);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectOne = (id: string | number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: (string | number)[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    onSelectionChange?.(newSelected as any);
  };

  const isSelected = (id: string | number) => selected.indexOf(id) !== -1;

  const handleSort = (field: keyof T) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchChange?.(searchValue);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortOrder]);

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((col) => col.label).join(',');
    const rows = data.map((row) =>
      columns.map((col) => {
        const val = col.id === 'actions' ? '' : row[col.id as keyof T];
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} flexWrap="wrap" gap={2}>
        <TextField
          size="small"
          placeholder="Press Enter to Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: <MdSearch size={20} style={{ marginRight: 8, color: '#aaa' }} />,
          }}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />
        <IconButton onClick={handleExportCSV} title="Export CSV" color="primary">
          <MdDownload size={22} />
        </IconButton>
      </Box>

      {loading && <LinearProgress />}

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  onClick={() => col.sortable && col.id !== 'actions' && handleSort(col.id as keyof T)}
                  sx={{ cursor: col.sortable ? 'pointer' : 'default', fontWeight: 'bold' }}
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {col.label}
                    {col.sortable && sortField === col.id && (
                      sortOrder === 'asc' ? <MdArrowUpward size={14} /> : <MdArrowDownward size={14} />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No data available.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={isItemSelected}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectOne(row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={String(col.id)}>
                        {col.render
                          ? col.render(row)
                          : String(row[col.id as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {onPageChange && onRowsPerPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        />
      )}
    </Paper>
  );
}
