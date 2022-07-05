const { atom } = require('recoil');

const LessonListState = atom({
  key: 'lessonListState',
  default: {
    isEdit: false,
    currentLesson: {},
    lessonList: [],
    lessonCourseFilter: [],
    total: -1,
    lessonChapterFilter: [],
    isUpsertLessonOpen: false
  }
});

export default LessonListState;
