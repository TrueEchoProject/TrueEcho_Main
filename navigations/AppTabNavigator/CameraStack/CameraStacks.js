import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, SendPostStack } from './index';
import FeedPostPage from './FeedPostPages';
import { View, Image } from "react-native";
import { Button1, Button2 } from "../../../components/Button";

const CameraStacks = createStackNavigator();

const LogoTitle = () => {
  return (
    <Image
      source={require('../../../assets/logoFont.png')} // 이미지 경로를 실제 경로로 수정하세요.
      style={{ width: 140, height: 40 }} // 원하는 스타일로 수정할 수 있습니다.
      resizeMode="contain"
    />
  );
};

export const CameraStackScreen = () => {
  return (
    <CameraStacks.Navigator>
      <CameraStacks.Screen
        name="CameraOption"
        component={Camera}
        options={{
			headerTitle: props => <LogoTitle {...props} />,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'black', // 헤더 배경색을 검정색으로 설정
            borderBottomWidth: 0, // 헤더의 하단 테두리 제거
            shadowColor: 'transparent', // 그림자 색상을 투명으로 설정
            elevation: 0, // 그림자 제거 (안드로이드)
          },
          headerTintColor: '#fff', // 헤더의 텍스트 색상 등을 흰색으로 설정
          headerLeft: null // 뒤로가기 버튼을 숨김
        }}
      />
      <CameraStacks.Screen
        name="FeedPostPage"
        component={FeedPostPage}
        options={{
          headerTitle: props => <LogoTitle {...props} />,
          headerTitleAlign: 'left',
          headerStyle: {
            backgroundColor: 'black', // 헤더 배경색을 검정색으로 설정
            borderBottomWidth: 0, // 헤더의 하단 테두리 제거
            shadowColor: 'transparent', // 그림자 색상을 투명으로 설정
            elevation: 0, // 그림자 제거 (안드로이드)
          },
          headerTintColor: '#fff', // 헤더의 텍스트 색상 등을 흰색으로 설정
          headerLeft: null // 뒤로가기 버튼을 숨김
        }}
      />
    </CameraStacks.Navigator>
  );
};
