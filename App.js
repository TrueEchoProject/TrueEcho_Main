import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './navigations/Tab';
import * as SplashScreen from 'expo-splash-screen';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const navigationRef = useRef();
  
  useEffect(() => {
    async function prepare() {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });
        
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification clicked:', response);
          handleNotification(response.notification);
        });
        
        // 앱이 백그라운드에서 시작될 때 알림 데이터를 처리합니다.
        const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastNotificationResponse) {
          console.log('Last notification response:', lastNotificationResponse);
          handleNotification(lastNotificationResponse.notification);
        }
        
        return () => {
          subscription.remove();
          responseSubscription.remove();
        };
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);
  
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      Alert.alert('Must use physical device for Push Notifications');
      return;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('No projectId configured');
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Error fetching Expo push token:', error);
    }
  }
  
  const handleNotification = (notification) => {
    const data = notification.request.content.data;
    const type = data.type;
    
    console.log('Notification type:', type);
    console.log('Notification data:', data);
    
    // 네비게이션 초기화 대기 및 데이터 유효성 검사
    const waitForNavigation = setInterval(() => {
      if (navigationRef.current && data && data.postId) {
        clearInterval(waitForNavigation);
        handleNavigation(type, data);
      }
    }, 100);
  };
  
  const handleNavigation = (type, data) => {
    switch (type) {
      case 'friend':
        navigationRef.current?.navigate('Fri');
        console.log('Navigating to Fri');
        break;
      case 'goPost':
        handlePost(data);
        break;
      default:
        console.log('Unknown notification type received.');
    }
  };
  
  const handlePost = (data) => {
    if (!data || !data.postId) {
      console.log('Invalid post data:', data);
      return;
    }
    
    console.log('Handling post:', data);
    navigationRef.current?.navigate('피드 알람', { post_id: data.postId });
    console.log('Navigating to 피드 알람 with post_id:', data.postId);
  };
  
  return (
    <NavigationContainer ref={navigationRef}>
      <TabNavigation />
    </NavigationContainer>
  );
}