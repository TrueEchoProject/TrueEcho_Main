import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Modal,
	Dimensions,
	Switch,
} from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome6, MaterialIcons, Entypo, Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import
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
	const [isQnAModal, setIsQnAModal] = useState(false);
	
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
	const qnAModalVisible = () => {
		setIsQnAModal(!isQnAModal);
	};
	const NotificationModal = ({ isVisible, onClose }) => {
		const [clickedStatus, setClickedStatus] = useState({});
		const [notificationSettings, setNotificationSettings] = useState({});
		const fetchNotification = async () => {
			try {
				const response = await axios.get(`http://192.168.0.27:3000/notificationSettings`);
				setNotificationSettings(response.data[0]);
			} catch (error) {
				console.error('Error fetching calendar data', error);
			}
		};
		useEffect(() => {
			fetchNotification();
		}, []);
		const updateNotificationSetting = (key, subKey = null) => {
			setNotificationSettings(prev => {
				if (subKey) {  // 배열 내 객체의 서브키를 업데이트하는 경우
					const newValue = !prev[key][0][subKey];
					return {
						...prev,
						[key]: [{ ...prev[key][0], [subKey]: newValue }]
					}} else {  // 단일 키를 업데이트하는 경우
					return {
						...prev,
						[key]: !prev[key]
					}}
			})};
		const toggleClickStatus = (optionId) => {
			setClickedStatus(prev => ({
				...prev,
				[optionId]: !prev[optionId]
			}));
		};
		// 변경사항을 저장하고 모달을 닫는 함수
		const saveChanges = async () => {
			console.log("Saved notificationSettings:", notificationSettings);
			try {
				const Delete = await axios.delete(`http://192.168.0.27:3000/notificationSettings/1`);
				const response = await axios.post(`http://192.168.0.27:3000/notificationSettings`, notificationSettings);
				alert("알림 설정이 성공적으로\n제출되었습니다.");
			} catch (error) {
				console.error('Error posting notification', error);
				alert("알림 설정을 제출하는 중\n오류가 발생했습니다.");
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
						<ScrollView
							style={{width: windowWidth * 0.8,}}
							contentContainerStyle={styles.scrollContent}
						>
							<TouchableOpacity
								style={styles.scrollModalButton}
								onPress={() => toggleClickStatus('community')}
							>
								<Text style={styles.switchButtonText}>커뮤니티</Text>
							</TouchableOpacity>
							{clickedStatus['community'] &&
								<>
									<View style={styles.switchModalButton}>
										<Text style={styles.switchButtonText}>투표 마감/랭킹</Text>
										<Switch
											style={{ marginRight: 10 }}
											trackColor={{ false: "#767577", true: "#3B4664" }}
											thumbColor={ notificationSettings.community[0].vote_ranking ? "#81b0ff" : "#f4f3f4" }
											ios_backgroundColor="#3e3e3e"
											onValueChange={() => updateNotificationSetting('community', 'vote_ranking')}
											value={ notificationSettings.community[0].vote_ranking }
										/>
									</View>
									<View style={styles.switchModalButton}>
										<Text style={styles.switchButtonText}>투표</Text>
										<Switch
											style={{ marginRight: 10 }}
											trackColor={{ false: "#767577", true: "#3B4664" }}
											thumbColor={ notificationSettings.community[0].vote ? "#81b0ff" : "#f4f3f4" }
											ios_backgroundColor="#3e3e3e"
											onValueChange={() => updateNotificationSetting('community', 'vote')}
											value={ notificationSettings.community[0].vote }
										/>
									</View>
								</>
							}
							<TouchableOpacity
								style={styles.scrollModalButton}
								onPress={() => toggleClickStatus('post')}
							>
								<Text style={styles.switchButtonText}>게시물</Text>
							</TouchableOpacity>
							{clickedStatus['post'] &&
								<>
									<View style={styles.switchModalButton}>
										<Text style={styles.switchButtonText}>댓글 추가</Text>
										<Switch
											style={{ marginRight: 10 }}
											trackColor={{ false: "#767577", true: "#3B4664" }}
											thumbColor={ notificationSettings.post[0].newComment ? "#81b0ff" : "#f4f3f4" }
											ios_backgroundColor="#3e3e3e"
											onValueChange={() => updateNotificationSetting('post', 'newComment')}
											value={ notificationSettings.post[0].newComment }
										/>
									</View>
									<View style={styles.switchModalButton}>
										<Text style={styles.switchButtonText}>답글</Text>
										<Switch
											style={{ marginRight: 10 }}
											trackColor={{ false: "#767577", true: "#3B4664" }}
											thumbColor={ notificationSettings.post[0].subComment ? "#81b0ff" : "#f4f3f4" }
											ios_backgroundColor="#3e3e3e"
											onValueChange={() => updateNotificationSetting('post', 'subComment')}
											value={ notificationSettings.post[0].subComment }
										/>
									</View>
									<View style={styles.switchModalButton}>
										<Text style={styles.switchButtonText}>좋아요</Text>
										<Switch
											style={{ marginRight: 10 }}
											trackColor={{ false: "#767577", true: "#3B4664" }}
											thumbColor={ notificationSettings.post[0].postLike ? "#81b0ff" : "#f4f3f4" }
											ios_backgroundColor="#3e3e3e"
											onValueChange={() => updateNotificationSetting('post', 'postLike')}
											value={ notificationSettings.post[0].postLike }
										/>
									</View>
								</>
							}
							<View style={styles.scrollModalButton}>
								<Text style={styles.switchButtonText}>친구요청</Text>
								<Switch
									style={{ marginRight: 10 }}
									trackColor={{ false: "#767577", true: "#3B4664" }}
									thumbColor={ notificationSettings.friendRequest ? "#81b0ff" : "#f4f3f4" }
									ios_backgroundColor="#3e3e3e"
									onValueChange={() => updateNotificationSetting('friendRequest')}
									value={ notificationSettings.friendRequest }
								/>
							</View>
							<View style={styles.scrollModalButton}>
								<Text style={styles.switchButtonText}>PhotoTime</Text>
								<Switch
									style={{ marginRight: 10 }}
									trackColor={{ false: "#767577", true: "#3B4664" }}
									thumbColor={ notificationSettings.PhotoTime ? "#81b0ff" : "#f4f3f4" }
									ios_backgroundColor="#3e3e3e"
									onValueChange={() => updateNotificationSetting('PhotoTime')}
									value={ notificationSettings.PhotoTime }
								/>
							</View>
						</ScrollView>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: '#4CAF50', marginTop: 20, }]}
							onPress={saveChanges}
						>
							<Text style={styles.buttonText}>저장</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: "grey", marginBottom: 20,  }]}
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
		const [editButton, setEditButton] = useState(false);
		const [blockedStatus, setBlockedStatus] = useState({});
		const [originalStatus, setOriginalStatus] = useState({});
		const [blockedUsers, setBlockedUsers] = useState([]);
		
		const fetchBlockedUsers = async () => {
			try {
				const response = await axios.get(`http://192.168.0.27:3000/blocked_users`);
				setBlockedUsers(response.data);
			} catch (error) {
				console.error('Error fetching calendar data', error);
			}
		};
		useEffect(() => {
			console.log(blockedUsers);
		}, [blockedUsers]);
		
		useEffect(() => {
			fetchBlockedUsers();
		}, []);
		
		// 각 사용자의 차단 상태를 초기화합니다.
		useEffect(() => {
			const initialStatus = blockedUsers.reduce((status, user) => {
				status[user.id] = false; // 초기 상태를 false로 설정합니다.
				return status;
			}, {});
			setBlockedStatus(initialStatus);
		}, [blockedUsers]);
		// 편집 상태를 시작할 때의 차단된 사용자 상태를 저장합니다.
		const startEditing = () => {
			setOriginalStatus({ ...blockedStatus });
			setEditButton(true);
		};
		// 편집 취소 함수
		const cancelEditing = () => {
			setBlockedStatus(originalStatus);
			setEditButton(false);
		};
		const toggleBlockStatus = (userId) => {
			setBlockedStatus(prevStatus => ({
				...prevStatus,
				[userId]: !prevStatus[userId]
			}));
		};
		// 저장 버튼 클릭 시 호출되는 함수
		const handleSave = async () => {
			// 변경된 사항이 있는지 확인합니다.
			const hasChanges = Object.keys(blockedStatus).some(id => blockedStatus[id] !== originalStatus[id]);
			if (hasChanges) {
				// blockedStatus에서 차단 해제된 사용자의 ID를 추출합니다.
				const unblockedIds = Object.keys(blockedStatus).filter(id => !blockedStatus[id]);
				// blockedUsers 배열에서 해당 ID의 사용자 정보를 찾습니다.
				const unblockedUserInfo = blockedUsers.filter(user => unblockedIds.includes(String(user.id)));
				
				try {
					await axios.delete('http://192.168.0.27:3000/blocked_users');
					const response = await axios.post('http://192.168.0.27:3000/blocked_users', unblockedUserInfo);
					console.log('서버 응답:', response.data);
				} catch (error) {
					console.error('Error updating blocked users:', error);
				}
			}
			// 모달을 닫습니다.
			onClose();
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
						<Text style={[styles.modalText, { marginTop: "8%", }]}>차단된 친구</Text>
						<Text style={[styles.modalSmallText, { marginBottom: "3%", }]}> 차단을 편집하세요</Text>
						{ blockedUsers.length === 0 ? (
							<View style={styles.blockNone}>
								<Text>차단한 친구가 없어요</Text>
							</View>
						) : (
							<>
								<ScrollView
									style={{width: windowWidth * 0.8,}}
									contentContainerStyle={styles.scrollContent}
								>
									{blockedUsers.map((user) => (
										<View key={user.id} style={styles.scrollModalButton}>
											<ExpoImage
												style={styles.profileImage}
												source={{ uri: user.profile_url }}
											/>
											<Text style={styles.buttonText}>{user.username}</Text>
											{ editButton && (
												<TouchableOpacity
													style={[
														styles.blockedButton,
													]}
													onPress={() => toggleBlockStatus(user.id)}
												>
													{blockedStatus[user.id] ? (
														<AntDesign name="checksquare" size={30} color="black" />
													) : (
														<AntDesign name="checksquareo" size={30} color="black" />
													)}
												</TouchableOpacity>
											)}
										</View>
									))}
								</ScrollView>
								<View style={styles.blockedModalButton}>
									{!editButton ? (
										<TouchableOpacity
											style={[styles.blockedModalSaveButton, { backgroundColor: "#99A1F6", }]}
											onPress={startEditing}                  >
											<Text style={styles.buttonText}>편집</Text>
										</TouchableOpacity>
									) : (
										<TouchableOpacity
											style={[styles.blockedModalSaveButton, { backgroundColor: "#3B4664", }]}
											onPress={cancelEditing}
										>
											<Text style={styles.buttonText}>편집 취소</Text>
										</TouchableOpacity>
									)}
									<TouchableOpacity
										style={styles.blockedModalSaveButton}
										onPress={handleSave}
									>
										<Text style={styles.buttonText}>저장</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: "grey", marginBottom: "8%", }]}
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
				const response = await axios.get(`http://192.168.0.27:3000/Time`);
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
				const Delete = await axios.delete(`http://192.168.0.27:3000/Time/1`);
				const response = await axios.post(`http://192.168.0.27:3000/Time`, Time_type);
				// 서버의 응답 상태 코드에 따라 다른 메시지를 표시합니다.
				if (response.status === 201) {
					alert('변경 사항이 성공적으로 제출되었습니다.');
				} else if (response.status === 400) {
					alert('잘못된 요청입니다. 다시 시도해주세요.');
				}
			} catch (error) {
				console.error('Error posting data:', error);
				alert('데이터를 제출하는 중 오류가 발생했습니다.');
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
						<ScrollView
							style={{width: windowWidth * 0.8,}}
							contentContainerStyle={styles.scrollContent}
						>
							<TouchableOpacity
								onPress={() => handleTimeTypeChange(0)}
								style={Time_type.type === 0 ? styles.selectedModalButton : styles.modalButton }
							>
								<Text style={styles.buttonText}>00 ~ 07</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleTimeTypeChange(1)}
								style={Time_type.type === 1 ? styles.selectedModalButton : styles.modalButton }
							>
								<Text style={styles.buttonText}>07 ~ 12</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleTimeTypeChange(2)}
								style={Time_type.type === 2 ? styles.selectedModalButton : styles.modalButton }
							>
								<Text style={styles.buttonText}>12 ~ 15</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleTimeTypeChange(3)}
								style={Time_type.type === 3 ? styles.selectedModalButton : styles.modalButton }
							>
								<Text style={styles.buttonText}>15 ~ 18</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleTimeTypeChange(4)}
								style={Time_type.type === 4 ? styles.selectedModalButton : styles.modalButton }
							>
								<Text style={styles.buttonText}>18 ~ 21</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => handleTimeTypeChange(5)}
								style={Time_type.type === 5 ? styles.selectedModalButton : styles.modalButton }
							>
								<Text style={styles.buttonText}>21 ~ 24</Text>
							</TouchableOpacity>
						</ScrollView>
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
	const QnAModal = ({ isVisible, onClose }) => {
		const [QnA, setQnA] = useState([]);
		const [answerShowing, setAnswerShowing] = useState({});
		
		const fetchAnswer = async () => {
			try {
				const response = await axios.get(`http://192.168.0.27:3000/QnA`);
				setQnA(response.data);
				console.log(response.data);
			} catch (error) {
				console.error('Error fetching calendar data', error);
			}
		}
		useEffect(() => {
			fetchAnswer();
		}, []);
		
		const toggleAnswerVisible = (id) => {
			setAnswerShowing(prev => ({
				...prev,
				[id]: !prev[id]
			}));
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
						<Text style={styles.modalText}>QnA</Text>
						<Text style={styles.modalSmallText}>자주 받는 질문들에 대해 답변해드려요</Text>
						<ScrollView
							style={{ width: windowWidth * 0.8, }}
							contentContainerStyle={styles.scrollContent}
						>
							{QnA.map(item => (
								<View key={item.id} style={{ width: "80%", alignItems: "center" }}>
									<TouchableOpacity onPress={() => toggleAnswerVisible(item.id)} style={styles.QContainer}>
										<Text style={styles.QnAText}>Q.{item.id}</Text>
										<Text style={styles.QnASubText}>{item.Q}</Text>
									</TouchableOpacity>
									{answerShowing[item.id] && (
										<View style={styles.AContainer}>
											<Text style={styles.QnAText}>A.{item.id}</Text>
											<Text style={styles.QnASubText}>{item.A}</Text>
										</View>
									)}
								</View>
							))}
						</ScrollView>
						<TouchableOpacity style={[styles.modalButton, { backgroundColor: "grey", margin: 15, }]} onPress={onClose}>
							<Text style={styles.buttonText}>닫기</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		);
	};
	const logOut = () => {
		console.log("logOut")
	};
	const deleteAccount = () => {
		console.log("deleteAccount")
	};
	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<TouchableOpacity onPress={() => navigation.navigate('내 설정 편집', { user: user })} style={styles.View}>
					<ExpoImage source={{ uri: user.profile_url }} style={styles.Image}/>
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
						iconType={Entypo}
						icon="chat"
						label="도움받기"
						onPress={qnAModalVisible}
					/>
					{isQnAModal && (
						<QnAModal
							isVisible={isQnAModal}
							onClose={() => setIsQnAModal(false)}
						/>
					)}
				</View>
				<View style={{ marginTop: 30 }}>
					<OptionItem
						iconType={Entypo}
						icon="log-out"
						label="로그아웃"
						backgroundColor="grey"
						onPress={logOut}
					/>
					<OptionItem
						iconType={Ionicons}
						icon="alert-circle"
						label="계정 삭제"
						backgroundColor="red"
						onPress={deleteAccount}
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
		width: windowWidth * 0.65,
		borderRadius: 10,
		borderColor: 'black',
		backgroundColor: '#81b0ff',
	},
	profileImage: {
		height: 30,
		width: 30,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: "grey",
		marginHorizontal: 10,
	},
	scrollContent: {
		alignItems: 'center', // 컨텐츠를 가운데 정렬
	},
	switchButtonText: {
		marginLeft: 10,
		marginRight: "auto",
		color: "black",
		fontSize: 15,
		fontWeight: "bold",
		textAlign: "center",
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
	switchModalButton: {
		flexDirection: "row",
		width: "60%",
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#99A1B6",
		borderColor: 'black',
		alignItems: 'center',
		margin: 10,
	},
	scrollModalButton :{
		flexDirection: "row",
		width: "85%",
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#99A1B6",
		borderColor: 'black',
		alignItems: 'center',
		margin: "3%",
	},
	blockedModalSaveButton: {
		width: "45%",
		margin: "5%",
		height: "100%",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "black",
		justifyContent: "center",
		backgroundColor: "#4CAF50",
	},
	blockedModalButton: {
		width: "80%",
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		margin: "3%",
		flexDirection: "row",
		borderColor:"white",
		backgroundColor: 'white',
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
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#3B4664",
		borderColor: 'black',
		alignItems: 'center',
		justifyContent: 'center',
		margin: "3%",
	},
	blockedButton: {
		marginLeft: "auto",
		marginRight: 10,
		width:30,
		height: 30,
		borderRadius: 5,
		backgroundColor: "white",
	},
	blockNone : {
		height: "70%",
		width: "80%",
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: "10%",
		marginRight: "10%",
		backgroundColor: "#f4f3f4",
		padding: 10,
		borderWidth: 1,
		borderColor: "black",
	},
	QnAText: {
		fontSize: 15,
		fontWeight: "bold",
		marginLeft: 10,
	},
	QnASubText: {
		fontSize: 12,
		fontWeight: "400",
		marginLeft: 10,
	},
	QContainer: {
		marginTop: 10,
		width: "100%",
		height: 50,
		borderRadius: 10,
		borderWidth: 1,
		backgroundColor: "#99A1B6",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
	},
	AContainer: {
		padding: 5, // 텍스트 주위에 공간을 추가합니다.
		width: "95%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		marginVertical: 5,
	},
})
export default MyOptions;