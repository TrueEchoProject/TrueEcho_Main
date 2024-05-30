import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Api = axios.create({
    baseURL: 'https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app', // 서버의 기본 URL 설정
});

Api.interceptors.request.use(
  async config => {
      const loginUrl = '/accounts/login';
      const registerUrl = '/accounts/register';
      const emailUrl = '/accounts/email';
      const checkcodeUrl = '/accounts/checkcode';
      const passwordUrl = '/accounts/password';
      
      if (![loginUrl, registerUrl, emailUrl, checkcodeUrl, passwordUrl].includes(config.url)) {
          const token = await SecureStore.getItemAsync('accessToken');
          if (token) {
              config.headers.Authorization = `Bearer ${token}`;
          } else {
              console.warn('No access token available');
          }
      }
      return config;
  },
  error => {
      return Promise.reject(error);
  }
);

Api.interceptors.response.use(
  response => {
      return response;
  },
  async error => {
      const originalRequest = error.config;
      
      // 예외 처리할 엔드포인트 목록
      const loginUrl = '/accounts/login';
      const registerUrl = '/accounts/register';
      const emailUrl = '/accounts/email';
      const checkcodeUrl = '/accounts/checkcode';
      const passwordUrl = '/accounts/password';
      
      if ([loginUrl, registerUrl, emailUrl, checkcodeUrl, passwordUrl].includes(originalRequest.url)) {
          return Promise.reject(error);
      }
      
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = await SecureStore.getItemAsync('refreshToken');
          if (refreshToken) {
              try {
                  const response = await axios.get('https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app/auth/refresh', {
                      headers: {
                          Authorization: `Bearer ${refreshToken}`
                      }
                  });
                  
                  if (response.data.status === 202 && response.data.code === "T002") {
                      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                      
                      await SecureStore.setItemAsync('accessToken', accessToken);
                      await SecureStore.setItemAsync('refreshToken', newRefreshToken);
                      
                      Api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                      
                      return Api(originalRequest);
                  } else {
                      console.error('Failed to refresh token', response.data.message);
                      return Promise.reject(response);
                  }
              } catch (err) {
                  console.error('Failed to refresh token', err);
                  return Promise.reject(err);
              }
          } else {
              console.warn('No refresh token available');
              return Promise.reject(error);
          }
      }
      return Promise.reject(error);
  }
);

export default Api;