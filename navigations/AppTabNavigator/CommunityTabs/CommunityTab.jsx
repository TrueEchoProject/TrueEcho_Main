import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Result, Vote } from './index'

const CommunityTab = createBottomTabNavigator();
export const CommunityTabScreen = () => {

	return (
		<CommunityTab.Navigator
			screenOptions={{
				tabBarStyle: { display: 'none' } // 하단 탭 바 숨김
			}}
			initialRouteName="투표" // 최초 어플 실행 시 FriendFeed가 기본 화면으로 설정
		>
			<CommunityTab.Screen
				name="투표"
				component={Vote}
			>
			</CommunityTab.Screen>
			<CommunityTab.Screen
				name="결과"
				component={Result}
			>
			</CommunityTab.Screen>
		</CommunityTab.Navigator>
	);
}