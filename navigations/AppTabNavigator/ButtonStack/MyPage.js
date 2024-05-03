import React, { useState, useEffect, } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import PagerView from "react-native-pager-view";
import axios from "axios";
import { Image } from "expo-image";
import { Button3 } from "../../../components/Button";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const MyPage = ({ navigation, route }) => {
	const [userData, setUserData] = useState(null);
	const [pinData, setPinData] = useState([]);
	const [isFrontShowing, setIsFrontShowing] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const [isLoading, setIsLoading] = useState(true);  // 로딩 상태 추가
	const [isModalVisible, setIsModalVisible] = useState(false);
	
	useEffect(() => {
		if (route.params?.pinRes) {
			console.log('Received pin response:', route.params.pinRes);
			setPinData(route.params.pinRes.pins);
		}
	}, [route.params?.pinRes]);
	const changeImage = () => {
		setIsFrontShowing(!isFrontShowing);
	};
	const profileImageModalVisible = () => {
		setIsModalVisible(!isModalVisible);
	};
	const handlePageChange = (e) => {
		setCurrentPage(e.nativeEvent.position);
	};
	const fetchData = async () => {
		setIsLoading(true);
		try {
			const userResponse = await axios.get(`http://192.168.0.3:3000/user_me`);
			const pinResponse = await axios.get(`http://192.168.0.3:3000/user_pin?_limit=5`);
			setUserData(userResponse.data[0]);
			setPinData(pinResponse.data);
		} catch (error) {
			console.error('Error fetching data', error);
		} finally {
			setIsLoading(false);
		}
	};
	
	useEffect(() => {
		if (pinData) {
			console.log(pinData);
		}
	}, [pinData]);
	
	useEffect(() => {
		if (userData) {
			console.log(userData);
		}
	}, [userData]); // userData 변화 감지
	
	useEffect(() => {
		fetchData();
	}, []);
	
	if (isLoading) {
		return <Text>Loading...</Text>;  // 로딩 중 표시
	}
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
						<TouchableOpacity
							onPress={onClose}
						>
							<Text style={styles.buttonText}>
								닫기
							</Text>
						</TouchableOpacity>
						<Image
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
			<View style={{flexDirection: 'row'}}>
				<Button3 onPress={() => navigation.navigate('MyOp', { user: userData })} />
			</View>
			<View style={styles.topContainer}>
				<TouchableOpacity onPress={profileImageModalVisible}>
					<Image source={{ uri: userData.profile_url }} style={styles.avatar}/>
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
				<View style={styles.textContainer}>
					<Text>{userData.user_vote}</Text>
				</View>
			</View>
			<View style={styles.pinsContainer}>
				<Text style={styles.pinsTitle}>Pins</Text>
				{pinData.length <= 4 ? (
					<PagerView
						style={styles.pagerView}
						initialPage={0}
						onPageSelected={handlePageChange}
					>
						{pinData.map((item) => (
							<View key={item.pin_id} style={{ position: 'relative' }}>
								<TouchableOpacity onPress={changeImage}>
									<Image
										source={{ uri: isFrontShowing ? item.post_front_url : item.post_back_url }}
										style={styles.pageStyle}
									/>
								</TouchableOpacity>
							</View>
						))}
						<View key="additionalPage" style={styles.pinPlus}>
							<TouchableOpacity
								style={{alignItems: "center", padding: 30,}}
								onPress={() => navigation.navigate('캘린더')}
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
					</PagerView>
				) : (
					<PagerView
						style={styles.pagerView}
						initialPage={0}
						onPageSelected={handlePageChange}
					>
						{pinData.map((item) => (
							<View key={item.pin_id} style={{ position: 'relative' }}>
								<TouchableOpacity onPress={changeImage}>
									<Image
										source={{ uri: isFrontShowing ? item.post_front_url : item.post_back_url }}
										style={styles.pageStyle}
									/>
								</TouchableOpacity>
							</View>
						))}
					</PagerView>
				)}
				<View style={styles.indicatorContainer}>
					{pinData.map((_, index) => (
						<Text key={index} style={[styles.indicator, index === currentPage ? styles.activeIndicator : null]}>
							&#9679;
						</Text>
					))}
				</View>
			</View>
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
		flex: 1,
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
		height: "97%",
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
})
export default MyPage;