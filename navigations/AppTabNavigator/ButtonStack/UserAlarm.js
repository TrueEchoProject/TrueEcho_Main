import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ActivityIndicator } from 'react-native';
import {AntDesign, FontAwesome5,} from '@expo/vector-icons';
import PagerView from "react-native-pager-view";
import axios from "axios";
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const UserAlarm = ({ route }) => {
	const [userId, setUserId] = useState()
	const [userData, setUserData] = useState(null);
	const [pinData, setPinData] = useState([]);
	const [isFrontShowing, setIsFrontShowing] = useState({});
	const [currentPage, setCurrentPage] = useState(0);
	
	const [isModalVisible, setIsModalVisible] = useState(false);
	const pagerRef = useRef(null);
	
	useEffect(() => {
		if (route.params?.userId) {
			console.log('Received Update response:', route.params.userId);
			setUserId(route.params.userId);
		}
	}, [route.params?.Update]);
	useEffect(() => {
		if (userData) {
			console.log(userData);
		}
	}, [userData]); // userData 변화 감지
	useEffect(() => {
		if (pinData) {
			console.log(pinData);
		}
	}, [pinData]);
	useEffect(() => {
		if (userId) {
			fetchData();
		}
	}, [userId]);  // userId 변경 시 fetchData 호출
	
	const fetchData = async () => {
		try {
			const response = await axios.get(`http://192.168.0.27:3000/user_Data?user_id=${userId}`);
			if (response.data && response.data.length > 0) {
				const userData = response.data[0]; // 첫 번째 사용자 데이터를 가져옴
				setUserData(userData);
				setPinData(userData.pin); // userData 내의 pin 배열을 설정
			} else {
				console.log('No user data returned from API');
			}
		} catch (error) {
			console.error('Error fetching data', error);
		}
	}
	
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
			{!userData ? (
				<View style={styles.loader}>
					<ActivityIndicator size="large" color="#0000ff" />
				</View>
			) : (
				<>
					<View style={styles.topContainer}>
						<View style={{flexDirection: "row"}}>
							<View style={{marginRight: "auto"}}>
								<TouchableOpacity onPress={profileImageModalVisible}>
									<ExpoImage source={{ uri: userData.profile_url }} style={styles.avatar}/>
								</TouchableOpacity>
								{isModalVisible && (
									<ProfileImageModal
										isVisible={isModalVisible}
										imageUrl={userData.profile_url} // 수정: imageUrl 프로퍼티 전달
										onClose={() => setIsModalVisible(false)}
									/>
								)}
								<View style={styles.textContainer}>
									<Text style={styles.name}>{userData.username}</Text>
									<FontAwesome5
										name="crown"
										style={{marginLeft: 10, marginBottom: 10}}
										size={24}
										color="blue"
									/>
								</View>
							</View>
						</View>
						<View style={styles.textContainer}>
							<Text>{userData.user_vote}</Text>
						</View>
					</View>
					<View style={styles.pinsContainer}>
						<View style={{ flexDirection: "row" }}>
							<Text style={styles.pinsTitle}>Pins</Text>
						</View>
						{pinData.length === 0 ? (
							<View style={styles.pinPlus}>
								<TouchableOpacity
									style={{alignItems: "center", padding: 30,}}
								>
									<AntDesign
										name="plussquareo"
										size={40}
										style={{margin: 20,}}
										color="white"
									/>
									<Text style={[styles.pinsText, {textAlign: 'center'}]}>핀을{'\n'}추가해보세요!</Text>
								</TouchableOpacity>
							</View>
						) : (
							<>
								<PagerView
									style={styles.pagerView}
									initialPage={0}
									onPageSelected={handlePageChange}
									ref={pagerRef}
								>
									{pinData.map((item) => (
										<View key={item.pin_id} style={{ position: 'relative' }}>
											<TouchableOpacity onPress={() => changeImage(item.pin_id)}>
												<ExpoImage
													source={{ uri: isFrontShowing[item.pin_id] ? item.post_front_url : item.post_back_url }}
													style={styles.pageStyle}
												/>
											</TouchableOpacity>
										</View>
									))}
								</PagerView>
								<View style={styles.indicatorContainer}>
									{pinData.map((_, index) => (
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
})
export default UserAlarm;