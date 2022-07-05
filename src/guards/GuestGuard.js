import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import Authentication from 'src/recoils/user/auth';
import { PATH_DASHBOARD } from 'src/routes/path';

// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default function GuestGuard({ children }) {
  const { isAuthenticated } = useRecoilValue(Authentication);

  if (isAuthenticated) {
    return <Navigate to={PATH_DASHBOARD.course.courseCategory} />;
  }

  return <>{children}</>;
}
