import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Typography, MenuItem } from '@mui/material';
// components
import { fData } from 'src/utils/formatNumber';
import Label from 'src/components/Label';
import { FormProvider, RHFRadioGroup, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { RHFUploadAvatar } from 'src/components/hook-form/RHFUpload';
import { useRecoilState } from 'recoil';
import User from 'src/recoils/dashboard/user';
import { register } from 'src/api/authentication.api';
import { patchUser } from 'src/api/user.api';
import { isString } from 'lodash';
import { cloudinaryUpload } from 'src/api/upload.api';

// ----------------------------------------------------------------------

export default function UpsertUser() {
  const [userState, setUserState] = useRecoilState(User);
  const { isEdit, currentUser, roleList } = userState;

  const ROLE_OPTIONS = roleList?.map((role) => role?.name);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    role: Yup.string().required('Role is required'),
    gender: Yup.string().required('Gender is required'),
    password: Yup.string().required('Password is required'),
    avatarUrl: Yup.mixed()
  });

  const defaultValues = useMemo(
    () => ({
      firstName: currentUser?.firstName || 'Quang',
      lastName: currentUser?.lastName || 'Nguyen',
      email: currentUser?.email || 'quang.nv212@gmail.com',
      phone: currentUser?.phone || '0971823911',
      role: currentUser?.role?.[0] || roleList?.[roleList?.length - 1]?.name,
      gender: currentUser?.gender || 'male',
      password: '12345678_@',
      avatarUrl: currentUser?.profilePhoto?.url || ''
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          'avatarUrl',
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        );
      }
    },
    [setValue]
  );
  const onSubmit = async (data) => {
    let userList = userState?.userList;
    const formData = new FormData();
    formData.append('file', data.avatarUrl);
    try {
      if (isEdit) {
        if (isString(data?.avatarUrl)) {
          const patchedUser = await patchUser({
            id: currentUser?._id,
            data: { ...data, ...(data?.avatarUrl && { profilePhoto: currentUser?.profilePhoto }) }
          });
          if (patchedUser?.code) return enqueueSnackbar(patchedUser?.message, { variant: 'error' });
          userList = userList.map((item) => (item._id === currentUser?._id ? patchedUser : item));
        } else {
          const uploadData = await cloudinaryUpload(formData);
          const patchedUser = await patchUser({
            id: currentUser?._id,
            data: { ...data, profilePhoto: uploadData }
          });
          if (patchedUser?.code) return enqueueSnackbar(patchedUser?.message, { variant: 'error' });
          userList = userList.map((item) => (item._id === currentUser?._id ? patchedUser : item));
        }
      } else {
        let uploadData;
        const checking = await register({
          data: { ...data, ...(uploadData && { profilePhoto: uploadData }) },
          checking: true
        });
        if (checking?.code) return enqueueSnackbar(checking?.message, { variant: 'error' });
        if (data?.avatarUrl) {
          uploadData = await cloudinaryUpload(formData);
        }
        const newUser = await register({
          data: { ...data, ...(uploadData && { profilePhoto: uploadData }) },
          checking: false
        });
        if (newUser?.code) return enqueueSnackbar(newUser?.message, { variant: 'error' });
        userList = [newUser, ...userList];
      }
      setUserState((prev) => ({ ...prev, userList, isUpsertUserOpen: false }));
      enqueueSnackbar(!isEdit ? 'Tạo mới người dùng thành công!' : 'Cập nhật người dùng thành công!');
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.message || 'Lỗi hệ thống', { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 2,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }
              }}
            >
              <RHFTextField name="firstName" label="First Name" />
              <RHFTextField name="lastName" label="Last Name" />
              <RHFTextField name="email" label="Email Address" disabled={isEdit} />
              <RHFTextField name="phone" label="Phone Number" />
              <RHFSelect
                name="role"
                label="Role"
                InputLabelProps={{ shrink: true }}
                SelectProps={{ native: false }}
                sx={{ textTransform: 'capitalize' }}
              >
                {ROLE_OPTIONS?.map((option, index) => (
                  <MenuItem key={index} value={option} sx={{ textTransform: 'capitalize' }}>
                    {option}
                  </MenuItem>
                ))}
              </RHFSelect>
              <Stack direction="column" spacing={2}>
                <RHFRadioGroup
                  name="gender"
                  options={['male', 'female']}
                  sx={{
                    '& .MuiFormControlLabel-root': { mr: 4, mt: 1 },
                    textTransform: 'capitalize'
                  }}
                />
              </Stack>
            </Box>
            <Stack
              alignItems="center"
              direction="row"
              sx={{ mt: 3, justifyContent: isEdit ? 'flex-end' : 'space-between' }}
            >
              {!isEdit && (
                <Typography variant="subtitle2">
                  Mật khẩu mặc định là: <strong style={{ fontSize: '1.05rem', marginLeft: '4px' }}> 12345678_@</strong>
                </Typography>
              )}
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Tạo mới người dùng' : 'Cập nhật người dùng'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
