import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AlarmCardComponent from "../../../components/AlarmCardComponent";
import axios from "axios";

const FeedAlarm = ({ navigation, route }) => {
	const [postId, setPostId] = useState("")
	const [post, setPost] = useState({})
	
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
			const response = await axios.get(`http://192.168.0.3:3000/posts?post_id=${postId}`);
			setPost(response.data[0]);
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