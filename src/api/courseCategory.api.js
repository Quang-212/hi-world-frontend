import app from 'src/feathers';

export const createCourseCategory = async (data) => {
  const response = await app.service('course-category').create(data);
  return response;
};
export const getCourseCategoryList = ({ limit, page = 0, where }) => {
  return app.service('course-category').find({
    query: {
      ...where,
      $limit: limit,
      $skip: page * limit
    }
  });
};
export const updateCourseCategory = async ({ id, data }) => {
  const response = await app.service('course-category').patch(id, data);
  return response;
};
export const singleDeleteCourseCategory = async (id) => {
  const response = await app.service('course-category').remove(id);
  return response;
};
