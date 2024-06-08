import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Result, Vote } from './index';

const CommunityStack = createStackNavigator();

export const CommunityTabScreen = () => {
	return (
		<CommunityStack.Navigator
			initialRouteName="Vote" // 최초 어플 실행 시 Vote가 기본 화면으로 설정
		>
			<CommunityStack.Screen
				name="Vote"
				component={Vote}
				options={{ headerShown: false }}
			/>
			<CommunityStack.Screen
				name="Result"
				component={Result}
				options={{ headerShown: true }}
			/>
		</CommunityStack.Navigator>
	);
};
