import PropTypes from 'prop-types';
import { Box, Button, Popover } from '@mui/material';
import React, { useState } from 'react';

PopoverConfirm.propTypes = {
  children: PropTypes.node,
  onSuccess: PropTypes.func
};

function PopoverConfirm({ children, onSuccess }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <>
      <span onClick={handleClick}>{children}</span>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Box sx={{ p: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ mr: 1 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onSuccess();
              handleClose();
            }}
          >
            Đồng ý
          </Button>
        </Box>
      </Popover>
    </>
  );
}

export default PopoverConfirm;
