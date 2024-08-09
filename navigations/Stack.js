import React, { useEffect, useState } from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { MainPostTabScreen } from "./AppTabNavigator/PostTab/MainPostTab";
import { CommunityTabScreen } from "./AppTabNavigator/CommunityTabs/CommunityTab";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// 기존에 import한 컴포넌트들...

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
  const navigateToMyFeed = () => {
    setIsOptionsVisible(false);
    navigation.navigate('MyFeed');
  };
  const navigateToAlarm = () => {
    setIsOptionsVisible(false);
    navigation.navigate('Alarm');
  };
  
  return (
    <>
      <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onPress={toggleOptionsVisibility}>
        <Image source={require('../assets/logoFont.png')} style={{ width: wp('35%'), height: hp('5%'), marginLeft: 10 }} />
        <AntDesign style={{marginLeft:5}} name="caretdown" size={10} color="white"/>
      </TouchableOpacity>
      {isOptionsVisible && (
        <View style={{ position: 'absolute', top: 50, right: 0, backgroundColor: "grey", padding: 10, borderRadius: 10, }}>
          <TouchableOpacity style={{ alignItems:"center", marginBottom: 10 }} onPress={navigateToMyFeed}>
            <Text style={{ color: 'white'}}>내 피드</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems:"center" }} onPress={navigateToAlarm}>
            <Text style={{ color: 'white'}}>알림</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  )
};

const getHeaderLeft = (navigation, route) => {
  const title = route.name === 'FeedTab' ? '피드 탭' :
    route.name === 'MyP' ? '마이 페이지' :
    route.name === 'Fri' ? '친구' :
    route.name === 'MyOp' ? '내 옵션' :
    route.name === 'Calendar' ? '캘린더' :
    route.name === 'MyInfo' ? '내 정보 수정' :
    route.name === 'Alarm' ? '알림' :
    route.name === 'FeedAlarm' ? '피드' :
    route.name === 'UserAlarm' ? '유저' :
    route.name === 'IsAlarm' ? '로컬 알림 테스트' :
    route.name === 'MyFeed' ? '내 피드' : route.name;
  
  return route.name === 'FeedTab'
    ? <LogoImage navigation={navigation}/>
    : <CustomHeaderLeft navigation={navigation} title={title} />;
};

const MainPostStackScreen = ({ route, navigation }) => {
  useEffect(() => {
    const initialTab = route.params?.initialTab;

    if (initialTab === 'OtherFeed') {
      navigation.navigate('FeedTab', { screen: 'OtherFeed' });
    } else {
      navigation.navigate('FeedTab', { screen: 'FriendFeed' });
    }
  }, [route.params?.initialTab, navigation]);

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
      {/* 나머지 스크린들 */}
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
