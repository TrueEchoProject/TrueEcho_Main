import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity,} from 'react-native';
import { Image } from "expo-image";

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
			console.log('your_location in Info:', user.your_location);
		}
	}, [user]);
	
	return (
		<View style={styles.container}>
			<View style={{ padding: 20, alignItems:"center",}}>
				<TouchableOpacity>
					<Image
						source={{ uri: user.profile_url }}
						style={styles.Image}
					/>
				</TouchableOpacity>
				<Text style={[styles.smallText, { marginTop: 5 }]}>프로필 사진 설정</Text>
			</View>
			<View style={{ width: "90%", }}>
				<TouchableOpacity style={styles.View}>
					<Text style={styles.smallText}>이름</Text>
					<Text style={styles.text}>{user.username}</Text>
				</TouchableOpacity>
			</View>
			<View style={{ width: "90%",}}>
				<TouchableOpacity style={styles.View}>
					<Text style={styles.smallText}>사용자 이름</Text>
					<Text style={styles.text}>{user.user_Id}</Text>
				</TouchableOpacity>
			</View>
			<View style={{ width: "90%",}}>
				<TouchableOpacity style={styles.View}>
					<Text style={styles.smallText}>위치</Text>
					<Text style={styles.text}>{user.your_location}</Text>
				</TouchableOpacity>
			</View>
			<View style={{ width: "90%",}}>
				<TouchableOpacity style={[styles.View, {backgroundColor: "grey"}]}>
					<Text style={styles.text}>저장</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		alignItems: "center",
	},
	Image: {
		width: 74,
		height: 74,
		borderRadius: 37,
		backgroundColor: 'white',
	},
	View: {
		flexDirection: "column",
		padding: 20,
		width: "100%",
		borderRadius: 15,
		backgroundColor: "#99A1B6",
		marginBottom: 30,
	},
	smallText: {
		fontSize: 13,
		fontWeight: "100",
	},
	text: {
		fontSize: 18,
		fontWeight: "400",
		marginTop: 5,
	},
});

export default MyInfo;