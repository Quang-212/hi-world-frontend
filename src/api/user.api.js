import app from 'src/feathers';

export const getAllUser = ({ where, limit, page }) => {
  return app.service('users').find({
    query: {
      ...where,
      $limit: limit,
      $skip: page * limit
    }
  });
};

export const getAllRole = () => {
  return app.service('role').find();
};

export const patchUser = ({ id, data }) => {
  return app.service('users').patch(id, data);
};

export const singleDeleteUser = (id) => {
  return app.service('users').remove(id);
};
