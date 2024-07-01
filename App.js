import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';
import Api from './Api'; // API 파일 경로에 맞게 수정
import AppNavigation from './AppNavigation'; // AppNavigation 파일 경로에 맞게 수정

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

const linking = {
	prefixes: [Linking.createURL('/'), 'trueecho://', 'https://trueecho.app'],
	config: {
		screens: {
			LoginCheck: 'logincheck',
			Login: 'login',
			SignUp: 'signup',
			ForgotPassword: 'forgot-password',
			TabNavigation: {
				path: 'main',
				screens: {
					MainPost: {
						path: 'mainpost',
						screens: {
							FeedTab: {
								path: 'feed-tab',
								screens: {
									FriendFeed: 'friend-feed',
									OtherFeed: 'other-feed',
								},
							},
							MyP: 'mypage',
							Fri: 'friends',
							MyOp: 'options',
							Calendar: 'calendar',
							MyInfo: 'myinfo',
							Alarm: 'alarm',
							FeedAlarm: 'feed-alarm/:post_id?',
							UserAlarm: 'user-alarm/:userId?',
							IsAlarm: 'is-alarm',
							MyFeed: 'myfeed',
						},
					},
					Camera: {
						path: 'camera',
						screens: {
							CameraOption: 'camera-option',
							SendPosts: 'send-posts',
							FeedPostPage: 'feed-post-page',
						},
					},
					CommunityTab: {
						path: 'community',
						screens: {
							Community: {
								path: 'community',
								screens: {
									Vote: 'vote',
									Result: 'result',
								},
							},
							Fri: 'friends',
							MyP: 'mypage',
						},
					},
				},
			},
		},
	},
};

const App = () => {
	const [expoPushToken, setExpoPushToken] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [initialRoute, setInitialRoute] = useState(null); // 초기 라우트 상태 추가
	const scaleValue = useRef(new Animated.Value(1)).current;
	const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const initialize = async () => {
        const token = await getPushToken();
        const loginSuccess = await prepare(token);
        if (!loginSuccess) {
            setInitialRoute('Login'); // prepare가 실패한 경우 Login으로 설정
        }
        await checkLastNotification();
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
            console.log('Initial URL:', initialUrl);
            handleInitialUrl(initialUrl);
        }
    };
    initialize();
}, []);

	const checkLastNotification = async () => {
		const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
		if (lastNotificationResponse) {
			console.log('Last notification response:', lastNotificationResponse);
			handleNotification(lastNotificationResponse.notification);
		}
	};

	useEffect(() => {
		const subscription = Notifications.addNotificationReceivedListener(notification => {
			console.log('Notification received:', notification);
		});

		const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
			console.log('Notification clicked:', response);
			handleNotification(response.notification);
		});

		return () => {
			subscription.remove();
			responseSubscription.remove();
		};
	}, []);

  const handleAppStateChange = (nextAppState) => {
    console.log('App state changed to:', nextAppState);
  };

  const handleInitialUrl = async (url) => {
    const token = await getPushToken();
    const loginSuccess = await prepare(token);
    if (loginSuccess) {
        setInitialRoute('TabNavigation'); // 자동 로그인 후 TabNavigation으로 설정
        Linking.openURL(url);
    } else {
        setInitialRoute('Login'); // 로그인 실패 시 Login으로 설정
    }
};

	const handleNotification = async (notification) => {
    console.log('Notification received:', notification);
    const data = notification.request.content.data;
    const type = data.notiType;
  
    if (!type || !data) {
      console.error('Notification data is missing');
      return;
    }
  
    const url = createNavigationUrl(type, data);
    if (url) {
      if (AppState.currentState === 'active') {
        console.log("푸쉬 알림을 통한 접속 - 포그라운드 상태");
        Linking.openURL(url);
      } else {
        console.log("푸쉬 알림을 통한 접속 - 백그라운드 또는 종료 상태");
        const token = await getPushToken();
        const loginSuccess = await prepare(token);
        if (loginSuccess) {
          setInitialRoute('TabNavigation'); // 자동 로그인 후 TabNavigation으로 설정
          Linking.openURL(url);
        } else {
          setInitialRoute('Login'); // 로그인 실패 시 Login으로 설정
        }
      }
    }
  };

	const createNavigationUrl = (type, data) => {
		switch (type) {
			case "0":
				return Linking.createURL('main/camera/camera-option');
			case "1":
				return Linking.createURL('main/community/community/result');
			case "2":
				return Linking.createURL('main/community/community/result');
			case "3":
				return Linking.createURL(`main/mainpost/user-alarm`, { queryParams: { userId: data.contentId } });
			case "4":
				return Linking.createURL(`main/mainpost/feed-alarm`, { queryParams: { postId: data.contentId } });
			case "5":
				return Linking.createURL(`main/mainpost/feed-alarm`, { queryParams: { postId: data.contentId } });
			case "6":
				return Linking.createURL(`main/mainpost/feed-alarm`, { queryParams: { postId: data.contentId } });
			case "7":
				return Linking.createURL('main/mainpost/friends');
			default:
				console.log('Unknown notification type received.');
				return null;
		}
	};

	const getPushToken = async () => {
		const token = await registerForPushNotificationsAsync();
		if (token) {
			setExpoPushToken(token);
			console.log('Expo push token:', token);
			return token;
		} else {
			console.log('Failed to get expo push token');
			return null;
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
        const loginSuccess = await submitLoginData(storedEmail, storedPassword, token);
        if (loginSuccess) {
          setInitialRoute('TabNavigation'); // 로그인 성공 시 TabNavigation으로 설정
        } else {
          setInitialRoute('Login'); // 로그인 실패 시 Login으로 설정
        }
        return loginSuccess;
      } else {
        console.log("Stored credentials not found, redirecting to login...");
        setIsLoggedIn(false);
        setInitialRoute('Login'); // 자격 증명이 없을 경우 Login으로 설정
        return false;
      }
    } catch (e) {
      console.warn(e);
      setIsLoggedIn(false);
      setInitialRoute('Login'); // 오류 발생 시 Login으로 설정
      return false;
    } finally {
      setIsLoading(false); // 로딩 상태를 finally 블록에서 업데이트
      console.log("일반 로그인으로 접속");
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
  
        setIsLoggedIn(true);
        return true;
      } else if (response.data.status === 401 && response.data.code === 'T001') {
        console.log("로그인 실패: 사용자 인증에 실패했습니다.");
        setIsLoggedIn(false);
        return false;
      } else {
        console.log("로그인 실패: 서버로부터 성공 메시지를 받지 못했습니다.");
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      if (error.response && error.response.status === 401 && error.response.data.code === 'T001') {
        console.log("로그인 실패: 사용자 인증에 실패했습니다.");
        setIsLoggedIn(false);
        return false;
      } else {
        console.error('네트워크 오류:', error);
        setIsLoggedIn(false);
        return false;
      }
    } finally {
      setIsLoading(false); // 로딩 상태를 finally 블록에서 업데이트
    }
  };

	useEffect(() => {
		Animated.loop(
			Animated.parallel([
				Animated.sequence([
					Animated.timing(scaleValue, {
						toValue: 1.2,
						duration: 800,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: true,
					}),
					Animated.timing(scaleValue, {
						toValue: 1,
						duration: 800,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: true,
					})
				]),
				Animated.sequence([
					Animated.timing(opacityValue, {
						toValue: 0.3,
						duration: 800,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: true,
					}),
					Animated.timing(opacityValue, {
						toValue: 1,
						duration: 800,
						easing: Easing.inOut(Easing.ease),
						useNativeDriver: true,
					})
				])
			])
		).start();
	}, [scaleValue, opacityValue]);

	if (isLoading || initialRoute === null) {
		return (
			<View style={styles.container}>
				<Animated.Image
					style={[
						styles.logo,
						{ transform: [{ scale: scaleValue }], opacity: opacityValue }
					]}
					source={require('./assets/logo.png')}
					resizeMode="contain"
				/>
			</View>
		);
	}

	return (
		<NavigationContainer linking={linking}>
			<AppNavigation initialRouteName={initialRoute} />
		</NavigationContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'black',
	},
	logo: {
		width: 280,
		height: 280,
		marginBottom: 20,
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

export default App;
