import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AlarmCardComponent from "../../../components/AlarmCardComponent";
import axios from "axios";

const FeedAlarm = ({ navigation, route }) => {
	const [postId, setPostId] = useState("")
	const [post, setPost] = useState({})
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	const handleActionComplete = () => {
		navigation.goBack();
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
	const fetchData = async ( postId ) => {
		try {
			const response = await axios.get(
        `${base_url}/post/read?postId=${postId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      );
			setPost(response.data.data);
		} catch (error) {
			console.error('Error fetching data', error);
		}
	}
	
	return (
		<View style={style.container}>
			<AlarmCardComponent
				post={post}
				onActionComplete={handleActionComplete}
			/>
		</View>
	)
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

export default FeedAlarm;