import PropTypes from 'prop-types';
import {
  Autocomplete,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { DialogAnimate } from 'src/components/animate';
import { FormProvider, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useState, useEffect } from 'react';
import { findProvinces } from 'src/api/province.api';
import { createCompany, findCompany, patchCompany } from 'src/api/company.api';
import { createStaff } from 'src/api/staff.api';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

UpsertStaff.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  editData: PropTypes.object,
  onSuccess: PropTypes.func
};

const schema = yup.object({
  name: yup.string().required('Tên công ty là bắt buộc!'),
  companyId: yup.object().required('Tỉnh là bắt buộc!')
});

export default function UpsertStaff({ open, editData, onClose, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();

  const [listCompany, setListCompany] = useState([]);
  useEffect(() => {
    const fetchCompany = async () => {
      await findCompany({ query: { $limit: -1 } })
        .then((res) => setListCompany(res))
        .catch();
    };
    fetchCompany();
  }, []);

  const defaultValues = useMemo(
    () => ({
      name: editData?.name || '',
      companyId: editData?.companyId[0]?._id || '',
      phone: editData?.phone || ''
    }),
    [editData]
  );

  const methods = useForm({ defaultValues, resolver: yupResolver(schema) });
  const { handleSubmit, control } = methods;

  const onSubmit = async (data) => {
    data.companyId = data.companyId._id;
    if (editData) {
      patchCompany({ id: editData?._id, data }).then((res) => {
        enqueueSnackbar('Chỉnh sửa nhân viên thành công!', { variant: 'success' });
        onSuccess(res, editData?._id);
        onClose();
      });
      return;
    }
    createStaff(data).then((res) => {
      enqueueSnackbar('Tạo mới nhân viên thành công!', { variant: 'success' });
      onSuccess(res);
      onClose();
    });
  };

  return (
    <DialogAnimate open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Thêm mới nhân viên công ty</DialogTitle>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <RHFTextField name="name" label="Tên nhân viên" />

            <Controller
              name="companyId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  freeSolo
                  onChange={(event, newValue) => field.onChange(newValue)}
                  options={listCompany}
                  getOptionLabel={(option) => option?.name || ''}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip {...getTagProps({ index })} key={option} size="small" label={option} />
                    ))
                  }
                  renderInput={(params) => <TextField label="Thuộc công ty" {...params} />}
                />
              )}
            />
            <RHFTextField name="phone" type="phone" label="Số điện thoại" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" color="primary">
            {editData ? 'Sửa' : 'Thêm'}
          </Button>
        </DialogActions>
      </FormProvider>
    </DialogAnimate>
  );
}
