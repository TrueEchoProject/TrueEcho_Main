import React, { useState, useEffect } from 'react';
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
  const [notification, setNotification] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        
        const subscription = Notifications.addNotificationReceivedListener(handleNotification);
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification clicked:', response);
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
    const { type, ...data } = notification.request.content.data;
    
    switch (type) {
      case 'orderUpdate':
        handleOrderUpdate(data);
        break;
      case 'message':
        handleMessageReceived(data);
        break;
      case 'promotion':
        handlePromotion(data);
        break;
      default:
        console.log('Unknown notification type received.');
    }
  };
  
  const handleOrderUpdate = (data) => {
    Alert.alert(
      'Order Update',
      `Your order ${data.orderId} has been updated to status: ${data.status}`,
      [{ text: 'View', onPress: () => console.log('View Order Pressed') }]
    );
  };
  
  const handleMessageReceived = (data) => {
    Alert.alert(
      'New Message',
      `You have a new message from ${data.senderName}: ${data.message}`,
      [{ text: 'Reply', onPress: () => console.log('Reply Pressed') }]
    );
  };
  
  const handlePromotion = (data) => {
    Alert.alert(
      'New Promotion',
      `Check out our new promotion: ${data.description}`,
      [{ text: 'Explore', onPress: () => console.log('Explore Promotion Pressed') }]
    );
  };
  
  return <TabNavigation />;
}

