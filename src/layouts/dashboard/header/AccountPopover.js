import { useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar } from '@mui/material';
// components
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import Authentication from 'src/recoils/user/auth';
import { useSnackbar } from 'notistack';
import { logout, removeRefreshToken } from 'src/api/authentication.api';
import { useNavigate } from 'react-router';
import { PATH_AUTH } from 'src/routes/path';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    linkTo: '/'
  },
  {
    label: 'Profile',
    linkTo: '/'
  },
  {
    label: 'Settings',
    linkTo: '/'
  }
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { user } = useRecoilValue(Authentication);
  const [open, setOpen] = useState(null);
  const resetAuthState = useResetRecoilState(Authentication);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };
  const handleLogout = async () => {
    try {
      await logout();
      await removeRefreshToken(user?._id);
      resetAuthState();
      navigate(PATH_AUTH.login, { replace: true });
      enqueueSnackbar(`Hẹn gặp lại ${user?.firstName} ${user?.lastName}`, { variant: 'success' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Lỗi hệ thống khi đăng xuất', { variant: 'error' });
    }
  };
  return (
    <>
      <IconButtonAnimate
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8)
            }
          })
        }}
      >
        <Avatar src={user?.profilePhoto?.url} alt={`${user?.firstName} ${user?.lastName}`} />
      </IconButtonAnimate>
      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75
          }
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {`${user?.firstName} ${user?.lastName}`}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} to={option.linkTo} onClick={handleClose}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem sx={{ m: 1 }} onClick={handleLogout}>
          Logout
        </MenuItem>
      </MenuPopover>
    </>
  );
}
