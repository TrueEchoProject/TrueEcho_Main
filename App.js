import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {CommonActions, NavigationContainer} from '@react-navigation/native';
import AppNavigation from './AppNavigation';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

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

export default function App() {
  
  useEffect(() => {
    async function prepare() {
      try {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });
        
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification clicked:', response);
          handleNotification(response.notification);
        });
        
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
      }
    }
    prepare();
  }, []);
  
  const handleNotification = async (notification) => {
    console.log('Notification received:', notification);
    const data = notification.request.content.data;
    const type = data.notiType;
    
    if (!type || !data) {
      console.error('Notification data is missing');
      return;
    }
    
    const url = createNavigationUrl(type, data);
    Linking.createURL(`main/mainpost`);
    Linking.openURL(`main/mainpost`);
    if (url) {
      await Linking.openURL(url);
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
  
  return (
    <NavigationContainer linking={linking}>
      <AppNavigation />
    </NavigationContainer>
  );
}
