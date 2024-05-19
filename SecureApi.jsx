import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Axios 인스턴스 생성
const secureApi = axios.create({
    baseURL: 'http://192.168.0.27:3000/', // 서버의 기본 URL 설정. 백과 통합때 설정.
});

// 요청 인터셉터 설정
secureApi.interceptors.request.use(
    async config => {
        const token = await SecureStore.getItemAsync('userToken'); // userToken라는 키의 밸류를 token 변수에 담음.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; //token 값이 존재할 경우, 요청 헤더에 Authorization 필드를 추가
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default secureApi;
