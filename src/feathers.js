import feathers from '@feathersjs/feathers';
const app = feathers();
import rest from '@feathersjs/rest-client';
import authentication, { MemoryStorage } from '@feathersjs/authentication-client';
import { HOST_API } from './config';
import axiosInstance from './utils/axios';
const restClient = rest(HOST_API);

class MyAuthenticationClient extends authentication.AuthenticationClient {
  async getAccessToken() {
    return (await JSON.parse(localStorage.getItem('recoil-persist'))?.authentication?.accessToken) || '';
  }
}

app.configure(restClient.axios(axiosInstance));
app.configure(
  authentication({
    storageKey: 'accessToken',
    storage: new MemoryStorage(),
    Authentication: MyAuthenticationClient
  })
);

export default app;
