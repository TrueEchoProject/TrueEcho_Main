import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import
import moment from 'moment';
import 'moment/locale/ko';
import Api from '../../../Api';
import * as Linking from "expo-linking";

const Alarm = ({ navigation }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [selected, setSelected] = useState("게시물");
	const [alarmPost, setAlarmPost] = useState([]);
	const [alarmCommunity, setAlarmCommunity] = useState([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [initialLoad, setInitialLoad] = useState(true); // 초기 로드 상태를 추가
	const GraphImage = "https://i.ibb.co/NybJtMb/DALL-E-2024-05-06-18-33-20-A-simple-and-clear-bar-chart-representing-a-generic-voting-result-suitabl.webp";
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	useEffect(() => {
		fetchPost(0);
	}, []);
	
	const goResult = async () => {
		const url = Linking.createURL('main/community/community/result');
		const supported = await Linking.canOpenURL(url);
		if (supported) {
			Linking.openURL(url);
		} else {
			console.log(`Can't handle url: ${url}`);
		}
	};
	
	const fetchPost = async (index) => {
		try {
			setIsLoading(true);
			const serverResponse = await Api.get(`/noti/readPost?index=${index}&pageCount=10`);
			if (serverResponse.data.message === "게시물 알림 피드 조회에 실패했습니다.") {
				alert("알림을 불러올 게 없습니다.");
				setHasMore(false);
				return;
			}
			const processedData = processLikeAlarms(serverResponse.data.data.allNotis.filter(alarm => alarm.type === 6));
			const newAlarms = [...serverResponse.data.data.allNotis.filter(alarm => alarm.type !== 6), ...processedData];
			
			if (newAlarms.length > 0) {
				setAlarmPost(prevAlarms => [...prevAlarms, ...newAlarms]);
				setPage(prevPage => prevPage + 1);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Error fetching data', error);
		} finally {
			setIsLoading(false);
			setInitialLoad(false); // 초기 로드 상태 업데이트
		}
	};
	
	const fetchCommunity = async (index) => {
		try {
			setIsLoading(true);
			const serverResponse = await Api.get(`/noti/readCommunity?index=${index}&pageCount=10`);
			if (serverResponse.data.message === "커뮤니티 알림 피드 조회에 실패했습니다.") {
				alert("알림을 불러올 게 없습니다.");
				setHasMore(false);
				return;
			}
			const newAlarms = serverResponse.data.data.allNotis;
			
			if (newAlarms.length > 0) {
				setAlarmCommunity(prevAlarms => [...prevAlarms, ...newAlarms]);
				setPage(prevPage => prevPage + 1);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Error fetching data', error);
		} finally {
			setIsLoading(false);
			setInitialLoad(false); // 초기 로드 상태 업데이트
		}
	};
	
	const toggleSetting = async (item) => {
		setSelected(item);
		setPage(0);
		setHasMore(true);
		setAlarmPost([]);
		setAlarmCommunity([]);
		
		if (item === "게시물") {
			fetchPost(0);
		} else if (item === "커뮤니티") {
			fetchCommunity(0);
		}
	};
	
	const processLikeAlarms = (alarms) => {
		const groupedByPostId = alarms.reduce((acc, alarm) => {
			if (!acc[alarm.post_id]) {
				acc[alarm.post_id] = {
					...alarm,
					like_usernames: [alarm.like_username],
					profile_urls: [alarm.profile_url ? alarm.profile_url : defaultImage],
				};
			} else {
				acc[alarm.post_id].like_usernames.push(alarm.like_username);
				acc[alarm.post_id].profile_urls.push(alarm.profile_url);
			}
			return acc;
		}, {});
		
		return Object.values(groupedByPostId).map(alarm => ({
			...alarm,
			like_username: formatUsernames(alarm.like_usernames),
			profile_urls: alarm.profile_urls.slice(-2),
		}));
	};
	
	const formatUsernames = (usernames) => {
		const count = usernames.length;
		usernames.reverse();
		if (count === 1) {
			return <Text><Text style={styles.emphasizedText}>{usernames[0]}</Text>님이 회원님의 사진을 좋아합니다</Text>;
		} else if (count === 2) {
			return <Text><Text style={styles.emphasizedText}>{usernames[0]}</Text>님과 <Text style={styles.emphasizedText}>{usernames[1]}</Text>님이 회원님의 사진을 좋아합니다</Text>;
		} else {
			return <Text><Text style={styles.emphasizedText}>{usernames[0]}</Text>님과 <Text style={styles.emphasizedText}>{usernames[1]}</Text>님 외 <Text style={styles.emphasizedText}>여러 명</Text>이 회원님의 사진을 좋아합니다</Text>;
		}
	};
	
	const handlePress = (alarm) => {
		switch (alarm.type) {
			case 4:
				navigation.navigate("FeedAlarm", { post_id: alarm.post_id });
				break;
			case 5:
				navigation.navigate("FeedAlarm", { post_id: alarm.post_id });
				break;
			case 6:
				navigation.navigate("FeedAlarm", { post_id: alarm.post_id });
				break;
			case 7:
				navigation.navigate("Fri");
				break;
			default:
				console.log("알 수 없는 액션");
		}
	};
	
	const getGenderText = (gender) => {
		return gender === 0 ? "남성" : "여성";
	};
	
	const getAgeText = (age) => {
		const ageGroup = Math.floor(age / 10) * 10;
		return `${ageGroup}대`;
	};
	
	const handleScroll = ({ nativeEvent }) => {
		if (isCloseToBottom(nativeEvent) && hasMore && !isLoading) {
			if (selected === "게시물") {
				fetchPost(page);
			} else if (selected === "커뮤니티") {
				fetchCommunity(page);
			}
		}
	};
	
	const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
		const paddingToBottom = 20;
		return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
	};
	
	if (initialLoad && isLoading) {
		return <View style={styles.loader}><ActivityIndicator size="large" color="#0000ff"/></View>;
	}
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => toggleSetting("게시물")}
					style={[
						styles.headerButton,
						selected === "게시물" ? styles.active : styles.inactive
					]}>
					<Text style={selected === "게시물" ? styles.activeText : styles.inactiveText}>게시물</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => toggleSetting("커뮤니티")}
					style={[
						styles.headerButton,
						selected === "커뮤니티" ? styles.active : styles.inactive
					]}>
					<Text style={selected === "커뮤니티" ? styles.activeText : styles.inactiveText}>커뮤니티</Text>
				</TouchableOpacity>
			</View>
			<ScrollView style={styles.bodyContainer} onScroll={handleScroll} scrollEventThrottle={20}>
				{alarmPost.length === 0 && !hasMore && (
					<View style={styles.container}>
						<Text>더 이상 불러올 게시물이 없습니다.</Text>
					</View>
				)}
				{alarmPost.map((alarm, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => handlePress(alarm)}
							style={styles.alarmContainer}
						>
							<View style={{ flex: 1 }}>
								{alarm.type === 4 && (
									<View style={{alignItems: "center", flexDirection: "row"}}>
										<Image
											source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage}}
											style={styles.avatar}
										/>
										<View style={{flex: 1 ,flexDirection: "column"}}>
											<Text numberOfLines={2} ellipsizeMode='tail'>
												<Text style={styles.emphasizedText}>{alarm.username}</Text>
												님이 댓글을 남겼습니다:
												<Text style={styles.emphasizedText}> {alarm.comment}</Text>
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
										<Image
											source={{ uri: alarm.post_back_url ? alarm.post_back_url : defaultImage}}
											style={styles.post}
										/>
									</View>
								)}
								{alarm.type === 5 && (
									<View style={{alignItems: "center", flexDirection: "row"}}>
										<Image
											source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage}}
											style={styles.avatar}
										/>
										<View style={{flex: 1 ,flexDirection: "column"}}>
											<Text numberOfLines={2} ellipsizeMode='tail'>
												<Text style={styles.emphasizedText}>{alarm.username}</Text>
												님이 회원님의 댓글에 답장을 보냈습니다:
												<Text style={styles.emphasizedText}> {alarm.comment}</Text>
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
										<Image
											source={{ uri: alarm.post_back_url ? alarm.post_back_url : defaultImage}}
											style={styles.post}
										/>
									</View>
								)}
								{alarm.type === 6 && (
									<View style={{alignItems: "center", flexDirection: "row"}}>
										<View style={{
											width: 60,
											height: 60,
											justifyContent: "center",
											position: 'relative',
										}}>
											{alarm.profile_urls.length > 1 ?
												alarm.profile_urls.map((url, idx) => (
													<Image
														key={idx}
														source={{ uri: url }}
														style={idx === 0 ? styles.ImageAvatar : styles.overlayAvatar}
													/>
												)) : (
													<Image
														source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage}}
														style={styles.avatar}
													/>
												)
											}
										</View>
										<View style={{flex: 1 ,flexDirection: "column"}}>
											<Text numberOfLines={2} ellipsizeMode='tail'>
												{alarm.like_username}
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
										<Image
											source={{ uri: alarm.post_back_url ? alarm.post_back_url : defaultImage}}
											style={styles.post}
										/>
									</View>
								)}
								{alarm.type === 7 && (
									<View style={{alignItems: "center", flexDirection: "row"}}>
										<Image
											source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage}}
											style={styles.avatar}
										/>
										<View style={{flex: 1 ,flexDirection: "column"}}>
											<Text numberOfLines={2} ellipsizeMode='tail'>
												<Text style={styles.emphasizedText}>{alarm.friend_username}</Text>
												님이 친구요청을 보냈습니다.
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
									</View>
								)}
							</View>
						</TouchableOpacity>
					))
				}
				{alarmCommunity.length === 0 && !hasMore && (
					<View style={styles.container}>
						<Text>더 이상 불러올 게시물이 없습니다.</Text>
					</View>
				)}
				{alarmCommunity.length > 0 &&
					alarmCommunity.map((alarm, index) => (
						<View key={index} style={styles.alarmContainer}>
							<View style={{ flex: 1, flexDirection: "row", }}>
								{alarm.type === 1 && (
									<TouchableOpacity onPress={goResult} style={{alignItems: "center", flexDirection: "row"}}>
										<Image
											source={{ uri: GraphImage }}
											style={styles.avatar}
										/>
										<View style={{flexDirection: "column", flex: 1,}}>
											<Text numberOfLines={2} ellipsizeMode='tail'>
												이번 주 "
												<Text style={styles.emphasizedText}>{alarm.rank_vote}</Text>
												" 투표에서
												<Text style={styles.emphasizedText}> {alarm.rank}등</Text>
												을 달성하셨어요!
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
									</TouchableOpacity>
								)}
								{alarm.type === 2 && (
									<TouchableOpacity onPress={() => {navigation.navigate("Result")}} style={{alignItems: "center", flexDirection: "row"}}>
										<Image
											source={{ uri: GraphImage }}
											style={styles.avatar}
										/>
										<View style={{flexDirection: "column", flex: 1,}}>
											<Text style={styles.emphasizedText} numberOfLines={2} ellipsizeMode='tail'>
												이번 주 투표가 마감되었어요. 확인해볼까요?
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
									</TouchableOpacity>
								)}
								{alarm.type === 3 && (
									<TouchableOpacity onPress={() => {navigation.navigate("UserAlarm", {userId : alarm.user_id})}} style={{alignItems: "center", flexDirection: "row"}}>
										<Image
											source={{ uri: GraphImage }}
											style={styles.avatar}
										/>
										<View style={{flexDirection: "column", flex: 1,}}>
											<Text numberOfLines={2} ellipsizeMode='tail'>
												"
												<Text style={styles.emphasizedText}>{alarm.vote}</Text>
												" 질문에
												<Text style={styles.emphasizedText}> {getAgeText(alarm.age)}</Text>
												<Text style={styles.emphasizedText}> {getGenderText(alarm.gender)} </Text>
												<Text style={styles.emphasizedText}>{alarm.username}</Text>
												님이 투표하셨어요. 확인해볼까요?
											</Text>
											<Text>{moment(alarm.created_at).fromNow()}</Text>
										</View>
									</TouchableOpacity>
								)}
							</View>
						</View>
					))
				}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	alarmContainer: {
		height: 60,
		width: "100%",
		borderWidth: 1,
		borderColor: "black",
		alignItems: "center",
		flexDirection: "row",
	},
	avatar: {
		height: 40,
		width: 40,
		borderRadius: 20,
		marginHorizontal: 10,
	},
	ImageAvatar: {
		position: 'absolute',
		right: 5,
		bottom: 15,
		height: 40,
		width: 40,
		borderCurve: "circular",
		borderWidth: 3,
		borderColor: "grey",
		borderRadius: 20,
		marginHorizontal: 10,
	},
	overlayAvatar: {
		position: 'absolute',
		left: 5,
		bottom: 5,
		height: 40,
		width: 40,
		borderCurve: "circular",
		borderWidth: 3,
		borderColor: "grey",
		borderRadius: 20,
		marginHorizontal: 10,
		zIndex: 1, // 최신 이미지가 위에 오도록
	},
	post: {
		height: 40,
		width: 40,
		borderRadius: 10,
		marginHorizontal: 10,
	},
	bodyContainer: {
		flex: 1,
		backgroundColor: "grey",
	},
	header: {
		width: "100%",
		height: 50,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	headerButton: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
		padding: 10,
		margin: 3,
		borderRadius: 5,
	},
	emphasizedText: {
		fontWeight: 'bold', // 글자를 굵게
		color: "black",   // 글자색 변경
	},
	active: {
		backgroundColor: '#3B4664', // 활성화 시 녹색
	},
	inactive: {
		backgroundColor: '#ddd', // 비활성화 시 회색
	},
	activeText: {
		color: 'white',
	},
	inactiveText: {
		color: 'grey',
	},
});
export default Alarm;