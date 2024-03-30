import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommunityStart, CommunityVote, CommunityResult } from './CommunityTabNavigator'

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
				children={CommunityStart}
			>
			</CommunityTab.Screen>
			<CommunityTab.Screen
				name="Vote"
				children={CommunityVote}
			>
			</CommunityTab.Screen>
			<CommunityTab.Screen
				name="Result"
				children={CommunityResult}
			/>
		</CommunityTab.Navigator>
	);
}