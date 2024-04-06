import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // 하단 Tab 네비게이터
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { MainPostStackScreen, CommunityStackScreen } from "./Stack"
import { CameraStackScreen } from "./AppTabNavigator/CameraStack/CameraStacks"

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color, size }) => { // 화면의 아이콘 설정값 불러오기
	return <MaterialIcons name={name} size={size} color={color}/>
}

const TabNavigation = () => {
	return (
		<NavigationContainer>
			<Tab.Navigator // 네비게이터 전반의 설정
				screenOptions={{
					tabBarShowLabel: false, // 아이콘 이외의 글자 보기 옵션
					tabBarStyle: { //네비게이터 style 설정
						borderTopColor: '#111111', // 네비게이터 border
						borderTopWidth: 1, // 네비게이터 border
					},
				}}
			>
				<Tab.Screen // 각 tab의 옵션
					name="MainPost"
					component={MainPostStackScreen} // 메인 피드 속 Stack 연결
					options={{
						headerShown: false,
						tabBarIcon: props => { //위의 아이콘 설정값 대입
							return TabIcon({...props, name: 'home'});
						},
					}}
				/>
				<Tab.Screen //하단
					name="Camera"
					component={CameraStackScreen}
					options={{
						tabBarIcon: props => { //위의 아이콘 설정값 대입
							return TabIcon({...props, name: 'camera'});
						},
					}}
				/>
				<Tab.Screen
					name="CommunityTab"
					component={CommunityStackScreen} // 커뮤니티 속 Stack 연결
					options={{
						headerShown: false,
						tabBarIcon: props => { //위의 아이콘 설정값 대입
							return TabIcon({...props, name: 'people'});
						},
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
};

export default TabNavigation;