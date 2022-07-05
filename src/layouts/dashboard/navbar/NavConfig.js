// components
import { PATH_DASHBOARD } from 'src/routes/path';
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard')
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'General',
    items: [
      {
        title: 'Khóa học',
        path: PATH_DASHBOARD.course.root,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Danh mục khóa học', path: PATH_DASHBOARD.course.courseCategory },
          { title: 'Danh sách khóa học', path: PATH_DASHBOARD.course.courseList }
        ]
      },
      {
        title: 'Bài học',
        path: PATH_DASHBOARD.lesson.root,
        icon: ICONS.ecommerce,
        children: [
          { title: 'Danh sách chương học', path: PATH_DASHBOARD.lesson.lessonCategory },
          { title: 'Danh sách bài học', path: PATH_DASHBOARD.lesson.lessonList }
        ]
      },
      { title: 'Công Ty', path: '/dashboard/company', icon: ICONS.analytics }
    ]
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      {
        title: 'Người Dùng',
        path: PATH_DASHBOARD.user.root,
        icon: ICONS.user,
        children: [
          { title: 'Quản lý', path: PATH_DASHBOARD.user.management },
          { title: 'Phân quyền', path: PATH_DASHBOARD.user.role },
          { title: 'Cài đặt quyền', path: PATH_DASHBOARD.user.settingRole }
        ]
      }
    ]
  }
];

export default sidebarConfig;
