import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { TableRow, TableCell, Typography, MenuItem } from '@mui/material';
import { TableMoreMenu } from 'src/components/table';
import Iconify from 'src/components/Iconify';
// components
// ----------------------------------------------------------------------

CourseCategoryRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func
};

export default function CourseCategoryRow({ row, onEditRow, onDeleteRow }) {
  const { name, slug } = row;
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
        <Typography variant="subtitle2" noWrap sx={{ textTransform: 'capitalize' }}>
          {name}
        </Typography>
      </TableCell>

      <TableCell align="left" sx={{ textTransform: 'capitalize' }}>
        {row?.parentId?.name || '---'}
      </TableCell>

      <TableCell align="left">{slug}</TableCell>

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
