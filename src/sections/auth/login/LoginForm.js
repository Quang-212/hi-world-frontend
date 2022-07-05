import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from 'src/components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from 'src/components/hook-form';
import { PATH_AUTH } from 'src/routes/path';
import { login, refreshToken } from 'src/api/authentication.api';
import { useSnackbar } from 'notistack';
import { useSetRecoilState } from 'recoil';
import Authentication from 'src/recoils/user/auth';
// ----------------------------------------------------------------------

export default function LoginForm() {
  const setAuthState = useSetRecoilState(Authentication);
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required')
  });

  const defaultValues = {
    email: 'quang.nv212@gmail.com',
    password: 'nguyenquang123'
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      if (!user?.user?.role.includes('admin')) {
        return enqueueSnackbar('Hành động bị từ chối vì bạn không phải ADMIN!', { variant: 'error' });
      }
      await refreshToken({ data: { _id: user?.user?._id, role: user?.user?.role }, login: true });
      setAuthState((prev) => ({ ...prev, isAuthenticated: true, user: user?.user, accessToken: user?.accessToken }));
    } catch (error) {
      if (error?.code === 401) {
        enqueueSnackbar('Tài khoản hoặc mật khẩu không đúng!', { variant: 'error' });
      } else {
        enqueueSnackbar(error?.message || 'Lỗi hệ thống', { variant: 'error' });
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email address" />

        <RHFTextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Stack>
      <LoadingButton sx={{ mt: 5 }} fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Login
      </LoadingButton>
    </FormProvider>
  );
}
