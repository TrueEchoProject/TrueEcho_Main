import { createStackNavigator } from "@react-navigation/stack";
import { Camera, SendPost } from "./index";
import FeedPostPage from "./FeedPostPages";

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
				component={SendPost}
			/>
			<CameraStacks.Screen
 			 name="FeedPostPage"
  			component={FeedPostPage}
  			options={{ title: 'FeedPostPage' }}
			/>
		</CameraStacks.Navigator>
	);
}