import PropTypes from 'prop-types';
import { Container, Alert, AlertTitle, Stack } from '@mui/material';
import { useRecoilValue } from 'recoil';
import Authentication from 'src/recoils/user/auth';

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  accessibleRoles: PropTypes.array,
  children: PropTypes.node
};

export default function RoleBasedGuard({ accessibleRoles, children }) {
  const { user } = useRecoilValue(Authentication);
  const currentRole = user?.role;
  if (!accessibleRoles.some((role) => currentRole?.includes(role))) {
    return (
      <Stack sx={{ width: '50vw', mx: 'auto', mt: 2 }}>
        <Alert severity="error">
          <AlertTitle>Permission Denied</AlertTitle>
          You do not have permission to access this page
        </Alert>
      </Stack>
    );
  }

  return <>{children}</>;
}
