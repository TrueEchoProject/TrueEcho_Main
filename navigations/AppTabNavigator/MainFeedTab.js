import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FriendFeed from './FeedTabNavigator/FriendFeed';
import FofFeed from './FeedTabNavigator/FofFeed';
import OtherFeed from './FeedTabNavigator/OtherFeed';
import FeedButton from "../../components/FeedButton";

const MainFeedTab = createBottomTabNavigator();
export const MainFeedTabScreen = () => {
	const friendFeedRef = React.useRef();
	const fofFeedRef = React.useRef();
	const otherFeedRef = React.useRef();
	
	return (
		<MainFeedTab.Navigator
			screenOptions={{
				tabBarStyle: { display: 'none' } // 하단 탭 바 숨김
			}}
			initialRouteName="FriendFeed" // 최초 어플 실행 시 FriendFeed가 기본 화면으로 설정
		>
			<MainFeedTab.Screen
				name="FriendFeed"
				children={(props) => <FriendFeed ref={friendFeedRef} {...props} />}
				options={({ navigation }) => ({
					headerTitle: () => {
						// 현재 활성화된 탭 이름 가져오기
						const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
						return (
							<View style={{ flexDirection: 'row' }}>
								<FeedButton
									title="친구"
									onPress={() => {
										if (currentRouteName === 'FriendFeed') {
											friendFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										}
									}}
									isSelected={currentRouteName === 'FriendFeed'}
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
						);
					},
					headerTitleAlign: "center",
					headerStyle: {
						height: 30,
					}
				})}
			>
			</MainFeedTab.Screen>
			<MainFeedTab.Screen
				name="FofFeed"
				children={(props) => <FofFeed ref={fofFeedRef} {...props} />}
				options={({ navigation }) => ({
					headerTitle: () => {
						// 현재 활성화된 탭 이름 가져오기
						const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
						return (
							<View style={{ flexDirection: 'row' }}>
								<FeedButton
									title="친구"
									onPress={() => navigation.navigate('FriendFeed')}
								/>
								<FeedButton
									title="친구의 친구"
									onPress={() => {
										if (currentRouteName === 'FofFeed') {
											fofFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										}
									}}
									isSelected={currentRouteName === 'FofFeed'}
								/>
								<FeedButton
									title="더보기"
									onPress={() => navigation.navigate('OtherFeed')}
								/>
							</View>
						);
					},
					headerTitleAlign: "center",
					headerStyle: {
						height: 30,
					}
				})}
			>
			</MainFeedTab.Screen>
			<MainFeedTab.Screen
				name="OtherFeed"
				children={(props) => <OtherFeed ref={otherFeedRef} {...props} />}
				options={({ navigation }) => ({
					headerTitle: () => {
						// 현재 활성화된 탭 이름 가져오기
						const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
						return (
							<View style={{ flexDirection: 'row' }}>
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
									onPress={() => {
										if (currentRouteName === 'OtherFeed') {
											otherFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										}
									}}
									isSelected={currentRouteName === 'OtherFeed'}
								/>
							</View>
						);
					},
					headerTitleAlign: "center",
					headerStyle: {
						height: 30,
					}
				})}
			/>
		</MainFeedTab.Navigator>
	);
}


