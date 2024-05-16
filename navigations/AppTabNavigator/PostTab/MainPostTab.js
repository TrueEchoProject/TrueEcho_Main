import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FriendPosts, PublicPosts } from './index';
import FeedButton from "../../../components/FeedButton";

const MainPostTab = createBottomTabNavigator();
export const MainPostTabScreen = () => {
	const friendPostsRef = React.useRef(); // 탭의 활성화 확인
	const PublicPostsRef = React.useRef(); // 탭의 활성화 확인
	
	return (
		<MainPostTab.Navigator
			screenOptions={{
				tabBarStyle: { display: 'none' } // 하단 탭 바 숨김
			}}
			initialRouteName="FriendFeed" // 최초 어플 실행 시 FriendFeed가 기본 화면으로 설정
		>
			<MainPostTab.Screen
				name="FriendFeed"
				children={(props) => <FriendPosts ref={friendPostsRef} {...props} />}
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
											friendPostsRef.current.getPosts();}
										else { navigation.navigate('FriendFeed')}
									}}
									isSelected={currentRouteName === 'FriendFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="더보기"
									onPress={() => {
										if (currentRouteName === 'OtherFeed') { // 현재 활성화된 탭과 비교
											PublicPostsRef.current.getPosts(); // FriendFeed의 새로고침 함수 호출
										} else {navigation.navigate('OtherFeed');}
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
			</MainPostTab.Screen>
			<MainPostTab.Screen
				name="OtherFeed"
				children={(props) => <PublicPosts ref={PublicPostsRef} {...props} />}
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
											PublicPostsRef.current.getPosts(); // FriendFeed의 새로고침 함수 호출
										} else {navigation.navigate('FriendFeed')}
									}}
									isSelected={currentRouteName === 'FriendFeed'} // FeedButton 스타일 전환
								/>
								<FeedButton
									title="더보기"
									onPress={() => {
										if (currentRouteName === 'OtherFeed') { // 현재 활성화된 탭과 비교
											PublicPostsRef.current.getPosts(); // FriendFeed의 새로고침 함수 호출
										} else {navigation.navigate('OtherFeed')}
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
			</MainPostTab.Screen>
		</MainPostTab.Navigator>
	);
}