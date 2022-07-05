import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Avatar, TableRow, TableCell, Typography, MenuItem } from '@mui/material';
// components
import Iconify from 'src/components/Iconify';
import { TableMoreMenu } from 'src/components/table';

// ----------------------------------------------------------------------

UserTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func
};

export default function UserTableRow({ row, onEditRow, onDeleteRow }) {
  const { firstName, lastName, email, gender, role, phone, profilePhoto } = row;

  const [openMenu, setOpenMenuActions] = useState(null);

  const handleOpenMenu = (event) => {
    setOpenMenuActions(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar alt={`${firstName} ${lastName}`} src={profilePhoto?.url || ''} sx={{ mr: 2 }} />
        <Typography variant="subtitle2" noWrap sx={{ textTransform: 'capitalize' }}>
          {`${firstName} ${lastName}`}
        </Typography>
      </TableCell>

      <TableCell align="left">{email}</TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {gender}
      </TableCell>
      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {role?.join(' - ') || ''}
      </TableCell>
      <TableCell align="left">{phone || -1}</TableCell>

      <TableCell align="right">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onDeleteRow();
                  handleCloseMenu();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon={'eva:trash-2-outline'} />
                Xóa
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:edit-fill'} />
                Chỉnh sửa
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
