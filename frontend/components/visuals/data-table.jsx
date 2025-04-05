import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
  Paper, TextField, Box, Typography, Pagination
} from '@mui/material';

/**
 * DataTable - A reusable table component with sorting, filtering, and pagination
 * @param {Array} data - Array of objects to display
 * @param {Array} columns - Array of column definitions with {id, label, format}
 * @param {String} title - Table title
 * @param {Number} rowsPerPage - Number of rows per page
 */
const DataTable = ({ 
  data = [], 
  columns = [], 
  title = 'Data Table',
  rowsPerPage = 10
}) => {
  // State for sorting
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  
  // State for filtering
  const [filterValue, setFilterValue] = useState('');
  
  // State for pagination
  const [page, setPage] = useState(1);

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    // First filter the data
    let filteredData = data;
    if (filterValue) {
      const lowercasedFilter = filterValue.toLowerCase();
      filteredData = data.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(lowercasedFilter)
        );
      });
    }
    
    // Then sort the data
    if (orderBy) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[orderBy] || '';
        const bValue = b[orderBy] || '';
        
        if (order === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
        }
      });
    }
    
    return filteredData;
  }, [data, filterValue, orderBy, order]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <TextField
          label="Filter"
          variant="outlined"
          size="small"
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value);
            setPage(1); // Reset to first page when filtering
          }}
        />
      </Box>
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow hover tabIndex={-1} key={rowIndex}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedData.length} of {filteredAndSortedData.length} entries
        </Typography>
        <Pagination 
          count={totalPages} 
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary" 
        />
      </Box>
    </Paper>
  );
};

export default DataTable; 