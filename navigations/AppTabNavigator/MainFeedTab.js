import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FriendFeed from './FeedTabNavigator/FriendFeed';
import FofFeed from './FeedTabNavigator/FofFeed';
import OtherFeed from './FeedTabNavigator/OtherFeed';
import FeedButton from "../../components/FeedButton";

const MainFeedTab = createBottomTabNavigator();

export const MainFeedTabScreen = () => { // 메인 피드 속 Stack 구성
	return (
		<MainFeedTab.Navigator
			screenOptions={{
				tabBarStyle: { display: 'none' } // 하단 탭 바 숨김
			}}
		>
			<MainFeedTab.Screen
				name="FriendFeed"
				component={FriendFeed}
				options={({ navigation }) => ({ // 메인 피드 화면에서 상단 네비 구현
					headerTitle: () => (
						<View style={{flexDirection: 'row', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
							<FeedButton
								title="친구"
								onPress={() => navigation.navigate('FriendFeed')}
							/>
							<FeedButton
								title="친구의 친구"
								onPress={() => navigation.navigate('FofFeed')}
							/>
							<FeedButton
								title="더보기"
								onPress={() => navigation.navigate('OtherFeed')}
							/>
						</View>
					)
				})}
			>
			</MainFeedTab.Screen>
			<MainFeedTab.Screen
				name="FofFeed"
				component={FofFeed}
				options={({ navigation }) => ({ // 메인 피드 화면에서 상단 네비 구현
					headerTitle: () => (
						<View style={{flexDirection: 'row', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
							<FeedButton
								title="친구"
								onPress={() => navigation.navigate('FriendFeed')}
							/>
							<FeedButton
								title="친구의 친구"
								onPress={() => navigation.navigate('FofFeed')}
							/>
							<FeedButton
								title="더보기"
								onPress={() => navigation.navigate('OtherFeed')}
							/>
						</View>
					)
				})}
			>
			</MainFeedTab.Screen>
			<MainFeedTab.Screen
				name="OtherFeed"
				component={OtherFeed}

			/>
		</MainFeedTab.Navigator>
	);
}


