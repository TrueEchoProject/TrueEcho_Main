import { createStackNavigator } from "@react-navigation/stack";
import { Camera, SendPostStack } from "./index";

const CameraStack = createStackNavigator();

export const CameraStackScreen = () => {
	return (
		<CameraStack.Navigator>
			<CameraStack.Screen
				name="CameraOption"
				component={Camera}
			/>
			<CameraStack.Screen
				name="SendPost"
				component={SendPostStack}
			/>
		</CameraStack.Navigator>
	);
}