import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { MainPostTabScreen } from './AppTabNavigator/PostTab/MainPostTab';
import { CommunityTabScreen } from './AppTabNavigator/CommunityTabs/CommunityTab';
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
  MyFeed as MyFeedComponent,
} from './AppTabNavigator/ButtonStack';

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

const LogoImage = ({ navigation }) => {
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  const toggleOptionsVisibility = () => {
    setIsOptionsVisible(!isOptionsVisible);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('../assets/logoFont.png')}
        style={styles.logoImage} // 스타일 변경
      />
      <TouchableOpacity onPress={toggleOptionsVisibility}>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color="white"
          style={styles.dropdownIcon} // 스타일 변경
        />
      </TouchableOpacity>
      {isOptionsVisible && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            onPress={() => {
              setIsOptionsVisible(false);
              navigation.navigate('MyFeed');
            }}
            style={styles.optionRow}
          >
            <Text style={styles.optionItem}>내 피드</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsOptionsVisible(false);
              navigation.navigate('Alarm');
            }}
            style={styles.optionRow}
          >
            <Text style={styles.optionItem}>알림</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getHeaderLeft = (navigation, route) => {
  const title =
    route.name === 'FeedTab'
      ? '피드 탭'
      : route.name === 'MyP'
      ? '마이 페이지'
      : route.name === 'Fri'
      ? '친구'
      : route.name === 'MyOp'
      ? '내 옵션'
      : route.name === 'Calendar'
      ? '캘린더'
      : route.name === 'MyInfo'
      ? '내 정보 수정'
      : route.name === 'Alarm'
      ? '알림'
      : route.name === 'FeedAlarm'
      ? '단일 피드'
      : route.name === 'UserAlarm'
      ? '유저 알림'
      : route.name === 'IsAlarm'
      ? '아이즈 알림'
      : route.name === 'MyFeed'
      ? '내 피드'
      : route.name;

  return route.name === 'FeedTab' ? <LogoImage navigation={navigation} /> : <CustomHeaderLeft navigation={navigation} title={title} />;
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
        headerRight: () => 
          route.name !== 'FeedAlarm' && route.name !== 'MyFeed' && (
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons
              name="emoji-people"
              size={30}
              color="white"
              style={{ marginHorizontal: 10 }}
              onPress={() => navigation.navigate('Fri', { title: '친구' })}
            />
            <MaterialIcons
              name="assignment-ind"
              size={30}
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
        headerShown: false, // 헤더를 숨깁니다.
        headerLeft: () => {
          const title = route.name === 'Community' ? '커뮤니티' : route.name;
          return route.name === 'Community' ? <LogoImage navigation={navigation} /> : <CustomHeaderLeft navigation={navigation} title={title} />;
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

const styles = StyleSheet.create({
  logoImage: {
    width: wp('35%'),
    height: hp('5%'),
    marginLeft: 10,
  },
  dropdownIcon: {
    marginTop: 25,
  },
  optionsContainer: {
    position: 'absolute',
    top: 45, // 삼각형 버튼의 위치에 맞게 조정
    right: 10, // 삼각형 버튼의 위치에 맞게 조정
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 10,
    zIndex: 1000,
  },
  optionRow: {
    paddingVertical: 3,
  },
  optionItem: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
});

export { MainPostStackScreen, CommunityStackScreen };