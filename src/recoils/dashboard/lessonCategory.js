const { atom } = require('recoil');

const LessonCategoryState = atom({
  key: 'lessonCategoryState',
  default: {
    isEdit: false,
    currentLessonCategory: {},
    lessonCategoryList: [],
    total: -1,
    lessonCategoryCount: [],
    isUpsertLessonCategoryOpen: false
  }
});

export default LessonCategoryState;
