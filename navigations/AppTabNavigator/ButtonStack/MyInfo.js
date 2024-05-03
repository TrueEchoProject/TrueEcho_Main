import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, } from 'react-native';
import { Image } from "expo-image";
import axios from "axios";

const MyInfo = ({ navigation, route }) => {
	const [user, setUser] = useState({});
	const [editableUserId, setEditableUserId] = useState(""); // 사용자가 수정할 수 있는 user_Id 상태
	
	useEffect(() => {
		if (route.params?.user) {
			console.log('Received user response in Info:', route.params.user);
			setUser(route.params.user);
			setEditableUserId(route.params.user.user_Id); // 초기 user_Id 값 설정
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
	
	const handleUserIdChange = (text) => {
		setEditableUserId(text);
	};
	
	const handleSave = async () => {
		const updatedUser = {
			id: 1,
			username: user.username,
			user_Id: editableUserId, // 변경된 user_Id
			user_vote: user.user_vote,
			profile_url: user.profile_url,
			your_location: user.your_location,
		};
		
		try {
			const DeleteUser = await axios.delete('http://192.168.0.3:3000/user_me')
			const response = await axios.post('http://192.168.0.3:3000/user_me', updatedUser);
			console.log('User updated:', response.data);
			// 성공 시 필요한 로직 추가, 예를 들어 화면 이동 등
			navigation.navigate("MyP", { Update: updatedUser })
		} catch (error) {
			console.error('Failed to update user:', error);
			// 에러 처리 로직 추가
		}
	};
	
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
				<View style={styles.View}>
					<Text style={styles.smallText}>이름</Text>
					<Text style={styles.text}>{user.username}</Text>
				</View>
			</View>
			<View style={{ width: "90%",}}>
				<View style={styles.View}>
					<Text style={styles.smallText}>사용자 이름</Text>
					<TextInput
						style={[styles.text, { padding: 5 }]}
						onChangeText={handleUserIdChange}
						value={editableUserId}
						editable={true} // 편집 가능하게 설정
						returnKeyType="done"
					/>
				</View>
			</View>
			<View style={{ width: "90%",}}>
				<TouchableOpacity style={styles.View}>
					<Text style={styles.smallText}>위치</Text>
					<Text style={styles.text}>{user.your_location}</Text>
				</TouchableOpacity>
			</View>
			<View style={{ width: "90%",}}>
				<TouchableOpacity
					style={styles.saveButton}
					onPress={handleSave}
				>
					<Text style={styles.saveText}>저장</Text>
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
		padding: 12,
		width: "100%",
		borderRadius: 15,
		backgroundColor: "#99A1B6",
		marginBottom: 30,
	},
	smallText: {
		fontSize: 12,
		fontWeight: "500",
	},
	text: {
		borderRadius: 10,
		fontSize: 14,
		fontWeight: "400",
		color: 'black', // 입력 텍스트 색상
		padding: 7, // 패딩 추가
		marginTop: 5, // 상단 마진 추가
		minWidth: "100%", // 최소 너비 설정
		backgroundColor: "white", // 배경 색상 변경
	},
	saveButton: {
		flexDirection: "column",
		padding: 18,
		width: "100%",
		borderRadius: 15,
		backgroundColor: "grey",
		marginBottom: 30,
	},
	saveText: {
		borderRadius: 10,
		fontSize: 16,
		fontWeight: "600",
		color: 'white', // 입력 텍스트 색상
		minWidth: "100%", // 최소 너비 설정
	},
});

export default MyInfo;