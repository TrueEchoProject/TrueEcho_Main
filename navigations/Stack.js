import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Image } from 'react-native';
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { MainPostTabScreen } from "./AppTabNavigator/PostTab/MainPostTab";
import { CommunityTabScreen } from "./AppTabNavigator/CommunityTabs/CommunityTab";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import {
  Friends as FriendsComponent,
  MyPage as MyPageComponent,
  MyOptions as MyOptionsComponent,
  Calendar as CalendarComponent,
  MyInfo as MyInfoComponent,
  Alarm as AlarmComponent,
  FeedAlarm as FeedAlarmComponent,
  UserAlarm as UserAlarmComponent,
  IsAlarm as IsAlarmComponent,
  MyFeed as MyFeedComponent
} from "./AppTabNavigator/ButtonStack";

const MainPostStack = createStackNavigator();
const CommunityStack = createStackNavigator();

const CustomHeaderLeft = ({ navigation, title }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <AntDesign
      name="left"
      size={32}
      color="white"
      onPress={() => navigation.goBack()}
      style={{ marginHorizontal: 10 }}
    />
    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
  </View>
);

const LogoImage = () => (
  <Image source={require('../assets/logoFont.png')} style={{ width: wp('35%'), height: hp('5%'), marginLeft: 10 }} />
);

const getHeaderLeft = (navigation, route) => {
  const title = route.name === 'FeedTab' ? '피드 탭' :
    route.name === 'MyP' ? '마이 페이지' :
    route.name === 'Fri' ? '친구' :
    route.name === 'MyOp' ? '내 옵션' :
    route.name === 'Calendar' ? '캘린더' :
    route.name === 'MyInfo' ? '내 정보 수정' :
    route.name === 'Alarm' ? '알림' :
    route.name === 'FeedAlarm' ? '피드 알림' :
    route.name === 'UserAlarm' ? '유저 알림' :
    route.name === 'IsAlarm' ? '아이즈 알림' :
    route.name === 'MyFeed' ? '내 피드' : route.name;

  return route.name === 'FeedTab'
    ? <LogoImage />
    : <CustomHeaderLeft navigation={navigation} title={title} />;
};

const MainPostStackScreen = () => {
  return (
    <MainPostStack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerTitle: '',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#ffffff',
        headerLeft: () => getHeaderLeft(navigation, route),
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons
              name="emoji-people"
              size={24}
              color="white"
              style={{ marginHorizontal: 10 }}
              onPress={() => navigation.navigate('Fri', { title: '친구' })}
            />
            <MaterialIcons
              name="assignment-ind"
              size={24}
              color="white"
              style={{ marginHorizontal: 10 }}
              onPress={() => navigation.navigate('MyP', { title: '마이 페이지' })}
            />
          </View>
        ),
      })}
    >
      <MainPostStack.Screen
        name="FeedTab"
        component={MainPostTabScreen}
        options={{ title: '피드 탭' }}
      />
      <MainPostStack.Screen name="MyP" component={MyPageComponent} options={{ title: '마이 페이지' }} />
      <MainPostStack.Screen name="Fri" component={FriendsComponent} options={{ title: '친구' }} />
      <MainPostStack.Screen name="MyOp" component={MyOptionsComponent} options={{ title: '내 옵션' }} />
      <MainPostStack.Screen name="Calendar" component={CalendarComponent} options={{ title: '캘린더' }} />
      <MainPostStack.Screen name="MyInfo" component={MyInfoComponent} options={{ title: '내 정보 수정' }} />
      <MainPostStack.Screen name="Alarm" component={AlarmComponent} options={{ title: '알림' }} />
      <MainPostStack.Screen name="FeedAlarm" component={FeedAlarmComponent} options={{ title: '피드 알림' }} />
      <MainPostStack.Screen name="UserAlarm" component={UserAlarmComponent} options={{ title: '유저 알림' }} />
      <MainPostStack.Screen name="IsAlarm" component={IsAlarmComponent} options={{ title: '아이즈 알림' }} />
      <MainPostStack.Screen name="MyFeed" component={MyFeedComponent} options={{ title: '내 피드' }} />
    </MainPostStack.Navigator>
  );
};

const CommunityStackScreen = () => {
  return (
    <CommunityStack.Navigator
      screenOptions={({ navigation, route }) => ({
        headerTitle: '',
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerTintColor: '#ffffff',
        headerLeft: () => {
          const title = route.name === 'Community' ? '커뮤니티' : route.name;
          return route.name === 'Community'
            ? <LogoImage />
            : <CustomHeaderLeft navigation={navigation} title={title} />;
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons
              name="emoji-people"
              size={24}
              color="white"
              style={{ marginHorizontal: 10 }}
              onPress={() => navigation.navigate('Fri', { title: '친구' })}
            />
            <MaterialIcons
              name="assignment-ind"
              size={24}
              color="white"
              style={{ marginHorizontal: 10 }}
              onPress={() => navigation.navigate('MyP', { title: '마이 페이지' })}
            />
          </View>
        ),
      })}
    >
      <CommunityStack.Screen
        name="Community"
        component={CommunityTabScreen}
        options={{ title: '커뮤니티' }}
      />
    </CommunityStack.Navigator>
  );
};

export { MainPostStackScreen, CommunityStackScreen };
