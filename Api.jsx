import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://192.168.123.121:3000', // 서버의 기본 URL 설정
});

// 요청 인터셉터 설정
api.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken'); // 'userToken' 키로 저장된 값을 가져와 token 변수에 저장
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // token 값이 존재할 경우, 요청 헤더에 Authorization 필드를 추가
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;