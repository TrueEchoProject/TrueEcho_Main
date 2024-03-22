import React from 'react';
import { createStackNavigator } from "@react-navigation/stack";
import { CommunityTab, FriendsTab, MyPageTab, MyOptionsTab, MainFeedTab, } from "./AppTabNavigator"
import { View } from 'react-native';
import { Button1, Button2, Button3 } from "../components/Button";

const MainFeedStack = createStackNavigator();

export const MainFeedStackScreen = () => { // 메인 피드 속 Stack 구성
	return (
		<MainFeedStack.Navigator>
			<MainFeedStack.Screen
				name="Logo"
				component={MainFeedTab}
				options={({ navigation }) => ({// 메인 피드 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button1 onPress={() => navigation.navigate('Friends')} />
							<Button2 onPress={() => navigation.navigate('MyPage')} />
						</View>
					)
				})}
			/>
			<MainFeedStack.Screen
				name="MyPage"
				component={MyPageTab}
				options={({ navigation }) => ({ // 마이페이지 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button3 onPress={() => navigation.navigate('MyOptions')} />
						</View>
					)
				})}
			/>
			<MainFeedStack.Screen
				name="Friends"
				component={FriendsTab}
			/>
			<MainFeedStack.Screen
				name="MyOptions"
        component={MyOptionsTab}
      />
		</MainFeedStack.Navigator>
	);
}

const CommunityStack = createStackNavigator();

export const CommunityStackScreen = () => { // 커뮤니티 속 Stack 구성
	return (
		<CommunityStack.Navigator>
			<CommunityStack.Screen
				name="Logo"
				component={CommunityTab}
				options={({ navigation }) => ({ // 커뮤니티 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button1 onPress={() => navigation.navigate('Friends')} />
							<Button2 onPress={() => navigation.navigate('MyPage')} />
						</View>
					)
				})}
			/>
			<CommunityStack.Screen
				name="MyPage"
				component={MyPageTab}
				options={({ navigation }) => ({ // 마이페이지 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button3 onPress={() => navigation.navigate('MyOptions')} />
						</View>
					)
				})}
			/>
			<CommunityStack.Screen
				name="Friends"
				component={FriendsTab}
			/>
			<CommunityStack.Screen
				name="MyOptions"
				component={MyOptionsTab}
			/>
		</ CommunityStack.Navigator>
	);
}