import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, } from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome6, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import axios from "axios";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const OptionText = ({ label }) => {
	return <Text style={styles.smallText}>{label}</Text>;
};
const OptionItem = ({ onPress, icon, iconType, label, backgroundColor = "#99A1B6" }) => {
	const IconComponent = iconType;
	return (
		<TouchableOpacity onPress={onPress}>
			<View style={[styles.View, { backgroundColor }]}>
				<IconComponent name={icon} style={{marginRight: 15}} size={30} color="black" />
				<Text style={styles.smallText}>{label}</Text>
			</View>
		</TouchableOpacity>
	);
};

const MyOptions = ({ navigation, route }) => {
	const [user, setUser] = useState({})
	const [isNotificationModal, setIsNotificationModal] = useState(false);
	const [isBlockModal, setIsBlockModal] = useState(false);
	const [isTimeModal, setIsTimeModal] = useState(false);
	
	useEffect(() => {
		if (route.params?.user) {
			console.log('Received user response:', route.params.user);
			setUser(route.params.user);
		}
	}, [route.params?.user]);
	
	useEffect(() => {
		if (user) {
			console.log('profile_url:', user.profile_url);
			console.log('user_vote:', user.user_vote);
			console.log('username:', user.username);
			console.log('user_Id:', user.user_Id);
			console.log('your_location:', user.your_location);
		}
	}, [user]);
	
	const notificationModalVisible = () => {
		setIsNotificationModal(!isNotificationModal);
	};
	const blockModalVisible = () => {
		setIsBlockModal(!isBlockModal);
	};
	const timeModalVisible = () => {
		setIsTimeModal(!isTimeModal);
	};
	
	const NotificationModal = ({ isVisible, onClose }) => {
		const [notificationSettings, setNotificationSettings] = useState({});
		
		const fetchNotification = async () => {
			try {
				const response = await axios.get(`http://192.168.0.3:3000/notificationSettings`);
				setNotificationSettings(response.data[0]);
			} catch (error) {
				console.error('Error fetching calendar data', error);
			}
		};
		useEffect(() => {
			fetchNotification();
		}, []);
		// 각 알림 설정을 토글하는 함수
		const toggleSetting = (key) => {
			setNotificationSettings(prev => ({
				...prev,
				[key]: !prev[key]
			}));
			console.log('notificationSettings3:', notificationSettings);
		};
		
		// 변경사항을 저장하고 모달을 닫는 함수
		const saveChanges = async () => {
			console.log("Saved notificationSettings:", notificationSettings);
			try {
				const Delete = await axios.delete(`http://192.168.0.3:3000/notificationSettings/1`);
				const response = await axios.post(`http://192.168.0.3:3000/notificationSettings`, notificationSettings);
				alert("알림 설정이 성공적으로 제출되었습니다.");
			} catch (error) {
				console.error('Error posting notification', error);
				alert("알림 설정을 제출하는 중 오류가 발생했습니다.");
			}
			onClose(); // 설정을 저장한 후 모달을 닫습니다.
		};
		
		return (
			<Modal
				animationType="fade"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.imageContainer}>
						<Text style={styles.modalText}>알림 설정</Text>
						<Text style={styles.modalSmallText}>알림의 on/off를 설정해주세요!</Text>
						<TouchableOpacity style={styles.modalButton} onPress={() => toggleSetting('mention')}>
							<Text style={styles.buttonText}>멘션/태그 {notificationSettings.mention ? "ON" : "OFF"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalButton} onPress={() => toggleSetting('likes')}>
							<Text style={styles.buttonText}>댓글 좋아요 {notificationSettings.likes ? "ON" : "OFF"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalButton} onPress={() => toggleSetting('friendRequest')}>
							<Text style={styles.buttonText}>친구요청 {notificationSettings.friendRequest ? "ON" : "OFF"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.modalButton} onPress={() => toggleSetting('voteNotification')}>
							<Text style={styles.buttonText}>투표알림 {notificationSettings.voteNotification ? "ON" : "OFF"}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
							onPress={saveChanges}
						>
							<Text style={styles.buttonText}>저장</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: "grey" }]}
							onPress={onClose}
						>
							<Text style={styles.buttonText}>닫기</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	};
	
	const BlockModal = ({ isVisible, onClose }) => {
		return (
			<Modal
				animationType="fade"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.imageContainer}>
						<Text style={[styles.modalText, { marginTop: "10%", }]}>차단된 친구</Text>
						<Text style={styles.modalSmallText}>차단을 편집하세요</Text>
						<ScrollView
							style={styles.scrollContainer}
							contentContainerStyle={styles.scrollContent}
						>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 1</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 2</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 3</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 4</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 5</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 6</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 7</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 8</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.modalButton}>
								<Text style={styles.buttonText}>user 9</Text>
							</TouchableOpacity>
						</ScrollView>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: '#4CAF50', marginTop: "10%", }]}
							onPress={onClose}
						>
							<Text style={styles.buttonText}>저장</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: "grey", marginBottom: "10%", }]}
							onPress={onClose}
						>
							<Text style={styles.buttonText}>닫기</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	};
	
	const TimeModal = ({ isVisible, onClose }) => {
		const [Time_type, setTime_type] = useState({});
		const fetchTime_type = async () => {
			try {
				const response = await axios.get(`http://192.168.0.3:3000/Time`);
				setTime_type(response.data[0]);
				console.log(response.data[0]);
			} catch (error) {
				console.error('Error fetching calendar data', error);
			}
		};
		useEffect(() => {
			fetchTime_type();
		}, []);
		// 변경사항을 저장하고 모달을 닫는 함수
		const saveChanges = async () => {
			console.log("Saved Time_type:", Time_type);
			try {
				const Delete = await axios.delete(`http://192.168.0.3:3000/Time/1`);
				const response = await axios.post(`http://192.168.0.3:3000/Time`, Time_type);
				alert(`Photo Time이 성공적으로\n제출되었습니다.`);
			} catch (error) {
				console.error('Error posting notification', error);
				alert("Photo Time을 제출하는 중\n오류가 발생했습니다.");
			}
			onClose(); // 설정을 저장한 후 모달을 닫습니다.
		};
		const handleTimeTypeChange = (type) => {
			setTime_type(prevState => ({
				...prevState,
				type: type
			}));
			console.log('Time_type:', Time_type);
		};
		return (
			<Modal
				animationType="fade"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.imageContainer}>
						<Text style={styles.modalText}>Photo Time</Text>
						<Text style={styles.modalSmallText}>사진을 찍을 시간을 정해주세요!</Text>
						<TouchableOpacity
							onPress={() => handleTimeTypeChange(0)}
							style={Time_type.type === 0 ? styles.selectedModalButton : styles.modalButton }
						>
							<Text style={styles.buttonText}>0-6</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => handleTimeTypeChange(1)}
							style={Time_type.type === 1 ? styles.selectedModalButton : styles.modalButton }
						>
							<Text style={styles.buttonText}>7-12</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => handleTimeTypeChange(2)}
							style={Time_type.type === 2 ? styles.selectedModalButton : styles.modalButton }
						>
							<Text style={styles.buttonText}>13-18</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => handleTimeTypeChange(3)}
							style={Time_type.type === 3 ? styles.selectedModalButton : styles.modalButton }
						>
							<Text style={styles.buttonText}>19-24</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: '#4CAF50', }]}
							onPress={saveChanges}
						>
							<Text style={styles.buttonText}>저장</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: "grey" }]}
							onPress={onClose}
						>
							<Text style={styles.buttonText}>닫기</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	};
	
	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<TouchableOpacity onPress={() => navigation.navigate('내 설정 편집', { user: user })} style={styles.View}>
					<Image source={{ uri: user.profile_url }} style={styles.Image}/>
					<View style={{ marginLeft: 10 }}>
						<Text style={styles.Text}>{user.username}</Text>
						<Text style={styles.Text}>{user.user_Id}</Text>
					</View>
				</TouchableOpacity>
				<View>
					<OptionText label="기능" />
					<OptionItem
						iconType={FontAwesome5}
						icon="calendar-alt"
						label="캘린더"
						onPress={() => navigation.navigate('캘린더')}
					/>
				</View>
				<View>
					<OptionText label="설정" />
					<OptionItem
						iconType={AntDesign}
						icon="bells"
						label="알림"
						onPress={notificationModalVisible}
					/>
					{isNotificationModal && (
						<NotificationModal
							isVisible={isNotificationModal}
							onClose={() => setIsNotificationModal(false)}
						/>
					)}
					<OptionItem
						iconType={FontAwesome6}
						icon="user-shield"
						label="차단 유저 관리"
						onPress={blockModalVisible}
					/>
					{isBlockModal && (
						<BlockModal
							isVisible={isBlockModal}
							onClose={() => setIsBlockModal(false)}
						/>
					)}
					<OptionItem
						iconType={MaterialIcons}
						icon="phonelink-ring"
						label="Photo Time"
						onPress={timeModalVisible}
					/>
					{isTimeModal && (
						<TimeModal
							isVisible={isTimeModal}
							onClose={() => setIsTimeModal(false)}
						/>
					)}
				</View>
				<View>
					<OptionText label="더보기" />
					<OptionItem
						iconType={AntDesign}
						icon="sharealt"
						label="공유"
					/>
					<OptionItem
						iconType={Entypo}
						icon="chat"
						label="도움받기"
					/>
				</View>
				<View style={{ marginTop: 30 }}>
					<OptionItem
						iconType={Entypo}
						icon="log-out"
						label="로그아웃"
						backgroundColor="grey"
					/>
					<OptionItem
						iconType={Ionicons}
						icon="alert-circle"
						label="계정 삭제"
						backgroundColor="red"
					/>
				</View>
			</ScrollView>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	scrollView: {
		margin: 20,
	},
	View: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
		borderRadius: 15,
		backgroundColor: "#99A1B6",
		marginBottom: 10,
	},
	Image: {
		width: 74,
		height: 74,
		borderRadius: 37,
		backgroundColor: 'white',
	},
	Text: {
		fontSize: 20,
		fontWeight: "300",
	},
	smallText: {
		fontSize: 18,
		fontWeight: "300",
		margin: 5,
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
		height: windowHeight * 0.7,
		borderRadius: 20,
		backgroundColor: 'white',
	},
	scrollContainer: {
		width: windowWidth * 0.8,
		backgroundColor: 'white',
	},
	scrollContent: {
		alignItems: 'center', // 컨텐츠를 가운데 정렬
	},
	buttonText: {
		color: "black",
		fontSize: 15,
		fontWeight: "bold",
		textAlign: "center",
	},
	modalText: {
		color: "black",
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 10,
	},
	modalSmallText: {
		color: "black",
		fontSize: 12,
		textAlign: "center",
		marginTop: 3,
		marginBottom: 5,
	},
	modalButton: {
		width: "80%",
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#99A1B6",
		borderColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
		margin: "3%",
	},
	selectedModalButton: {
		width: "80%",
		height: "10%",
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#3B4664",
		borderColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
		margin: "3%",
	},
})
export default MyOptions;