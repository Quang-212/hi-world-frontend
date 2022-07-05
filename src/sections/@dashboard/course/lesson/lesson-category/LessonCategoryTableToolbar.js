import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField, Autocomplete, Typography } from '@mui/material';
// components
import Iconify from 'src/components/Iconify';
import LessonCategoryState from 'src/recoils/dashboard/lessonCategory';
import { useRecoilValue } from 'recoil';

// ----------------------------------------------------------------------

LessonCategoryTableToolbar.propTypes = {
  filterName: PropTypes.string,
  filterCourse: PropTypes.string,
  onFilterName: PropTypes.func,
  onFilterCourse: PropTypes.func
};

export default function LessonCategoryTableToolbar({ filterName, filterCourse, onFilterName, onFilterCourse }) {
  const lessonCategoryState = useRecoilValue(LessonCategoryState);
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3 }}>
      <Autocomplete
        sx={{ width: '500px' }}
        value={filterCourse}
        freeSolo
        onChange={(event, value) => {
          onFilterCourse(value?._id);
        }}
        options={lessonCategoryState?.lessonCategoryCount}
        renderOption={(props, option) => (
          <Typography component="li" value={option._id} {...props}>
            {option.title}
          </Typography>
        )}
        getOptionLabel={(option) => option.title}
        renderInput={(params) => <TextField label="Chọn khóa học" {...params} />}
      />
      <TextField
        fullWidth
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="Tìm kiếm chương học..."
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
