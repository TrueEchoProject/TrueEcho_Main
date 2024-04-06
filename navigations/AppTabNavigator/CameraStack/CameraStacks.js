import { createStackNavigator } from "@react-navigation/stack";
import { Camera, SendPostStack } from "./index";

const CameraStacks = createStackNavigator();

export const CameraStackScreen = () => {
	return (
		<CameraStacks.Navigator>
			<CameraStacks.Screen
				name="CameraOption"
				component={Camera}
			/>
			<CameraStacks.Screen
				name="SendPosts"
				component={SendPostStack}
			/>
		</CameraStacks.Navigator>
	);
}