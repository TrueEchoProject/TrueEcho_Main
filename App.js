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
  const navigationRef = useRef(); // 수정된 부분
  
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
  
  const handleNotification = notification => {
    const data = notification.request.content.data;
    const type = data.type;
    
    console.log('Notification type:', type);
    console.log('Notification data:', data);
    
    switch (type) {
      case 'friend':
        handleFriend();
        break;
      case 'message':
        handleMessageReceived(data);
        break;
      default:
        console.log('Unknown notification type received.');
    }
  };
  
  const handleFriend = () => {
    navigationRef.current?.navigate('Fri');
    console.log('Friend')
  };
  
  const handleMessageReceived = (data) => {
    Alert.alert(
      'New Message',
      `You have a new message from ${data.senderName}: ${data.message}`,
      [{ text: 'Reply', onPress: () => console.log('Reply Pressed') }]
    );
  };
  
  return (
    <NavigationContainer ref={navigationRef}>
      <TabNavigation />
    </NavigationContainer>
  );
}
