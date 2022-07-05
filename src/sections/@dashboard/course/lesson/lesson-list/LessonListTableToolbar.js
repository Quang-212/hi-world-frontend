import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField, MenuItem, Typography, Autocomplete } from '@mui/material';
import Iconify from 'src/components/Iconify';
import { useRecoilValue } from 'recoil';
import LessonListState from 'src/recoils/dashboard/lessonList';

// ----------------------------------------------------------------------

LessonListTableToolbar.propTypes = {
  filterName: PropTypes.string,
  onFilterCourse: PropTypes.func,
  onFilterChapter: PropTypes.func,
  onFilterName: PropTypes.func
};

export default function LessonListTableToolbar({ filterName, onFilterCourse, onFilterChapter, onFilterName }) {
  const lessonListState = useRecoilValue(LessonListState);

  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3 }}>
      <Autocomplete
        sx={{ width: '500px' }}
        freeSolo
        onChange={(event, value) => {
          onFilterCourse(value?._id);
        }}
        options={lessonListState?.lessonCourseFilter}
        renderOption={(props, option) => (
          <Typography component="li" value={option._id} {...props}>
            {option.title}
          </Typography>
        )}
        getOptionLabel={(option) => option.title}
        renderInput={(params) => <TextField label="Chọn khóa học" {...params} />}
      />
      <Autocomplete
        sx={{ width: '500px' }}
        freeSolo
        onChange={(event, value) => {
          onFilterChapter(value?._id);
        }}
        options={lessonListState?.lessonChapterFilter}
        renderOption={(props, option) => (
          <Typography component="li" value={option._id} {...props}>
            {option.name}
          </Typography>
        )}
        getOptionLabel={(option) => option?.name || ''}
        renderInput={(params) => <TextField label="Chọn chương học" {...params} />}
      />
      <TextField
        fullWidth
        value={filterName}
        onChange={(event) => onFilterName(event.target.value)}
        placeholder="Tìm kiếm bài học..."
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
