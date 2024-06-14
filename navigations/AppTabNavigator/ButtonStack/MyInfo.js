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
	ActivityIndicator,
	Button,
	Image,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Api from "../../../Api";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // 이미지 리사이징 추가.
import MapView, { Marker } from "react-native-maps";
import GetLocation from "../../../SignUp/GetLocation";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const MyInfo = ({ navigation }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [serverUserLocation, setServerUserLocation] = useState("");
	const [username, setUsername] = useState("");
	const [editableUserId, setEditableUserId] = useState("");
	const [initialUserId, setInitialUserId] = useState("");
	const [imageUri, setImageUri] = useState("");
	const [warning, setWarning] = useState("");
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isLocVisible, setIsLocVisible] = useState(false);
	const [showDuplicateButton, setShowDuplicateButton] = useState(false);
	const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
	const [latitude, setLatitude] = useState(null);
	const [longitude, setLongitude] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isSubmit, setIsSubmit] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [isRequestPending, setIsRequestPending] = useState(false); // 요청 상태 관리
	
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	const handleLocationReceived = (lat, lon) => {
		console.log('Received new location:', {lat, lon});
		setLatitude(lat);
		setLongitude(lon);
		setLoading(false);
	};
	const handleRefresh = () => {
		setLoading(true);
		setRefresh(prev => !prev);
	};
	
	useEffect(() => {
		fetchServerData();
	}, []);
	
	const fetchServerData = async () => {
		try {
			const response = await Api.get(`/setting/myInfo`);
			const data = response.data.data;
			setUsername(data.username);
			setInitialUserId(data.nickname);
			setEditableUserId(data.nickname);
			setImageUri(data.profileUrl ? data.profileUrl : defaultImage);
			setServerUserLocation(data.yourLocation);
			setLatitude(data.y);
			setLongitude(data.x);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching data', error);
		}
	};
	const PofileInitialization = () => {
		setImageUri(defaultImage);
		setIsModalVisible(false);
	};
	
	const pickImage = async () => {
		if (Platform.OS !== 'web') {
			const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
				const manipResult = await ImageManipulator.manipulateAsync(
					result.uri,
					[{resize: {width: 800}}], // 이미지 크기 조정
					{compress: 0.7, format: ImageManipulator.SaveFormat.JPEG}
				);
				setImageUri(manipResult.uri);
			}
		} catch (error) {
			console.error("ImagePicker Error: ", error);
		}
	};
	
	const handleUserIdChange = (text) => {
		setEditableUserId(text);
	};
	
	useEffect(() => {
		setShowDuplicateButton(editableUserId !== initialUserId);
		setIsDuplicateChecked(editableUserId === initialUserId);
	}, [editableUserId, initialUserId]);
	
	const duplicateCheck = async () => {
		if (isRequestPending) return; // 요청 중일 때 함수 실행 막기
		setIsRequestPending(true); // 요청 상태 시작
		
		if (editableUserId === "") {
			Alert.alert("알림", "이름을 입력해주세요!");
			setEditableUserId(initialUserId);
			setIsRequestPending(false); // 요청 상태 종료
			return;
		}
		console.log('Checking user ID:', editableUserId);
		try {
			const response = await Api.get(`/accounts/nickname/duplication?nickname=${editableUserId}`);
			console.log('Response data:', response.data);
			if (response.data.message === "중복된 계정입니다.") {
				alert('이미 사용 중인 아이디입니다.');
				setWarning('이미 사용 중인 아이디입니다.');
			} else {
				alert('사용 가능한 아이디입니다.');
				setWarning('사용 가능한 아이디입니다.');
			}
			setIsDuplicateChecked(true);
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setIsRequestPending(false); // 요청 상태 종료
		}
	};
	const handleSave = async () => {
		if (isRequestPending) return; // 요청 중일 때 함수 실행 막기
		setIsRequestPending(true); // 요청 상태 시작
		
		if (editableUserId === "") {
			Alert.alert("알림", "이름을 입력해주세요!");
			setIsRequestPending(false); // 요청 상태 종료
			return;
		}
		if (editableUserId !== initialUserId && !isDuplicateChecked) {
			Alert.alert("알림", "이름 중복 확인을 해주세요!");
			setIsRequestPending(false); // 요청 상태 종료
			return;
		}
		
		const formData = new FormData();
		if (imageUri) {
			formData.append('profileImage', {
				uri: imageUri,
				name: 'profile.jpg',
				type: 'image/jpeg',
			});
		}
		formData.append('username', username);
		formData.append('location', serverUserLocation);
		formData.append('nickname', editableUserId);
		formData.append('x', longitude.toString());
		formData.append('y', latitude.toString());
		
		try {
			const response = await Api.patch(`/setting/myInfo`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			
			const responseData = response.data;
			console.log('User updated:', responseData);
			if (responseData.data.message === '개인정보 수정를 성공했습니다.') {
				Alert.alert('알림', '개인정보 수정를 성공했습니다.');
			} else {
				navigation.navigate("MyP", {Update: responseData.data});
			}
		} catch (error) {
			console.error('Failed to update user:', error);
		} finally {
			setIsRequestPending(false); // 요청 상태 종료
		}
	};
	
	
	const profileModalVisible = () => {
		setIsModalVisible(!isModalVisible);
	};
	
	const ProfileModal = ({isVisible, onClose}) => {
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
							style={[styles.modalButton, {backgroundColor: "grey",}]}
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
	
	if (isLoading) {
		return <View style={styles.loader}><ActivityIndicator size="large" color="#0000ff"/></View>;
	}
	
	return (
		<View style={styles.container}>
			<View style={{padding: 20, alignItems: "center"}}>
				<TouchableOpacity onPress={profileModalVisible} disabled={isRequestPending}>
					<Image
						source={{uri: imageUri}}
						style={styles.Image}
					/>
				</TouchableOpacity>
				{isModalVisible && (
					<ProfileModal
						isVisible={isModalVisible}
						onClose={() => setIsModalVisible(false)}
					/>
				)}
				<Text style={[styles.smallText, {marginTop: 5}]}>프로필 사진 변경</Text>
			</View>
			<View style={{width: "90%"}}>
				<View style={styles.View}>
					<Text style={styles.smallText}>이름</Text>
					<Text style={styles.text}>{username}</Text>
				</View>
			</View>
			<View style={{width: "90%"}}>
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
							style={[styles.text, {minWidth: "80%", padding: 5}]}
							onChangeText={handleUserIdChange}
							value={editableUserId}
							editable={!isRequestPending}
							returnKeyType="done"
						/>
						{showDuplicateButton && (
							<TouchableOpacity
								onPress={duplicateCheck}
								style={styles.duplicateConfirm}
								disabled={isRequestPending}
							>
								<Text style={styles.duplicateText}>중복{'\n'}확인</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
				<View style={{
					paddingTop: 10,
					paddingLeft: 10,
					marginBottom: 30,
				}}>
					{showDuplicateButton &&
						(!isDuplicateChecked ?
								<Text style={{color: "grey"}}>
									중복 조회를 부탁해요!
								</Text>
								:
								<Text style={warning === '이미 사용 중인 아이디입니다.' ? {color: 'red'} : {color: 'green'}}>
									{warning}
								</Text>
						)
					}
				</View>
			</View>
			<View style={{width: "90%"}}>
				<TouchableOpacity onPress={() => setIsLocVisible(!isLocVisible)} style={styles.View}
				                  disabled={isRequestPending}>
					<Text style={styles.smallText}>위치</Text>
					<Text style={styles.text}>{serverUserLocation}</Text>
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
							<ActivityIndicator size="large" color="#0000ff"/>
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
									<Marker coordinate={{latitude, longitude}}/>
								</MapView>
							)
						)}
						<GetLocation onLocationReceived={handleLocationReceived} refresh={refresh}/>
						<View style={styles.buttonContainer}>
							<Button title="현재 위치로 변경" onPress={handleRefresh} disabled={isRequestPending}/>
							<Button title="취소" onPress={() => setIsLocVisible(false)} disabled={isRequestPending}/>
						</View>
					</View>
				</Modal>
			)}
			<View style={{width: "90%"}}>
				<TouchableOpacity
					style={[styles.saveButton, {backgroundColor: (editableUserId !== initialUserId && !isDuplicateChecked) ? 'lightgrey' : 'grey'}]}
					onPress={handleSave}
					disabled={editableUserId !== initialUserId && !isDuplicateChecked || isRequestPending}
				>
					<Text style={styles.saveText}>저장</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
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
		color: 'black',
		padding: 7,
		marginTop: 5,
		minWidth: "100%",
		backgroundColor: "white",
	},
	saveButton: {
		flexDirection: "column",
		padding: 18,
		width: "100%",
		borderRadius: 15,
		marginBottom: 30,
	},
	saveText: {
		borderRadius: 10,
		fontSize: 16,
		fontWeight: "600",
		color: 'white',
		minWidth: "100%",
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

