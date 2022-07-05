import app from 'src/feathers';

export const createLesson = async (data) => {
  const response = await app.service('lesson').create(data);
  return response;
};
export const getLesson = async ({ limit, page = 0, where }) => {
  const response = await app.service('lesson').find({
    query: {
      ...where,
      $limit: limit,
      $skip: page * limit
    }
  });
  return response;
};
export const updateLesson = async ({ id, data }) => {
  const response = await app.service('lesson').patch(id, data);
  return response;
};
export const singleDeleteLesson = async (id) => {
  const response = await app.service('lesson').remove(id);
  return response;
};
