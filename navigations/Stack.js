import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { Friends, MyPage, MyOptions } from "./AppTabNavigatior/ButtonStack"
import { View } from 'react-native';
import { Button1, Button2, Button3 } from "../components/Button";
import { MainPostTabScreen } from "./AppTabNavigatior/PostTab/MainPostTab";
import { CommunityTabScreen } from "./AppTabNavigatior/CommunityTabs/CommunityTab";

import {FriendPosts} from "./AppTabNavigatior/PostTab";

const MainPostStack = createStackNavigator();

export const MainPostStackScreen = () => { // 메인 피드 속 Stack 구성
	return (
		<MainPostStack.Navigator>
			<MainPostStack.Screen
				name="FeedTab"
				component={MainPostTabScreen}
				options={({ navigation }) => ({ // 메인 피드 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button1 onPress={() => navigation.navigate('Fri')} />
							<Button2 onPress={() => navigation.navigate('MyP')} />
						</View>
					)
				})}
			/>
			<MainPostStack.Screen
				name="MyP"
				component={MyPage}
				options={({ navigation }) => ({ // 마이페이지 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button3 onPress={() => navigation.navigate('MyOp')} />
						</View>
					)
				})}
			/>
			<MainPostStack.Screen
				name="Fri"
				component={Friends}
			/>
			<MainPostStack.Screen
				name="MyOp"
				component={MyOptions}
			/>
		</MainPostStack.Navigator>
	);
}

const CommunityStack = createStackNavigator();

export const CommunityStackScreen = () => { // 커뮤니티 속 Stack 구성
	return (
		<CommunityStack.Navigator>
			<CommunityStack.Screen
				name="Community"
				component={CommunityTabScreen}
				options={({ navigation }) => ({ // 커뮤니티 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button1 onPress={() => navigation.navigate('Fri')} />
							<Button2 onPress={() => navigation.navigate('MyP')} />
						</View>
					)
				})}
			/>
			<CommunityStack.Screen
				name="MyP"
				component={MyPage}
				options={({ navigation }) => ({ // 마이페이지 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button3 onPress={() => navigation.navigate('MyOp')} />
						</View>
					)
				})}
			/>
			<CommunityStack.Screen
				name="Fri"
				component={Friends}
			/>
			<CommunityStack.Screen
				name="MyOp"
				component={MyOptions}
			/>
		</ CommunityStack.Navigator>
	);
}