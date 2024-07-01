import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Image } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Result, Vote } from './index';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
  <Image source={require('../../../assets/logoFont.png')} style={{ width: wp('35%'), height: hp('5%'), marginLeft: 10 }} />
);

const getHeaderLeft = (navigation, route) => {
  const title = route.name === 'Vote' ? '투표' :
    route.name === 'Result' ? '랭킹' : route.name;

  return route.name === 'Vote'
    ? <LogoImage />
    : <CustomHeaderLeft navigation={navigation} title={title} />;
};

export const CommunityTabScreen = () => {
  return (
    <CommunityStack.Navigator
      initialRouteName="Vote" // 최초 어플 실행 시 Vote가 기본 화면으로 설정
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
      <CommunityStack.Screen
        name="Vote"
        component={Vote}
        options={{ headerShown: false }}
      />
      <CommunityStack.Screen
        name="Result"
        component={Result}
        options={{ title: '결과' }}
      />
    </CommunityStack.Navigator>
  );
};
