import app from 'src/feathers';

export const sendVerifyCode = (data) => {
  return app.service('mailer').create(data);
};
