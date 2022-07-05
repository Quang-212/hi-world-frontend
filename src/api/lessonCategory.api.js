import app from 'src/feathers';

export const createLessonCategory = async (data) => {
  const response = await app.service('lesson-category').create(data);
  return response;
};
export const getLessonCategory = async ({ limit, page = 0, where }) => {
  const response = await app.service('lesson-category').find({
    query: {
      ...where,
      $limit: limit,
      $skip: page * limit
    }
  });
  return response;
};
export const updateLessonCategory = async ({ id, data }) => {
  const response = await app.service('lesson-category').patch(id, data);
  return response;
};
export const singleDeleteLessonCategory = async (id) => {
  const response = await app.service('lesson-category').remove(id);
  return response;
};
