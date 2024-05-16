import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { Friends, MyPage, MyOptions, Calendar, MyInfo, Alarm, FeedAlarm, UserAlarm, IsAlarm } from "./AppTabNavigator/ButtonStack"
import { View } from 'react-native';
import { Button1, Button2 } from "../components/Button";
import { MainPostTabScreen } from "./AppTabNavigator/PostTab/MainPostTab";
import { CommunityTabScreen } from "./AppTabNavigator/CommunityTabs/CommunityTab";

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
			/>
			<MainPostStack.Screen
				name="Fri"
				component={Friends}
			/>
			<MainPostStack.Screen
				name="MyOp"
				component={MyOptions}
			/>
			<MainPostStack.Screen
				name="캘린더"
				component={Calendar}
			/>
			<MainPostStack.Screen
				name="내 설정 편집"
				component={MyInfo}
			/>
			<MainPostStack.Screen
				name="알람"
				component={Alarm}
			/>
			<MainPostStack.Screen
				name="피드 알람"
				component={FeedAlarm}
			/>
			<MainPostStack.Screen
				name="유저 알람"
				component={UserAlarm}
			/>
			<MainPostStack.Screen
				name="IsAlarm"
				component={IsAlarm}
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
		</ CommunityStack.Navigator>
	);
}