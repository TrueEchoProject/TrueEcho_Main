import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Modal,
	Dimensions,
	ActivityIndicator,
	Image,
} from "react-native";
import Api from "../../../Api";
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

const ITEM_WIDTH = wp(100);
const ITEM_HEIGHT = hp(57);

const UserAlarm = ({ route }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [userId, setUserId] = useState(route.params?.userId);
	const [serverUserData, setServerUserData] = useState(null); // 서버 유저 데이터를 null로 초기화
	const [serverPinData, setServerPinData] = useState([]); // 서버 핀 데이터를 빈 배열로 초기화
	const [isFriend, setIsFriend] = useState(false); // 친구 여부
	const [friendLook, setFriendLook] = useState(true); // 친구 여부
	const [isFrontShowing, setIsFrontShowing] = useState({});
	const [currentPage, setCurrentPage] = useState(0);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	useEffect(() => {
		if (route.params?.userId) {
			console.log('Received Update response:', route.params.userId);
			setUserId(route.params.userId);
		}
	}, [route.params?.userId]);
	useEffect(() => {
		if (isFriend) {
			console.log("friend", isFriend);
		}
	}, [isFriend]);
	useEffect(() => {
		fetchData();
	}, []);
	
	const fetchData = async () => {
		try {
			const serverResponse = await Api.get(`/setting/myPage?userId=${userId}`);
			if (serverResponse.data) {
				console.log(serverResponse.data.data)
				setServerUserData(serverResponse.data.data.pageInfo);
				setServerPinData(serverResponse.data.data.pinList.pinList || []); // 배열로 초기화
				setIsFriend(serverResponse.data.data.friend);
			} else {
				console.log('No user data returned from API');
				setServerPinData([]); // 에러 발생 시 빈 배열로 설정
			}
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching data', error);
			setServerPinData([]); // 에러 발생 시 빈 배열로 설정
		}
	};
	const toggleFriendSend = async () => {
		console.log(userId, 'userId');
		try {
			const formData = new FormData();
			formData.append('targetUserId', userId);
			
			const response = await Api.post(`/friends/add`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			console.log('Send updated successfully', response.data, userId);
			setFriendLook(false);
		} catch (error) {
			console.error('Error updating Send:', error);
		}
	};
	
	const profileImageModalVisible = () => {
		setIsModalVisible(!isModalVisible);
	};
	const ProfileImageModal = ({ isVisible, imageUrl, onClose }) => {
		return (
			<Modal
				animationType="fade"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<TouchableOpacity style={styles.profileModalContainer} onPress={onClose}>
					<LinearGradient
						colors={["#1BC5DA", "#263283"]}
						style={styles.profileModalImageContainer}
					>
						<Image
							source={{ uri: imageUrl }} // 수정: imageUrl을 사용
							style={styles.profileModalImage}
						/>
					</LinearGradient>
				</TouchableOpacity>
			</Modal>
		);
	};
	
	const renderItem = ({ item, animationValue }) => {
		const animatedStyle = useAnimatedStyle(() => {
			const scale = interpolate(
				animationValue.value,
				[-1, 0, 1],
				[0.8, 1, 0.8]
			);
			
			return {
				transform: [{ scale }],
			};
		});
		
		return (
			<Animated.View style={[styles.pinSlide, animatedStyle]}>
				<TouchableOpacity
					style={styles.pinContainer}
					onPress={() => changeImage(item.pinId)}
				>
					<Image
						source={{
							uri: isFrontShowing[item.pinId]
								? item.postFrontUrl
								: item.postBackUrl,
						}}
						style={styles.pinImage}
					/>
				</TouchableOpacity>
			</Animated.View>
		);
	};
	const changeImage = (pinId) => {
		setIsFrontShowing(prev => ({
			...prev,
			[pinId]: !prev[pinId]
		}));
	};
	
	if (isLoading) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}
	return (
		<View style={styles.container}>
			<View>
				<View style={styles.userContainer}>
					<View style={styles.avatarContainer}>
						<TouchableOpacity onPress={profileImageModalVisible}>
							<LinearGradient
								colors={["#1BC5DA", "#263283"]}
								style={styles.avatarGradient}
							>
							<Image
								source={{
									uri: serverUserData.profileUrl
										? serverUserData.profileUrl
										: defaultImage
								}}
								style={styles.avatar}
							/>
							</LinearGradient>
						</TouchableOpacity>
					</View>
						{isModalVisible && (
							<ProfileImageModal
								isVisible={isModalVisible}
								imageUrl={serverUserData.profileUrl ? serverUserData.profileUrl : defaultImage}
								onClose={() => setIsModalVisible(false)}
							/>
						)}
					<View>
						{!isFriend && (friendLook === true ? (
								<TouchableOpacity onPress={toggleFriendSend}>
									<LinearGradient
										colors={['#1BC5DA', '#263283']}
										style={styles.friendButton}
									>
										<Text style={styles.friendText}>친구 추가</Text>
									</LinearGradient>
								</TouchableOpacity>
							) : (
								<View style={[styles.friendButton, {
									backgroundColor: "#292929",
									borderRadius: 5,
								}]}>
									<Text style={styles.friendText}>추가 완료</Text>
								</View>
							)
						)}
						<View style={styles.userTextContainer}>
							<View style={styles.nameAndOptionsContainer}>
								<View style={styles.nameTextContainer}>
									<Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">{serverUserData.username}</Text>
								</View>
							</View>
							<View style={styles.desTextContainer}>
								<Text style={styles.desText}>
									{serverUserData.mostVotedTitle
										? serverUserData.mostVotedTitle
										: "투표를 진행해주세요!"}
								</Text>
							</View>
						</View>
					</View>
				</View>
			</View>
			<View style={styles.pinsContainer}>
				<View style={styles.pinsTitleContainer}>
					<Text style={styles.pinsTitle}>Pins</Text>
				</View>
				<View style={styles.pinsCardContainer}>
				{serverPinData.length === 0 ? (
					<View style={styles.pinsNoneContainer}>
						<Text style={[styles.pinsNoneText, { textAlign: "center" }]}>
							핀이 아직{"\n"}없어요...
						</Text>
					</View>
				) : (
					<Carousel
						width={ITEM_WIDTH}
						height={ITEM_HEIGHT}
						data={serverPinData}
						renderItem={renderItem}
						mode="parallax"
						style={{ alignSelf: 'center' }} // 캐러셀 자체를 가운데 정렬
						modeConfig={{
							parallaxScrollingScale: 0.9,
							parallaxScrollingOpacity: 0.6,
							parallaxAdjacentItemScale: 1,
						}}
					/>
				)}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "black",
	},
	loader: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
	},
	
	userContainer: {
		height: hp(22),
		width: wp(90),
		marginHorizontal: wp(5),
		
		flexDirection: "row",
		alignItems: "flex-end",
	},
	avatarContainer: {
		width: wp(40),
		height: hp(20),
		alignItems: "center",
		justifyContent: "center",
	},
	avatarGradient: {
		width: hp(18.5),
		height: hp(18.5),
		borderRadius: 100,
		alignItems: "center",
		justifyContent: "center",
	},
	avatar: {
		width: hp(17),
		height: hp(17),
		borderRadius: 100,
		borderColor: "white",
		borderWidth: 3,
	},
	friendButton: {
		height: wp(7),
    width: wp(15),
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
		borderRadius: 5,
		
		marginLeft: wp(5),
	},
	friendText: {
		fontSize: wp(3),
		color: "white",
		fontWeight: 'bold',
	},
	userTextContainer: {
		width: wp(47),
		height: hp(12),
		marginLeft: wp(3),
		marginBottom: hp(2),
	},
	nameAndOptionsContainer: {
		height: hp(5),
		marginHorizontal: wp(2),
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "white",
	},
	nameTextContainer: {
		width: wp(36.5),
		justifyContent: "center",
	},
	desTextContainer: {
		width: wp(43),
		marginHorizontal: wp(2),
		paddingVertical: hp(1),
	},
	nameText: {
		fontSize: wp(5.7),
		fontWeight: "900",
		color: "#fff",
	},
	desText: {
		fontSize: wp(3.2),
		color: "#fff",
	},
	
	profileModalContainer: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.75)",
		alignItems: "center",
		justifyContent: "center",
	},
	profileModalImageContainer: {
		width: wp(87),
		height: wp(87),
		borderRadius: wp(100),
		borderWidth: 2,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	profileModalImage: {
		width: "95%",
		height: "95%",
		borderRadius: wp(100),
		borderWidth: 4,
		borderColor: "white",
	},
	
	pinsContainer: {
		height: hp(75),
		alignItems: "center",
	},
	pinsTitleContainer: {
		height: hp(3.4),
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		
	},
	pinsTitle: {
		fontSize: hp(2.9),
		fontWeight: "bold",
		color: "white",
	},
	pinsPlusContainer: {
		position: "relative",
		height: hp(3),
		width: hp(3),
		borderRadius: hp(3),
		marginLeft: hp(1),
		alignItems: "center",
		justifyContent: "center",
	},
	pinsPlusHorizontal: {
		position: "absolute",
		height: hp(1.5),
		width: hp(0.3),
		backgroundColor: "black",
	},
	pinsPlusVertical: {
		position: "absolute",
		width: hp(1.5),
		height: hp(0.3),
		backgroundColor: "black",
	},
	
	pinsCardContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	pinSlide: {
		width: "100%",
		height: "95%",
		alignItems: "center",
		justifyContent: "center",
		
	},
	pinContainer: {
		width: '100%',
		height: '100%',
		alignItems: "center",
		justifyContent: "center",
		
	},
	pinImage: {
		width: '70%',
		height: '100%',
		borderRadius: 25,
		borderWidth: 2,
		borderColor: "#fff",
	},
	
	pinsNoneContainer: {
		width: "100%",
		height: "100%",
		borderRadius: 25,
		backgroundColor: "rgba(128, 128, 128, 0.6)", // grey with 50% transparency
		alignItems: "center",
		justifyContent: "center",
		padding: 30,
	},
	pinsNonePlusContainer: {
		position: "relative",
		height: 50,
		width: 50,
		borderRadius: 25,
		marginBottom: "5%",
		alignItems: "center",
		justifyContent: "center",
	},
	pinsNonePlusHorizontal: {
		position: "absolute",
		width: 25,
		height: 5,
		backgroundColor: "black",
	},
	pinsNonePlusVertical: {
		position: "absolute",
		width: 5,
		height: 25,
		backgroundColor: "black",
	},
	pinsNoneText: {
		fontSize: 30,
		fontWeight: "900",
		color: "black",
	},
});
export default UserAlarm;