import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Alert,
	Platform,
	Modal,
	Dimensions,
	ActivityIndicator, Button,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import MapView, {Marker} from "react-native-maps";
import GetLocation from "../../../SignUp/GetLocation";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const MyInfo = ({ navigation, route }) => {
	const [user, setUser] = useState({});
	const [editableUserId, setEditableUserId] = useState(""); // 사용자가 수정할 수 있는 user_Id 상태
	const [initialUserId, setInitialUserId] = useState(""); // 초기 user_Id 상태
	const [imageUri, setImageUri] = useState("");
	const [warning, setWarning] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isLocVisible, setIsLocVisible] = useState(false);
	const defaultImage = "https://i.ibb.co/wwfqn6V/DALL-E-2024-04-26-20-08-20-A-realistic-image-capturing-the-essence-of-a-photo-taken-by-a-young-man-i.webp";
	
	const [latitude, setLatitude] = useState(null);
	const [longitude, setLongitude] = useState(null);
	const [loading, setLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	useEffect(() => {
		if (route.params?.user) {
			console.log('Received user response in Info:', route.params.user);
			setUser(route.params.user);
			setInitialUserId(route.params.user.user_Id); // 초기 user_Id 값 설정
			setEditableUserId(route.params.user.user_Id); // editableUserId 초기값 설정
			setImageUri(route.params.user.profile_url);
		}
	}, [route.params?.user]);
	const handleLocationReceived = (lat, lon) => {
		console.log('Received new location:', { lat, lon });
		setLatitude(lat);
		setLongitude(lon);
		setLoading(false); // 위치를 받았을 때 로딩 종료
	};
	const handleConfirm = () => {
		const data = {
			location: [
				{
					id: 1,
					loc: latitude.toString(),
					lon: longitude.toString()
				}
			]
		};
		
		axios.post('http://192.168.0.27:3000/location', data) // 컴펌 클릭시, 다시 현재 위치를 서버에 전송.
			.then(response => {
				console.log('Location sent to server:', response.data);
			})
			.catch(error => {
				console.error('Error sending location:', error);
			});
		setIsLocVisible(false);
	};
	const handleRefresh = () => {
		setLoading(true); // 새로고침 시 로딩 시작
		setRefresh(prev => !prev);
	};
	useEffect(() => {
		if (isLocVisible) {
			setLoading(true); // 모달이 열릴 때 로딩 시작
			axios.get('http://192.168.0.27:3000/location') // 서버에 저장되었던 위치를 보여줌. (이전에 저장되었던 위치.)
				.then(response => {
					console.log('Fetched data from server:', response.data);
					if (response.data && response.data.length > 0) {
						const { lat, lon } = response.data[0];
						console.log('Fetched initial location:', { lat, lon });
						setLatitude(parseFloat(lat));
						setLongitude(parseFloat(lon));
					} else {
						console.error('No location data available');
					}
					setLoading(false); // 위치를 가져왔을 때 로딩 종료
				})
				.catch(error => {
					console.error('Error fetching initial location:', error);
					setLoading(false); // 오류가 발생했을 때도 로딩 종료
				});
		}
	}, [isLocVisible]);
	
	useEffect(() => {
		if (refresh) {
			setLoading(true); // refresh가 변경되면 로딩 시작
			// refresh가 변경될 때 GetLocation에서 새로운 위치를 받으면 handleLocationReceived에서 로딩 종료
		}
	}, [refresh]);
	const LocVisible = () => {
		setIsLocVisible(!isLocVisible)
	}
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
				<TouchableOpacity onPress={LocVisible} style={styles.View}>
					<Text style={styles.smallText}>위치</Text>
					<Text style={styles.text}>{user.your_location}</Text>
				</TouchableOpacity>
			</View>
			{isLocVisible && (
				<Modal
					visible={isLocVisible}
					animationType="slide"
					onClose={() => setIsLocVisible(false)}
				>
					<View style={styles.LocModalContainer}>
						<Text style={styles.title}>이전에 저장된 주소</Text>
						{loading ? (
							<ActivityIndicator size="large" color="#0000ff" />
						) : (
							latitude !== null && longitude !== null && (
								<MapView
									style={styles.map}
									region={{
										latitude: latitude,
										longitude: longitude,
										latitudeDelta: 0.0922,
										longitudeDelta: 0.0421,
									}}
								>
									<Marker coordinate={{ latitude, longitude }} />
								</MapView>
							)
						)}
						<GetLocation onLocationReceived={handleLocationReceived} refresh={refresh} />
						<View style={styles.buttonContainer}>
							<Button title="현재 위치로 변경" onPress={handleRefresh} />
							<Button title="Confirm" onPress={handleConfirm} />
							<Button title="취소" onPress={() => setIsLocVisible(false)} />
						</View>
					</View>
				</Modal>
			)}
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
	LocModalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 20,
		marginBottom: 20,
	},
	map: {
		width: '90%',
		height: '60%',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
		width: '80%',
	},
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