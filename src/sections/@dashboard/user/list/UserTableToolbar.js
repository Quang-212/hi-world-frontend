import PropTypes from 'prop-types';
import { Stack, InputAdornment, TextField, MenuItem } from '@mui/material';
// components
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

UserTableToolbar.propTypes = {
  filterEmail: PropTypes.string,
  filterRole: PropTypes.string,
  onFilterEmail: PropTypes.func,
  onFilterRole: PropTypes.func,
  optionsRole: PropTypes.arrayOf(PropTypes.string)
};

export default function UserTableToolbar({ filterEmail, filterRole, onFilterEmail, onFilterRole, optionsRole }) {
  return (
    <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2.5, px: 3 }}>
      <TextField
        fullWidth
        select
        label="Role"
        value={filterRole}
        onChange={onFilterRole}
        SelectProps={{
          MenuProps: {
            sx: { '& .MuiPaper-root': { maxHeight: 260 } }
          }
        }}
        sx={{
          maxWidth: { sm: 240 },
          textTransform: 'capitalize'
        }}
      >
        {optionsRole.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 0.75,
              typography: 'body2',
              textTransform: 'capitalize'
            }}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        value={filterEmail}
        onChange={(event) => onFilterEmail(event.target.value)}
        placeholder="Tìm kiếm người dùng theo email..."
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
