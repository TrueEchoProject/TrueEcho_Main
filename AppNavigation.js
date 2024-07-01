import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginForm from './SignUp/LoginForm';
import SignUpForm from './SignUp/SignUpForm';
import ForgotPassword from './SignUp/ForgotPassword';
import TabNavigation from './navigations/Tab';
import LoginCheck from "./navigations/LoginCheck";

const Stack = createStackNavigator();

const AppNavigation = ({ initialRouteName }) => {
	return (
		<Stack.Navigator initialRouteName={initialRouteName}>
			<Stack.Screen
				name="LoginCheck"
				component={LoginCheck}
				options={{
					headerShown: false,
					gestureEnabled: false, // 제스처로 뒤로 가기 비활성화
					headerLeft: null // 헤더의 뒤로 가기 버튼 비활성화
				}}
			/>
			<Stack.Screen
				name="TabNavigation"
				component={TabNavigation}
				options={{
					headerShown: false,
					gestureEnabled: false, // 제스처로 뒤로 가기 비활성화
					headerLeft: null // 헤더의 뒤로 가기 버튼 비활성화
				}}
			/>
			<Stack.Screen
				name="Login"
				component={LoginForm}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="SignUp" // 회원가입 페이지 추가
				component={SignUpForm}
				options={{ headerShown: false}}
			/>
			<Stack.Screen
				name="ForgotPassword" 
				component={ForgotPassword}
				options={{ headerShown: false}}
			/>
		</Stack.Navigator>
	);
};

export default AppNavigation;
