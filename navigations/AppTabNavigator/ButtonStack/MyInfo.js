import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, Modal, Dimensions, } from 'react-native';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const MyInfo = ({ navigation, route }) => {
	const [user, setUser] = useState({});
	const [editableUserId, setEditableUserId] = useState(""); // 사용자가 수정할 수 있는 user_Id 상태
	const [initialUserId, setInitialUserId] = useState(""); // 초기 user_Id 상태
	const [imageUri, setImageUri] = useState("");
	const [warning, setWarning] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const defaultImage = "https://i.ibb.co/wwfqn6V/DALL-E-2024-04-26-20-08-20-A-realistic-image-capturing-the-essence-of-a-photo-taken-by-a-young-man-i.webp";
	
	useEffect(() => {
		if (route.params?.user) {
			console.log('Received user response in Info:', route.params.user);
			setUser(route.params.user);
			setInitialUserId(route.params.user.user_Id); // 초기 user_Id 값 설정
			setEditableUserId(route.params.user.user_Id); // editableUserId 초기값 설정
			setImageUri(route.params.user.profile_url);
		}
	}, [route.params?.user]);
	
	const PofileInitialization = () => {
		setImageUri(defaultImage);
		setIsModalVisible(false)
	}
	const pickImage = async () => {
		if (Platform.OS !== 'web') {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
				return;
			}
		}
		try {
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 4],
				quality: 1,
			});
			if (!result.cancelled) {
				console.log(result); // 확인 로그
				console.log(result.assets[0].uri); // 확인 로그
				setImageUri(result.assets[0].uri);
			}
		} catch (error) {
			console.error("ImagePicker Error: ", error);
		}
	};
	
	const handleUserIdChange = (text) => {
		setEditableUserId(text);
	};
	const duplicateCheck = () => {
		if (editableUserId === "") {
			Alert.alert("알림", "이름을 입력해주세요!");
			return;
		}
		
		console.log('Checking user ID:', editableUserId);
		axios.get(`http://192.168.0.27:3000/user?user_Id=${editableUserId}`)
			.then(response => {
				console.log('Response data:', response.data); // 응답 데이터 로깅
				if (response.data.length > 0) { //get을 통해 무언가 반환이 되면, 중복이므로 중복 알림 표시.
					alert('이미 사용 중인 아이디입니다.');
					setWarning('이미 사용 중인 아이디입니다.');
				} else { // 빈배열이 반환되면 중복이 아니므로 사용가능 알림 표시.
					alert('사용 가능한 아이디입니다.');
					setWarning('사용 가능한 아이디입니다.');
				}
			})
			.catch(error => { // 에러처리.
				console.error('Error:', error);
			});
	};
	
	const handleSave = async () => {
		if (editableUserId === "") {
			Alert.alert("알림", "이름을 입력해주세요!");
			return;
		}
		
		if (editableUserId === initialUserId) {
			Alert.alert(
				"알림", `변경된 값이 없어요.\n편집을 계속하시겠습니까?`,
				[
					{text: "예",
						onPress: () => console.log("편집 계속") // 편집을 계속하는 로직을 여기에 추가합니다.
					},
					{text: "아니오",
						onPress: () => navigation.navigate("MyP", { Update: user }), // 변경 없이 이전 화면으로 돌아갑니다.
						style: "cancel"}]);
			return;
		}
		const updatedUser = {
			id: 1,
			username: user.username,
			user_Id: editableUserId, // 변경된 user_Id
			user_vote: user.user_vote,
			profile_url: imageUri,
			your_location: user.your_location,
		};
		
		try {
			const DeleteUser = await axios.delete('http://192.168.0.27:3000/user_me')
			const response = await axios.post('http://192.168.0.27:3000/user_me', updatedUser);
			console.log('User updated:', response.data);
			// 성공 시 필요한 로직 추가, 예를 들어 화면 이동 등
			navigation.navigate("MyP", { Update: updatedUser })
		} catch (error) {
			console.error('Failed to update user:', error);
			// 에러 처리 로직 추가
		}
	};
	
	const ProfileModal = ({ isVisible, onClose }) => { // 수정: 프로퍼티 이름 Image -> imageUrl 변경
		return (
			<Modal
				animationType="fade"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.imageContainer}>
						<TouchableOpacity
							onPress={pickImage}
							style={styles.modalButton}
						>
							<Text style={styles.buttonText}>
								앨범에서 고르기
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={PofileInitialization}
							style={styles.modalButton}
						>
							<Text style={styles.buttonText}>
								기본 이미지로 변경
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={onClose}
							style={[styles.modalButton,{ backgroundColor: "grey", }]}
						>
							<Text style={styles.buttonText}>
								닫기
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	};
	const profileModalVisible = () => {
		setIsModalVisible(!isModalVisible);
	};
	return (
		<View style={styles.container}>
			<View style={{ padding: 20, alignItems:"center",}}>
				<TouchableOpacity onPress={profileModalVisible}>
					<ExpoImage
						source={{ uri: imageUri }}
						style={styles.Image}
					/>
				</TouchableOpacity>
				{isModalVisible && (
					<ProfileModal
						isVisible={isModalVisible}
						onClose={() => setIsModalVisible(false)}
					/>
				)}
				<Text style={[styles.smallText, { marginTop: 5 }]}>프로필 사진 변경</Text>
			</View>
			<View style={{ width: "90%", }}>
				<View style={styles.View}>
					<Text style={styles.smallText}>이름</Text>
					<Text style={styles.text}>{user.username}</Text>
				</View>
			</View>
			<View style={{ width: "90%",}}>
				<View style={{
					flexDirection: "column",
					padding: 12,
					width: "100%",
					borderRadius: 15,
					backgroundColor: "#99A1B6",
				}}>
					<Text style={styles.smallText}>사용자 이름</Text>
					<View style={{flexDirection: "row"}}>
						<TextInput
							style={[styles.text, { minWidth: "80%", padding: 5 }]}
							onChangeText={handleUserIdChange}
							value={editableUserId}
							editable={true} // 편집 가능하게 설정
							returnKeyType="done"
						/>
						<TouchableOpacity
							onPress={duplicateCheck}
							style={styles.duplicateConfirm}
						>
							<Text style={styles.duplicateText}>중복{'\n'}확인</Text>
						</TouchableOpacity>
					</View>
				</View>
				<View style={{
					paddingTop: 10,
					paddingLeft: 10,
					marginBottom: 30,
				}}>
					<Text style={warning === '이미 사용 중인 아이디입니다.' ? { color: 'red' } : { color: 'green' }}>
						{warning}
					</Text>
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
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	imageContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		width: windowWidth * 0.8,
		height: windowHeight * 0.3,
		borderRadius: 20,
		backgroundColor: 'white',
	},
	buttonText: {
		color: "black",
		fontSize: 15,
		fontWeight: "bold",
		textAlign: "center",
	},
	modalButton: {
		width: "80%",
		height: "20%",
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#99A1B6",
		borderColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
		margin: "3%",
	},
	duplicateConfirm: {
		height: 50,
		width: 50,
		borderRadius: 10,
		marginLeft: 10,
		backgroundColor: "#4CAF50",
		alignItems: "center",
		justifyContent: "center",
	},
	duplicateText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "white",
	},
});

export default MyInfo;