// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login')
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  user: {
    root: path(ROOTS_DASHBOARD, '/user'),
    management: path(ROOTS_DASHBOARD, '/user/management'),
    role: path(ROOTS_DASHBOARD, '/user/role'),
    settingRole: path(ROOTS_DASHBOARD, '/user/setting-role'),
    company: path(ROOTS_DASHBOARD, '/company'),
    staff: path(ROOTS_DASHBOARD, '/staff')
  },
  course: {
    root: path(ROOTS_DASHBOARD, '/course'),
    courseCategory: path(ROOTS_DASHBOARD, '/course/course-category'),
    courseList: path(ROOTS_DASHBOARD, '/course/course-list')
  },
  lesson: {
    root: path(ROOTS_DASHBOARD, '/lesson'),
    lessonCategory: path(ROOTS_DASHBOARD, '/lesson/lesson-category'),
    lessonList: path(ROOTS_DASHBOARD, '/lesson/lesson-list')
  }
};
