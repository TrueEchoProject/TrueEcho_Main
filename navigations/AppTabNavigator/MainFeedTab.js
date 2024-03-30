import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FriendFeed from './FeedTabNavigator/FriendFeed';
import FofFeed from './FeedTabNavigator/FofFeed';
import OtherFeed from './FeedTabNavigator/OtherFeed';
import FeedButton from "../../components/FeedButton";

const MainFeedTab = createBottomTabNavigator();
export const MainFeedTabScreen = () => {
	const friendFeedRef = React.useRef(); // 탭의 활성화 확인
	const fofFeedRef = React.useRef(); // 탭의 활성화 확인
	const otherFeedRef = React.useRef(); // 탭의 활성화 확인
	
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
										if (currentRouteName === 'FriendFeed') { // 현재 활성화된 탭과 비교
											friendFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('FriendFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'FriendFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="친구의 친구"
									onPress={() => {
										if (currentRouteName === 'FofFeed') { // 현재 활성화된 탭과 비교
											fofFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('FofFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'FofFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="더보기"
									onPress={() => {
										if (currentRouteName === 'OtherFeed') { // 현재 활성화된 탭과 비교
											otherFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('OtherFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'OtherFeed'} // FeedButton 스타일 전환
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
									onPress={() => {
										if (currentRouteName === 'FriendFeed') { // 현재 활성화된 탭과 비교
											friendFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('FriendFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'FriendFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="친구의 친구"
									onPress={() => {
										if (currentRouteName === 'FofFeed') { // 현재 활성화된 탭과 비교
											fofFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('FofFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'FofFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="더보기"
									onPress={() => {
									if (currentRouteName === 'OtherFeed') { // 현재 활성화된 탭과 비교
										otherFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
									} else {
										navigation.navigate('OtherFeed'); // 아니면 이동
									}
										}}
								isSelected={currentRouteName === 'OtherFeed'} // FeedButton 스타일 전환
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
									onPress={() => {
										if (currentRouteName === 'FriendFeed') { // 현재 활성화된 탭과 비교
											friendFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('FriendFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'FriendFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="친구의 친구"
									onPress={() => {
										if (currentRouteName === 'FofFeed') { // 현재 활성화된 탭과 비교
											fofFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('FofFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'FofFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="더보기"
									onPress={() => {
										if (currentRouteName === 'OtherFeed') { // 현재 활성화된 탭과 비교
											otherFeedRef.current.refresh(); // FriendFeed의 새로고침 함수 호출
										} else {
											navigation.navigate('OtherFeed'); // 아니면 이동
										}
									}}
									isSelected={currentRouteName === 'OtherFeed'} // FeedButton 스타일 전환
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


