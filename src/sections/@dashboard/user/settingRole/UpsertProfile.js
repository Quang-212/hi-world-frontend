import PropTypes from 'prop-types';
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DialogAnimate } from 'src/components/animate';
import { FormProvider, RHFTextField } from 'src/components/hook-form';
import { createProfileGroup, detailProfileGroup, updateProfileGroup } from 'src/api/user.api';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const UpsertProfileSchema = yup.object().shape({
  name: yup.string().required('Tên là bắt buộc')
});

UpsertProfile.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  editItem: PropTypes.string,
  onSuccess: PropTypes.func
};

function UpsertProfile({ open, onClose, editItem, onSuccess }) {
  console.log(editItem);
  const { enqueueSnackbar } = useSnackbar();
  const defaultValues = { name: '' };

  const methods = useForm({ resolver: yupResolver(UpsertProfileSchema), defaultValues });
  const { handleSubmit, reset, setValue } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (editItem) {
        const data = await detailProfileGroup({ id: editItem });
        if (data.data.status) {
          setValue('name', data.data?.data?.name);
        }
      }
    };
    fetchData();
  }, [editItem]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    if (editItem) {
      const result = await updateProfileGroup({ id: editItem, data });
      if (!result.data.status) {
        enqueueSnackbar(result.data?.message || 'Lỗi hệ thống!', { variant: 'error' });
        return;
      }
      onSuccess(result.data.data, editItem);
      enqueueSnackbar('Chỉnh sửa Profile thành công!');
      handleClose();
      return;
    }
    const result = await createProfileGroup({ data });
    if (!result.data.status) {
      enqueueSnackbar(result.data?.message || 'Lỗi hệ thống!', { variant: 'error' });
      return;
    }
    onSuccess(result.data.data);
    enqueueSnackbar('Tạo Profile thành công!');
    handleClose();
  };

  return (
    <DialogAnimate open={open} maxWidth="sm" onClose={handleClose}>
      <DialogTitle>Them moi Profile</DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <RHFTextField name="name" label="Tên" />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {editItem ? 'Sửa' : 'Thêm'}
          </Button>
        </DialogActions>
      </FormProvider>
    </DialogAnimate>
  );
}

export default UpsertProfile;
