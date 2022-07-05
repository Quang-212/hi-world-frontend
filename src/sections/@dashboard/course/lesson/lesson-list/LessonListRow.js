import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Avatar, TableRow, TableCell, Typography, MenuItem } from '@mui/material';
import Iconify from 'src/components/Iconify';
import { TableMoreMenu } from 'src/components/table';
// components

// ----------------------------------------------------------------------

LessonListRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func
};

export default function LessonListRow({ row, onEditRow, onDeleteRow }) {
  const { name, thumbnail, order, chapterId } = row;
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
        <Avatar alt={name} src={thumbnail?.url} sx={{ mr: 2 }} />
        <Typography variant="subtitle2" noWrap sx={{ textTransform: 'capitalize' }}>
          {name}
        </Typography>
      </TableCell>

      <TableCell align="left">{order}</TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {chapterId?.name || ''}
      </TableCell>

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
                Sửa
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
