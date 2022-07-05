const { atom } = require('recoil');

const User = atom({
  key: 'user',
  default: {
    isEdit: false,
    currentUser: {},
    total: -1,
    userList: [],
    roleList: [],
    isUpsertUserOpen: false
  }
});

export default User;
