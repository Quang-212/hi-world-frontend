import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Avatar, TableRow, TableCell, Typography, MenuItem } from '@mui/material';
import Iconify from 'src/components/Iconify';
import { TableMoreMenu } from 'src/components/table';
import { fDateTime } from 'src/utils/formatTime';
// components

// ----------------------------------------------------------------------

CourseListRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func
};

export default function CourseListRow({ row, onEditRow, onDeleteRow }) {
  const { title, thumbnail, slug, category, level } = row;
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
        <Avatar alt={title} src={thumbnail?.url} sx={{ mr: 2 }} />
        <Typography variant="subtitle2" noWrap sx={{ textTransform: 'capitalize' }}>
          {title}
        </Typography>
      </TableCell>

      <TableCell align="left">{category?.name || ''}</TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {slug}
      </TableCell>

      <TableCell align="left">{level}</TableCell>

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
                Delete
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onEditRow();
                  handleCloseMenu();
                }}
              >
                <Iconify icon={'eva:edit-fill'} />
                Edit
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>
  );
}
