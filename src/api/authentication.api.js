import app from 'src/feathers';

export const login = (data) => {
  return app.authenticate({
    strategy: 'local',
    ...data
  });
};
export const getAuthenticationState = async () => {
  await app.authentication.reAuthenticate();
  return await app.authentication;
};
export const register = ({ data, checking }) => {
  return app.service('users').create(data, {
    query: { checking }
  });
};
export const refreshToken = ({ data, login }) => {
  return app.service('refresh-token').create(data, {
    query: { login }
  });
};
export const removeRefreshToken = (userId) => {
  return app.service('refresh-token').remove(null, {
    query: { userId, logout: true }
  });
};
export const resetPassword = ({ data, checking }) => {
  return app.service('users').patch(data, {
    query: { checking }
  });
};
export const logout = () => {
  return app.logout({
    strategy: 'jwt'
  });
};
