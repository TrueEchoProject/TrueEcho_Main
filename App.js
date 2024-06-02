import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AppNavigation from './AppNavigation';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

const linking = {
  prefixes: [Linking.createURL('/'), 'trueecho://', 'https://trueecho.app'],
  config: {
    screens: {
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
  const [isReady, setIsReady] = useState(false);
  const navigationRef = useRef();
  const lastNotificationId = useRef(null);
  const [initialState, setInitialState] = useState();
  
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
        
        const storedNotification = await AsyncStorage.getItem('lastNotification');
        if (storedNotification) {
          const { type, data } = JSON.parse(storedNotification);
          handleNavigation(type, data);
          await AsyncStorage.removeItem('lastNotification');
        } else {
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;
          if (state !== undefined) {
            setInitialState(state);
          }
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
  
  const handleNotification = async (notification) => {
    const notificationId = notification.request.identifier;
    if (lastNotificationId.current === notificationId) {
      return; // Ignore duplicate notifications
    }
    lastNotificationId.current = notificationId;
    
    const data = notification.request.content.data;
    const type = data.type;
    
    console.log('Notification type:', type);
    console.log('Notification data:', data);
    
    await AsyncStorage.setItem('lastNotification', JSON.stringify({ type, data }));
    
    const waitForNavigation = setInterval(() => {
      if (navigationRef.current) {
        clearInterval(waitForNavigation);
        handleNavigation(type, data);
      }
    }, 100);
  };
  
  const handleNavigation = async (type, data) => {
    const url = createNavigationUrl(type, data);
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Can't handle url: ${url}`);
      }
    }
  };
  
  const createNavigationUrl = (type, data) => {
    switch (type) {
      case 'goFriend':
        return Linking.createURL('main/mainpost/friends');
      case 'goPost':
        return Linking.createURL(`main/mainpost/feed-alarm/${data.post_id}`);
      case 'goRanking':
        return Linking.createURL('main/community/community/result');
      case 'goUser':
        return Linking.createURL(`main/mainpost/user-alarm/${data.userId}`);
      case 'random':
        return Linking.createURL('main/camera/camera-option');
      default:
        console.log('Unknown notification type received.');
        return null;
    }
  };
  
  const saveState = (state) => {
    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  };
  
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      onStateChange={saveState}
    >
      <AppNavigation />
    </NavigationContainer>
  );
}
