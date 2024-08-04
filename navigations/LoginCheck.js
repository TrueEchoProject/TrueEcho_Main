import React, { useEffect, useRef, useState } from 'react';
import {View, StyleSheet, Animated, Easing, Platform, Image} from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import Api from '../Api';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions, useNavigation} from '@react-navigation/native';
import LottieView from "lottie-react-native";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

const LoginCheck = () => {
	const [expoPushToken, setExpoPushToken] = useState(null);
	const navigation = useNavigation();
	
	useEffect(() => {
		const initialize = async () => {
			await getPushToken();
		};
		initialize();
	}, []);
	
	const getPushToken = async () => {
		const token = await registerForPushNotificationsAsync();
		if (token) {
			setExpoPushToken(token);
			console.log('Expo push token:', token);
			await prepare(token); // 토큰을 얻은 후 prepare 함수 호출
		} else {
			console.log('Failed to get expo push token');
		}
	};
	const registerForPushNotificationsAsync = async () => {
		if (Platform.OS === 'android') {
			await Notifications.setNotificationChannelAsync('default', {
				name: 'default',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: '#FF231F7C',
			});
			console.log('Notification channel set for Android');
		}
		
		const { status: existingStatus } = await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		console.log('Existing notification permission status:', existingStatus);
		if (existingStatus !== 'granted') {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
			console.log('Requested notification permission status:', status);
		}
		if (finalStatus !== 'granted') {
			alert('Failed to get push token for push notification!');
			console.log('Notification permission not granted');
			return null;
		}
		
		try {
			const projectId = Constants.expoConfig?.extra?.eas?.projectId;
			console.log('Project ID:', projectId);
			if (!projectId) {
				throw new Error('No projectId configured');
			}
			const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
			console.log('Push token:', token);
			return token;
		} catch (error) {
			console.error('Error fetching Expo push token', error);
			return null;
		}
	};
	const prepare = async (token) => {
		console.log("Prepare function called");
		try {
			const storedEmail = await SecureStore.getItemAsync('userEmail');
			const storedPassword = await SecureStore.getItemAsync('userPassword');
			if (storedEmail && storedPassword) {
				await submitLoginData(storedEmail, storedPassword, token);
			} else {
				console.log("Stored credentials not found, redirecting to login...");
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: 'Login' }],
					})
				);
			}
		} catch (e) {
			console.warn(e);
		} finally {
			console.log("Hiding splash screen");
		}
	};
	const submitLoginData = async (email, password, token) => {
		try {
			const response = await Api.post('/accounts/login', { email, password });
			console.log("백엔드로 전송", response.data);
			
			if (response.data && response.data.status === 200) {
				const { accessToken, refreshToken } = response.data.data;
				
				await SecureStore.setItemAsync('userEmail', email);
				await SecureStore.setItemAsync('userPassword', password);
				await SecureStore.setItemAsync('accessToken', accessToken);
				await SecureStore.setItemAsync('refreshToken', refreshToken);
				console.log("로그인 정보와 토큰이 성공적으로 저장되었습니다.");
				
				const formData = new FormData();
				formData.append('token', token);
				console.log('FCM token being sent:', token);
				await Api.post(`/fcm/save`, formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
				
				navigation.reset({
					index: 0,
					routes: [{ name: 'TabNavigation' }],
				});
			} else if (response.data.status === 401 && response.data.code === 'T001') {
				console.log("로그인 실패: 사용자 인증에 실패했습니다.");
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: 'Login' }],
					})
				);
			} else {
				console.log("로그인 실패: 서버로부터 성공 메시지를 받지 못했습니다.");
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: 'Login' }],
					})
				);
			}
		} catch (error) {
			if (error.response && error.response.status === 401 && error.response.data.code === 'T001') {
				console.log("로그인 실패: 사용자 인증에 실패했습니다.");
				navigation.dispatch(
					CommonActions.reset({
						index: 0,
						routes: [{ name: 'Login' }],
					})
				);
			} else {
				console.error('네트워크 오류:', error);
			}
		}
	};
	
	return (
		<View style={styles.container}>
			<Image
				style={styles.logo}
				source={require('../assets/logo.png')}
				resizeMode="contain"
			/>
			<LottieView
				source={require('../assets/loading.json')} // 올바른 경로를 사용하세요
				autoPlay
				loop
				style={styles.lottie}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#FFF',
	},
	logo: {
		width: 300,
		height: 300,
		marginBottom: 20,
	},
	lottie: {
		width: 200,
		height: 200,
	},
	text: {
		fontSize: 36,
		fontWeight: '600',
		color: '#000',
		textAlign: 'center',
		fontFamily: 'sans-serif-medium',
		textShadowColor: 'rgba(0, 0, 0, 0.6)',
		textShadowOffset: { width: 3, height: 3 },
		textShadowRadius: 5,
	},
});

export default LoginCheck;
