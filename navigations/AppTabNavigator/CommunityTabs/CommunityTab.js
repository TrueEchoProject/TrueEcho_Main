import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommunityStart, CommunityVote, CommunityResult } from './index'

const CommunityTab = createBottomTabNavigator();
export const CommunityTabScreen = () => {
	
	return (
		<CommunityTab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: { display: 'none' }
			}}
			initialRouteName="Start"
		>
			<CommunityTab.Screen
				name="Start"
				component={CommunityStart}
			>
			</CommunityTab.Screen>
			<CommunityTab.Screen
				name="Vote"
				component={CommunityVote}
			>
			</CommunityTab.Screen>
			<CommunityTab.Screen
				name="Result"
				component={CommunityResult}
			/>
		</CommunityTab.Navigator>
	);
}