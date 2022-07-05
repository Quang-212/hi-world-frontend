import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
import LoadingScreen from 'src/components/LoadingScreen';
import GuestGuard from 'src/guards/GuestGuard';
import RoleBasedGuard from 'src/guards/RoleBasedGuard';
import DashboardLayout from 'src/layouts/dashboard';
import LogoOnlyLayout from 'src/layouts/LogoOnlyLayout';
// layouts

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: (
        <RoleBasedGuard accessibleRoles={['admin']}>
          <Navigate to="/dashboard/course/course-category" replace />
        </RoleBasedGuard>
      )
    },
    {
      path: '/dashboard',
      element: (
        <RoleBasedGuard accessibleRoles={['admin']}>
          <DashboardLayout />
        </RoleBasedGuard>
      ),
      children: [
        { element: <Navigate to="/dashboard/course/course-category" replace />, index: true },
        {
          path: 'course',
          children: [
            { element: <Navigate to="/dashboard/course/course-category" replace />, index: true },
            { path: 'course-category', element: <PageCourseCategory /> },
            { path: 'course-list', element: <PageCourseList /> }
          ]
        },
        {
          path: 'lesson',
          children: [
            { element: <Navigate to="/dashboard/lesson/lesson-category" replace />, index: true },
            { path: 'lesson-category', element: <PageLessonCategory /> },
            { path: 'lesson-list', element: <PageLessonList /> }
          ]
        },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/management" replace />, index: true },
            { path: 'management', element: <PageUserManagement /> },
            { path: 'role', element: <PageUserManagement /> },
            { path: 'setting-role', element: <PageSettingRole /> }
          ]
        }
      ]
    },
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          )
        }
      ]
    },
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '*', element: <Navigate to="/404" replace />, index: true },
        { path: '404', element: <NotFound /> }
      ]
    }
  ]);
}

// Dashboard
const PageCourseCategory = Loadable(lazy(() => import('src/pages/dashboard/course/CourseCategory')));
const PageCourseList = Loadable(lazy(() => import('src/pages/dashboard/course/CourseList')));
const PageLessonCategory = Loadable(lazy(() => import('src/pages/dashboard/lesson/LessonCategory')));
const PageLessonList = Loadable(lazy(() => import('src/pages/dashboard/lesson/LessonList')));
const Login = Loadable(lazy(() => import('src/pages/auth/Login')));
const PageUserManagement = Loadable(lazy(() => import('src/pages/dashboard/user/UserManagement')));
const PageSettingRole = Loadable(lazy(() => import('src/pages/dashboard/user/SettingRole')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
