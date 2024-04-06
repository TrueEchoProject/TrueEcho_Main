import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FriendPosts, PublicPosts } from './index';

const MainPostTab = createBottomTabNavigator();
export const MainPostTabScreen = () => {
	
	return (
		<MainPostTab.Navigator
			screenOptions={{
				tabBarStyle: { display: 'none' } // 하단 탭 바 숨김
			}}
			initialRouteName="FriendFeed" // 최초 어플 실행 시 FriendFeed가 기본 화면으로 설정
		>
			<MainPostTab.Screen
				name="FriendFeed"
				component={PublicPosts}
			>
			</MainPostTab.Screen>
			<MainPostTab.Screen
				name="OtherFeed"
				component={FriendPosts}
			/>
		</MainPostTab.Navigator>
	);
}