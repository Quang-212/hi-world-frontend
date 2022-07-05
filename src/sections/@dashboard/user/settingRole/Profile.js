import { Button, Chip, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Iconify from 'src/components/Iconify';
import UpsertProfile from './UpsertProfile';

import { listProfileGroup, deleteProfileGroup } from 'src/api/user.api';
import { useSnackbar } from 'notistack';
import PopoverConfirm from 'src/components/PopoverConfirm';

function Profile() {
  const { enqueueSnackbar } = useSnackbar();
  const [openUpsertProfile, setOpenUpsertProfile] = useState(false);

  const handleCloseUpsertForm = () => {
    setOpenUpsertProfile(false);
    setEditProfile(null);
  };

  const [listProfile, setListProfile] = useState([]);
  useEffect(() => {
    const fetchListProfile = async () => {
      const result = await listProfileGroup({ where: {} });
      if (result.data.status) {
        setListProfile(result.data.data.edges);
      }
    };
    fetchListProfile();
  }, []);

  const [editProfile, setEditProfile] = useState(null);
  const handleClickEditProfile = async (id) => {
    setEditProfile(id);
    setOpenUpsertProfile(true);
  };

  const handleUpdateSuccess = (data, id) => {
    setListProfile((prev) => {
      if (id) {
        return prev.map((item) => (item._id === id ? data : item));
      }
      return [data, ...prev];
    });
  };

  const handleDeleteProfile = async (id) => {
    const result = await deleteProfileGroup({ id });
    if (result.data.status) {
      enqueueSnackbar('Xóa thành công!');
      setListProfile((prev) => prev.filter((item) => item._id !== id));
      return;
    }
    enqueueSnackbar(result.data?.message || 'Lỗi hệ thống!', { variant: 'error' });
  };

  return (
    <div>
      <Button
        onClick={() => setOpenUpsertProfile(true)}
        variant="contained"
        sx={{ mb: 4 }}
        startIcon={<Iconify icon="eva:plus-fill" />}
      >
        Thêm mới
      </Button>
      <Grid container sx={{ mb: 3 }}>
        <Grid item xs={2}>
          <Typography variant="h5">Tên</Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h5">Quyền</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h5">Hành Động</Typography>
        </Grid>
      </Grid>
      <Grid container>
        {listProfile.map((item) => (
          <>
            <Grid xs={2} key={item._id}>
              <Typography>{item?.name}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Chip label="primary" color="primary" />
            </Grid>
            <Grid item xs={2}>
              <Tooltip title="Sửa" placement="top">
                <IconButton color="success" onClick={() => handleClickEditProfile(item._id)}>
                  <Iconify icon="clarity:edit-solid" />
                </IconButton>
              </Tooltip>
              <PopoverConfirm
                children={
                  <Tooltip title="Xóa" placement="top">
                    <IconButton color="error">
                      <Iconify icon="fluent:delete-20-filled" />
                    </IconButton>
                  </Tooltip>
                }
                onSuccess={() => handleDeleteProfile(item._id)}
              />
            </Grid>
          </>
        ))}
      </Grid>
      <UpsertProfile
        open={openUpsertProfile}
        onClose={handleCloseUpsertForm}
        editItem={editProfile}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

export default Profile;
