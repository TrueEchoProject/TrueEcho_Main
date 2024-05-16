import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Alert } from 'react-native';
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

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    const subscription = Notifications.addNotificationReceivedListener(handleNotification);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
    });
    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);
  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      Alert.alert('Must use physical device for Push Notifications');
      return;
    }
    
    // 사용자가 알림을 허용하는지 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // 알림 권한이 없다면, 권한을 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // 권한이 여전히 없다면, 함수 종료
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('No projectId configured');
      }
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;
      console.log("Push token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching Expo push token:", error);
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
      "Order Update",
      `Your order ${data.orderId} has been updated to status: ${data.status}`,
      [{ text: "View", onPress: () => console.log("View Order Pressed") }]
    );
  };
  const handleMessageReceived = (data) => {
    Alert.alert(
      "New Message",
      `You have a new message from ${data.senderName}: ${data.message}`,
      [{ text: "Reply", onPress: () => console.log("Reply Pressed") }]
    );
  };
  const handlePromotion = (data) => {
    Alert.alert(
      "New Promotion",
      `Check out our new promotion: ${data.description}`,
      [{ text: "Explore", onPress: () => console.log("Explore Promotion Pressed") }]
    );
  };
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Your Expo Push Token: {expoPushToken}</Text>
      <Button
        title="메세지"
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "메시지가 왔어요",
              body: '새로운 메시지의 내용',
              data: {  // 알림에 추가 데이터 포함
                senderName: "박신형",
                type: "message",
                message: "Hello, World!"
              }
            },
            trigger: { seconds: 2 },
          });
        }}
      />
      <Button
        title="메세지"
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "메시지가 왔어요",
              body: '새로운 메시지의 내용',
              data: {  // 알림에 추가 데이터 포함
                senderName: "박신형",
                type: "message",
                message: "Hello, World!"
              }
            },
            trigger: { seconds: 2 },
          });
        }}
      />
      <Button
        title="메세지"
        onPress={async () => {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "메시지가 왔어요",
              body: '새로운 메시지의 내용',
              data: {  // 알림에 추가 데이터 포함
                senderName: "박신형",
                type: "message",
                message: "Hello, World!"
              }
            },
            trigger: { seconds: 2 },
          });
        }}
      />
    </View>
  );
}
