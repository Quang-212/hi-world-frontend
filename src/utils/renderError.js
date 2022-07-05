export const renderError = (error) => {
  if (error && error.errors) {
    const errors = Object.keys(error.errors).map((item) => {
      return error.errors[item].message;
    });
    return errors.join(' - ');
  }
  return '';
};
