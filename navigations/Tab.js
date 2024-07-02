import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking'; // 필요한 라이브러리 import
import { AntDesign, Ionicons, Entypo, SimpleLineIcons } from "@expo/vector-icons"; // 필요한 아이콘 패키지 import
import { MainPostStackScreen, CommunityStackScreen } from "./Stack";
import { CameraStackScreen } from "./AppTabNavigator/CameraStack/CameraStacks";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'; // 라이브러리 import

const Tab = createBottomTabNavigator();

const TabNavigation = ({ initialUrl }) => {
  useEffect(() => {
    if (initialUrl) {
      Linking.openURL(initialUrl);
    }
  }, [initialUrl]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000000', // 네비게이터 배경색을 검정색으로 설정
          borderTopColor: '#ffffff', // 네비게이터 탑 보더 색상을 흰색으로 설정
          borderTopWidth: 1,
          height: hp('8%'), // 높이를 디바이스 높이의 10%로 설정
          paddingBottom: hp('2%'),
          paddingTop: hp('2%'),
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'MainPost') {
            return focused ? <Entypo name="home" size={24} color="#ffffff" /> : <SimpleLineIcons name="home" size={21} color="#ffffff" />;
          } else if (route.name === 'Camera') {
            return focused ? <AntDesign name="camera" size={24} color="#ffffff" /> : <AntDesign name="camerao" size={24} color="#ffffff" />;
          } else if (route.name === 'CommunityTab') {
            return focused ? <Ionicons name="people" size={24} color="#ffffff" /> : <Ionicons name="people-outline" size={24} color="#ffffff" />;
          }
        },
      })}
    >
      <Tab.Screen
        name="MainPost"
        component={MainPostStackScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraStackScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityStackScreen}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
