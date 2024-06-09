import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigation from './AppNavigation';
import * as Linking from 'expo-linking';

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
  return (
    <NavigationContainer linking={linking}>
      <AppNavigation />
    </NavigationContainer>
  );
}