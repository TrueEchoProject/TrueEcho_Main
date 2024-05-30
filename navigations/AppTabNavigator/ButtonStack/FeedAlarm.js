import React, { useEffect, useState } from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import AlarmCardComponent from "../../../components/AlarmCardComponent";
import Api from "../../../Api";

const FeedAlarm = ({ navigation, route }) => {
	const [postId, setPostId] = useState("")
	const [post, setPost] = useState({})
	const [isLoading, setIsLoading] = useState(true);
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	const handleActionComplete = (deletedPostId) => {
		navigation.goBack({ deletedPostId });
	};
	useEffect(() => {
		if (route.params?.post_id) {
			console.log('Received postId response:', route.params.post_id);
			setPostId(route.params.post_id);
		}
	}, [route.params?.post_id]);
	useEffect(() => {
		if (post) {
			console.log('Received postId response:', post);
		}
	}, [post]);
	useEffect(() => {
		if (postId) {
			fetchData(postId);
		}
	}, [postId]);
	const fetchData = async (postId) => {
		try {
			const response = await Api.get(`/post/read?postId=${postId}`);
			setPost(response.data.data);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching data', error);
		}
	}
	
	if (isLoading) {
		return <View style={styles.loader}><ActivityIndicator size="large" color="#0000ff" /></View>;
	}
	return (
		<View style={styles.container}>
			<AlarmCardComponent
				post={post}
				onActionComplete={handleActionComplete}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

export default FeedAlarm;