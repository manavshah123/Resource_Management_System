import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Badge,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

function SearchFilter({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  quickFilters = [],
  activeQuickFilter,
  onQuickFilterChange,
}) {
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const activeFiltersCount = Object.values(filterValues).filter(
    (v) => v !== '' && v !== null && v !== undefined && (!Array.isArray(v) || v.length > 0)
  ).length;

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterValueChange = (filterId, value) => {
    onFilterChange?.({ ...filterValues, [filterId]: value });
  };

  const handleClearFilter = (filterId) => {
    const filter = filters.find((f) => f.id === filterId);
    const defaultValue = filter?.multiple ? [] : '';
    handleFilterValueChange(filterId, defaultValue);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search and Filter Row */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Input */}
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          sx={{ minWidth: 280, flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange?.('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Quick Filters */}
        {quickFilters.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={filter.label}
                variant={activeQuickFilter === filter.id ? 'filled' : 'outlined'}
                color={activeQuickFilter === filter.id ? 'primary' : 'default'}
                onClick={() => onQuickFilterChange?.(filter.id)}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Box>
        )}

        {/* Filter Button */}
        {filters.length > 0 && (
          <Tooltip title="Filters">
            <Badge badgeContent={activeFiltersCount} color="primary">
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFilterClick}
                sx={{ height: 40 }}
              >
                Filters
              </Button>
            </Badge>
          </Tooltip>
        )}

        {/* Clear All Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="text"
            color="error"
            size="small"
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 300,
            maxWidth: 400,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filters.map((filter) => (
            <FormControl key={filter.id} size="small" fullWidth>
              <InputLabel>{filter.label}</InputLabel>
              <Select
                value={filterValues[filter.id] || (filter.multiple ? [] : '')}
                label={filter.label}
                multiple={filter.multiple}
                onChange={(e) => handleFilterValueChange(filter.id, e.target.value)}
                renderValue={
                  filter.multiple
                    ? (selected) =>
                        selected.length > 0
                          ? selected
                              .map((val) =>
                                filter.options.find((o) => o.value === val)?.label || val
                              )
                              .join(', ')
                          : ''
                    : undefined
                }
              >
                {!filter.multiple && (
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                )}
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Box>
      </Menu>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          {Object.entries(filterValues).map(([filterId, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            const filter = filters.find((f) => f.id === filterId);
            if (!filter) return null;

            const displayValue = Array.isArray(value)
              ? value
                  .map((v) => filter.options.find((o) => o.value === v)?.label || v)
                  .join(', ')
              : filter.options.find((o) => o.value === value)?.label || value;

            return (
              <Chip
                key={filterId}
                label={`${filter.label}: ${displayValue}`}
                size="small"
                onDelete={() => handleClearFilter(filterId)}
                deleteIcon={<CloseIcon fontSize="small" />}
                sx={{ bgcolor: 'action.selected' }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default SearchFilter;

