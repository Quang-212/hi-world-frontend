const { atom } = require('recoil');

const CourseListState = atom({
  key: 'courseListState',
  default: {
    isEdit: false,
    currentCourse: {},
    courseList: [],
    total: -1,
    isUpsertCourseOpen: false
  }
});

export default CourseListState;
