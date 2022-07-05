const { atom } = require('recoil');

const CourseCategoryState = atom({
  key: 'courseCategoryState',
  default: {
    isEdit: false,
    currentCourseCategory: {},
    courseCategoryList: [],
    total: -1,
    isUpsertCourseCategoryOpen: false
  }
});

export default CourseCategoryState;
