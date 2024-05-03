import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyInfo = ({ route }) => {
	const [user, setUser] = useState({});
	
	useEffect(() => {
		if (route.params?.user) {
			console.log('Received user response in Info:', route.params.user);
			setUser(route.params.user);
		}
	}, [route.params?.user]);
	
	useEffect(() => {
		if (user) {
			console.log('profile_url in Info:', user.profile_url);
			console.log('user_vote in Info:', user.user_vote);
			console.log('username in Info:', user.username);
			console.log('user_Id in Info:', user.user_Id);
		}
	}, [user]);
	
	return (
		<View style={style.container}>
			<Text>MyInfo</Text>
		</View>
	);
}


const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

export default MyInfo;