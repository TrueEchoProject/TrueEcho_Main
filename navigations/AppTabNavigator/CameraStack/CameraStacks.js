import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Camera, SendPostStack } from './index';
import FeedPostPage from './FeedPostPages';
import {View} from "react-native";
import {Button1, Button2} from "../../../components/Button";

const CameraStacks = createStackNavigator();

export const CameraStackScreen = () => {
	return (
		<CameraStacks.Navigator>
			<CameraStacks.Screen
				name="CameraOption"
				component={Camera}
				options={{
					headerShown: false
				}}
			/>
			<CameraStacks.Screen
				name="FeedPostPage"
				component={FeedPostPage}
				options={{
					headerShown: false
				}}
			/>
		</CameraStacks.Navigator>
	);
};