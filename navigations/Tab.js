import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'expo-linking';
import { AntDesign, Ionicons, Entypo, SimpleLineIcons } from "@expo/vector-icons";
import { MainPostStackScreen, CommunityStackScreen } from "./Stack";
import { CameraStackScreen } from "./AppTabNavigator/CameraStack/CameraStacks";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();

const TabNavigation = ({ initialUrl }) => {
  useEffect(() => {
    console.log("[Tab] Initial URL:", initialUrl);
    if (initialUrl && initialUrl !== "default") {
      Linking.openURL(initialUrl);
    }
  }, [initialUrl]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#ffffff',
          borderTopWidth: 1,
          height: hp('8%'),
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
      initialRouteName={initialUrl === "default" ? "MainPost" : undefined} // 초기 라우트 설정
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
