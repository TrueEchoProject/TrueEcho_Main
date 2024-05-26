import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ActivityIndicator } from 'react-native';
import {AntDesign, FontAwesome5,} from '@expo/vector-icons';
import PagerView from "react-native-pager-view";
import axios from "axios";
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const UserAlarm = ({ route }) => {
	const [userId, setUserId] = useState(251)
	const [serverUserData, setServerUserData] = useState({}); // 서버 유저 데이터
	const [serverPinData, setServerPinData] = useState([]); // 서버 핀 데이터
	const [isFriend, setIsFriend] = useState(false); // 친구 여부
	const [friendLook, setFriendLook] = useState(true); // 친구 여부
	const [isFrontShowing, setIsFrontShowing] = useState({});
	const [currentPage, setCurrentPage] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const pagerRef = useRef(null);
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	useEffect(() => {
		if (route.params?.userId) {
			console.log('Received Update response:', route.params.userId);
			setUserId(route.params.userId);
		}
	}, [route.params?.Update]);
	useEffect(() => {
		if (serverUserData) {
			console.log("server user",serverUserData);
		}
	}, [serverUserData]);
	useEffect(() => {
		if (serverPinData) {
			console.log("server pin",serverPinData);
		}
	}, [serverPinData]);
	useEffect(() => {
		if (isFriend) {
			console.log("friend",isFriend);
		}
	}, [isFriend]);
	useEffect(() => {
		fetchData();
	}, []);
	
	const fetchData = async () => {
		try {
			const serverResponse = await axios.get(`${base_url}/setting/myPage?userId=${userId}`, {
				headers: {
					Authorization: `${token}`
				}
			});
			if (serverResponse.data) {
				setServerUserData(serverResponse.data.data.pageInfo);
				setServerPinData(serverResponse.data.data.pinList.pinList);
				setIsFriend(serverResponse.data.data.friend);
			} else {
				console.log('No user data returned from API');
			}
		} catch (error) {
			console.error('Error fetching data', error);
		}
	}
	const toggleFriendSend = async () => {
		console.log(userId, 'userId');
		try {
			const formData = new FormData();
			formData.append('targetUserId', userId);
			
			const response = await axios.post(`${base_url}/friends/add`, formData, {
				headers: {
					Authorization: `${token}`,
					'Content-Type': 'multipart/form-data',
				}
			});
			console.log('Send updated successfully', response.data, userId);
			setFriendLook(false);
		} catch (error) {
			console.error('Error updating Send:', error);
		}
	};
	
	const changeImage = (pinId) => {
		setIsFrontShowing(prev => ({
			...prev,
			[pinId]: !prev[pinId]
		}));
	};
	const profileImageModalVisible = () => {
		setIsModalVisible(!isModalVisible);
	};
	const handlePageChange = (e) => {
		setCurrentPage(e.nativeEvent.position);
	};
	
	const ProfileImageModal = ({ isVisible, imageUrl, onClose }) => { // 수정: 프로퍼티 이름 Image -> imageUrl 변경
		return (
			<Modal
				animationType="fade"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalContainer}>
					<View style={styles.imageContainer}>
						<TouchableOpacity onPress={onClose}>
							<Text style={styles.buttonText}>닫기</Text>
						</TouchableOpacity>
						<ExpoImage
							source={{ uri: imageUrl }} // 수정: imageUrl을 사용
							style={styles.smallImage}
						/>
					</View>
				</View>
			</Modal>
		);
	};
	
	return (
		<View style={styles.container}>
			{!serverUserData ? (
				<View style={styles.loader}>
					<ActivityIndicator size="large" color="#0000ff" />
				</View>
			) : (
				<>
					<View style={styles.topContainer}>
						<View style={{flexDirection: "row"}}>
							<View style={{marginRight: "auto"}}>
								<TouchableOpacity onPress={profileImageModalVisible}>
									<ExpoImage source={{ uri: serverUserData.profileUrl ? serverUserData.profileUrl : defaultImage }} style={styles.avatar}/>
								</TouchableOpacity>
								{isModalVisible && (
									<ProfileImageModal
										isVisible={isModalVisible}
										imageUrl={serverUserData.profileUrl} // 수정: imageUrl 프로퍼티 전달
										onClose={() => setIsModalVisible(false)}
									/>
								)}
								<View style={styles.textContainer}>
									<Text style={styles.name}>{serverUserData.username}</Text>
									<FontAwesome5
										name="crown"
										style={{marginLeft: 10, marginBottom: 10}}
										size={24}
										color="blue"
									/>
								</View>
							</View>
							{!isFriend && ( friendLook === true ? (
									<View style={styles.friendButton}>
										<TouchableOpacity onPress={toggleFriendSend}>
											<Text style={{fontSize: 15, color: "white",}}>
												친구 추가
											</Text>
										</TouchableOpacity>
									</View>
								) : (
									<View style={styles.friendButton}>
										<Text style={{fontSize: 15, color: "white",}}>
											추가 완료
										</Text>
									</View>
								)
							)}
						</View>
						<View style={styles.textContainer}>
							<Text>{serverUserData.mostVotedTitle ? serverUserData.mostVotedTitle : "투표를 진행해주세요!"}</Text>
						</View>
					</View>
					<View style={styles.pinsContainer}>
						<View style={{ flexDirection: "row" }}>
							<Text style={styles.pinsTitle}>Pins</Text>
						</View>
						{serverPinData.length === 0 ? (
							<View style={styles.pinPlus}>
								<View
									style={{alignItems: "center", padding: 30,}}
								>
									<AntDesign
										name="plussquareo"
										size={40}
										style={{margin: 20,}}
										color="white"
									/>
									<Text style={[styles.pinsText, {textAlign: 'center'}]}>아직{'\n'}핀이 없어요...</Text>
								</View>
							</View>
						) : (
							<>
								<PagerView
									style={styles.pagerView}
									initialPage={0}
									onPageSelected={handlePageChange}
									ref={pagerRef}
								>
									{serverPinData.map((item) => (
										<View key={item.pinId} style={{ position: 'relative' }}>
											<TouchableOpacity onPress={() => changeImage(item.pinId)}>
												<ExpoImage
													source={{ uri: isFrontShowing[item.pinId] ? item.postFrontUrl : item.postBackUrl }}
													style={styles.pageStyle}
												/>
											</TouchableOpacity>
										</View>
									))}
								</PagerView>
								<View style={styles.indicatorContainer}>
									{serverPinData.map((item, index) => (
										<Text key={index} style={[styles.indicator, index === currentPage ? styles.activeIndicator : null]}>
											&#9679;
										</Text>
									))}
								</View>
							</>
						)}
					</View>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	topContainer: {
		flexGrow: 0,
		margin: 15,
		marginBottom: 10,
	},
	pinsContainer: {
		height: windowHeight * 0.59,
		marginHorizontal: 15,
		marginBottom: 20, // 하단 마진을 추가합니다.
	},
	pinsTitle: {
		fontSize: 25,
		fontWeight: "300",
	},
	pinsText: {
		fontSize: 25,
		fontWeight: "300",
		color: "white"
	},
	pagerView: {
		flex: 1,
	},
	pageStyle: {
		marginTop: 10,
		width: "100%",
		height: "97%",
		borderRadius: 10,
	},
	pinPlus: {
		marginTop: 10,
		width: "100%",
		height: "90%",
		borderRadius: 10,
		backgroundColor: "grey",
		alignItems: 'center',
		justifyContent: 'center',
		padding: 30,
	},
	textContainer: {
		flexDirection: "row",
		alignItems: 'flex-end',
		marginTop: 5,
	},
	avatar: {
		width: 70,
		height: 70,
		borderRadius: 35,
	},
	name: {
		fontSize: 30,
		fontWeight: "300",
	},
	indicatorContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 5,
	},
	indicator: {
		margin: 3,
		color: 'grey',
	},
	activeIndicator: {
		color: 'blue',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonText: {
		color: "black",
		fontSize: 15,
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 15,
	},
	imageContainer: {
		width: windowWidth * 0.8,
		height: windowHeight * 0.6,
		borderRadius: 12,
		backgroundColor: 'white',
	},
	smallImage: {
		marginTop: 13,
		width: windowWidth * 0.8,
		height: windowHeight * 0.6,
		borderRadius: 12,
	},
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	friendButton: {
		backgroundColor: "#3B4664",
		padding: 5,
		height: 35,
		marginBottom: 5,
		borderRadius: 3,
		justifyContent: "center",
	},
})
export default UserAlarm;