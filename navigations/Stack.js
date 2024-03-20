import React from 'react'; //주석추가
import { createStackNavigator } from "@react-navigation/stack";
import { MainFeed, Community, MyPage, Friends, MyOptions } from "../screens";
import { View } from 'react-native';
import { Button1, Button2, Button3 } from "../components/Button";
import { Camera } from '../screens';

const MainFeedStack = createStackNavigator();

export const MainFeedStackScreen = () => { // 메인 피드 속 Stack 구성
	return (
		<MainFeedStack.Navigator>
			<MainFeedStack.Screen
				name="Logo"
				component={MainFeed}
				options={({ navigation }) => ({ // 메인 피드 화면에서 상단 네비 구현
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
				component={MyPage}
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
				component={Friends}
			/>
			<MainFeedStack.Screen
				name="MyOptions"
        component={MyOptions}
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
				component={Community}
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
				component={MyPage}
				options={({ navigation }) => ({ // 마이페이지 화면에서 상단 네비 구현
					headerRight: () => (
						<View style={{flexDirection: 'row'}}>
							<Button3 onPress={() => navigation.navigate('MyOptions')} />
						</View>
					)
				})}
			/>
			<CommunityStack.Screen name="Friends" component={Friends} />
			<CommunityStack.Screen
				name="MyOptions"
				component={MyOptions}
			/>
		</ CommunityStack.Navigator>
	);
}