const { atom } = require('recoil');
import persistAtom from 'src/utils/recoilPersist';

const Authentication = atom({
  key: 'authentication',
  default: {
    isAuthenticated: false,
    user: {},
    accessToken: ''
  },
  effects_UNSTABLE: [persistAtom]
});

export default Authentication;
