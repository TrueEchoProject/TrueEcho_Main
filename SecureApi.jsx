import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Axios 인스턴스 생성
const secureApi = axios.create({
  baseURL: 'https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app', // 서버의 기본 URL 설정
});

// 요청 인터셉터 설정
secureApi.interceptors.request.use(
  async config => {
    const token = await SecureStore.getItemAsync('accessToken'); // accessToken라는 키의 밸류를 token 변수에 담음
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // token 값이 존재할 경우, 요청 헤더에 Authorization 필드를 추가
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
secureApi.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync('refreshToken'); // refreshToken 가져오기
      if (refreshToken) {
        try {
          // 리프레쉬 토큰을 헤더에 넣어서 새로운 액세스 토큰 요청
          const response = await axios.get('https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app/auth/refresh', {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          });
          const newToken = response.data.accessToken;
          await SecureStore.setItemAsync('accessToken', newToken); // 새로운 액세스 토큰 저장
          secureApi.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Axios 인스턴스의 기본 헤더 업데이트
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`; // 원래 요청 헤더 업데이트
          return secureApi(originalRequest); // 원래 요청 재시도
        } catch (err) {
          // 리프레쉬 토큰 재발급 실패 시 로그아웃 처리 등 추가 작업
          console.error('Failed to refresh token', err);
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default secureApi;
