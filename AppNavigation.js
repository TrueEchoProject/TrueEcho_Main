import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginForm from './SignUp/LoginForm';
import SignUpForm from './SignUp/SignUpForm';
import ForgotPassword from './SignUp/ForgotPassword';
import TabNavigation from './navigations/Tab';

const Stack = createStackNavigator();

const AppNavigation = () => {
	return (
		<Stack.Navigator initialRouteName="Login">
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
				options={{ headerShown: true}}
			/>
			<Stack.Screen
				name="MainPostStackScreen"
				component={TabNavigation}
				options={{ headerShown: false }}
			/>
		</Stack.Navigator>
	);
};

export default AppNavigation;
