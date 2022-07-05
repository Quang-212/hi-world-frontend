import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField } from '@mui/material';
// components
import Iconify from 'src/components/Iconify';

// ----------------------------------------------------------------------

CourseCategoryTableToolbar.propTypes = {
  filterName: PropTypes.string,
  onFilterName: PropTypes.func
};

export default function CourseCategoryTableToolbar({ filterName, onFilterName }) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3 }}>
      <TextField
        fullWidth
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="Tìm kiếm danh mục khóa học..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon={'eva:search-fill'} sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          )
        }}
      />
    </Stack>
  );
}
