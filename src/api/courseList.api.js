import app from 'src/feathers';

export const createCourse = async (data) => {
  const response = await app.service('course-list').create(data);
  return response;
};
export const getCourse = async ({ limit, page = 0, where }) => {
  const response = await app.service('course-list').find({
    query: {
      ...where,
      $limit: limit,
      $skip: page * limit
    }
  });
  return response;
};
export const updateCourse = async ({ id, data }) => {
  const response = await app.service('course-list').patch(id, data);
  return response;
};
export const singleDeleteCourse = async (id) => {
  const response = await app.service('course-list').remove(id);
  return response;
};
