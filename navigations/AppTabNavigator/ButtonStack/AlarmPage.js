import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import moment from 'moment';
import 'moment/locale/ko';
import Api from '../../../Api';
import * as Linking from "expo-linking";
import {LinearGradient} from "expo-linear-gradient";

const Alarm = ({ navigation }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [selected, setSelected] = useState("게시물");
	const [alarmPost, setAlarmPost] = useState([]);
	const [alarmCommunity, setAlarmCommunity] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [initialLoad, setInitialLoad] = useState(true); // 초기 로드 상태를 추가
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	useEffect(() => {
		fetchPost(0);
	}, []);
	useEffect(() => {
		console.log("게시물 알림", alarmCommunity);
	}, [alarmCommunity]);
	
	const fetchPost = async (index) => {
		try {
			setIsLoading(true);
			const serverResponse = await Api.get(`/noti/readPost?index=${index}&pageCount=10`);

			// 서버 응답 데이터 확인
			console.log('서버 응답 데이터:', serverResponse.data.data.allNotis);
			if (serverResponse.data.message === "커뮤니티 알림 피드 조회에 실패했습니다.") {
				if (index === 0) {
					alert("불러올 알림이 없습니다.");
					setAlarmCommunity([]);
					setHasMore(false);
					return;
				} else {
					alert("더 이상 불러올 알림이 없습니다.");
					setHasMore(false);
				}
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
				if (index === 0) {
					alert("불러올 알림이 없습니다.");
					setAlarmCommunity([]);
					setHasMore(false);
					return;
				} else {
					alert("더 이상 불러올 알림이 없습니다.");
					setHasMore(false);
				}
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
	const getGenderText = (gender) => {
		return gender === 0 ? "남성" : "여성";
	};
	const getAgeText = (age) => {
		const ageGroup = Math.floor(age / 10) * 10;
		return `${ageGroup}대`;
	};
	
	const handlePress = (alarm) => {
		const navigationMap = {
			4: () => navigation.navigate("FeedAlarm", { postId: alarm.post_id, back: true }),
			5: () => navigation.navigate("FeedAlarm", { postId: alarm.post_id, back: true }),
			6: () => navigation.navigate("FeedAlarm", { postId: alarm.post_id, back: true }),
			7: () => navigation.navigate("Fri"),
			1: goResult,
			2: goResult,
			3: () => navigation.navigate("UserAlarm", { userId: alarm.user_id }),
		};
		
		const navigate = navigationMap[alarm.type];
		if (navigate) {
			navigate();
		} else {
			console.log("알 수 없는 액션");
		}
	};
	const goResult = async () => {
		const url = Linking.createURL('main/community/community/result');
		const supported = await Linking.canOpenURL(url);
		if (supported) {
			Linking.openURL(url);
		} else {
			console.log(`Can't handle url: ${url}`);
		}
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
	
	const HeaderButton = ({ label, selected, onPress }) => (
		<TouchableOpacity
			onPress={onPress}
			style={[
				styles.HeaderButtonCommon,
				selected !== label && styles.HeaderButtonInactive
			]}
		>
			{selected === label ? (
				<LinearGradient
					colors={["#1BC5DA", "#263283"]}
					style={styles.HeaderButtonActive}
				>
					<Text style={styles.HeaderButtonText}>{label}</Text>
				</LinearGradient>
			) : (
				<Text style={styles.HeaderButtonText}>{label}</Text>
			)}
		</TouchableOpacity>
	);
	const renderAlarmContent = (alarm, text, comment) => {
		console.log("렌더링 중인 알람:", alarm);
		return (
			<View style={{ alignItems: "center", flexDirection: "row" }}>
				<View style={styles.AlarmAvatarContainer}>
					<LinearGradient
						colors={["#1BC5DA", "#263283"]}
						style={styles.AlarmAvatarGradient}
					>
						<Image
							source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage }}
							style={styles.AlarmAvatar}
						/>
					</LinearGradient>
				</View>
				<View style={styles.AlarmTextContainer}>
					<Text style={styles.AlarmText} numberOfLines={2} ellipsizeMode="tail">
						<Text style={styles.AlarmEmphasizedText}>{alarm.username}</Text>
						{text}
						<Text style={styles.AlarmEmphasizedText}> {comment}</Text>
					</Text>
					<Text style={styles.AlarmText}>{moment(alarm.created_at).fromNow()}</Text>
				</View>
				<View style={styles.AlarmPostContainer}>
					<Image
						source={{ uri: alarm.post_back_url ? alarm.post_back_url : defaultImage }}
						style={styles.AlarmPost}
					/>
				</View>
			</View>
		);
	};
	const renderMultipleProfilesAlarm = (alarm) => (
		<View style={{ alignItems: "center", flexDirection: "row" }}>
			<View style={alarm.profile_urls.length > 1 ? styles.AlarmMultipleContainer : styles.AlarmAvatarContainer}>
				{alarm.profile_urls.length > 1 ? alarm.profile_urls.map((url, idx) => (
					<LinearGradient
						colors={["#1BC5DA", "#263283"]}
						style={idx === 0 ? styles.MultipleBackAvatarGradient : styles.MultipleOverlayAvatarGradient}
					>
						<Image
							key={idx}
							source={{ uri: url }}
							style={idx === 0 ? styles.MultipleBackAvatar : styles.MultipleOverlayAvatar}
						/>
					</LinearGradient>
				)) : (
					<LinearGradient
						colors={["#1BC5DA", "#263283"]}
						style={styles.AlarmAvatarGradient}
					>
						<Image
							source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage }}
							style={styles.AlarmAvatar}
						/>
					</LinearGradient>
				)}
			</View>
			<View style={styles.AlarmTextContainer}>
				<Text style={styles.AlarmEmphasizedText}>{alarm.like_username}</Text>
				<Text style={styles.AlarmText}>{moment(alarm.created_at).fromNow()}</Text>
			</View>
			<View style={styles.AlarmPostContainer}>
				<Image
					source={{ uri: alarm.post_back_url ? alarm.post_back_url : defaultImage }}
					style={styles.AlarmPost}
				/>
			</View>
		</View>
	);
	const renderFriendRequestAlarm = (alarm) => (
		<View style={{ alignItems: "center", flexDirection: "row" }}>
			<View style={styles.AlarmAvatarContainer}>
				<LinearGradient
					colors={["#1BC5DA", "#263283"]}
					style={styles.AlarmAvatarGradient}
				>
					<Image
						source={{ uri: alarm.profile_url ? alarm.profile_url : defaultImage }}
						style={styles.AlarmAvatar}
					/>
				</LinearGradient>
			</View>
			<View style={styles.AlarmTextContainer}>
				<Text style={styles.AlarmText} numberOfLines={2} ellipsizeMode="tail">
					<Text style={styles.AlarmEmphasizedText}>{alarm.friend_username}</Text>
					님이 친구요청을 보냈습니다.
				</Text>
				<Text style={styles.AlarmText} >{moment(alarm.created_at).fromNow()}</Text>
			</View>
		</View>
	);
	const renderCommunityAlarm = (alarm, textParts, onPress) => (
		<TouchableOpacity onPress={onPress} style={{ alignItems: "center", flexDirection: "row" }}>
			<View style={styles.AlarmAvatarContainer}>
				<LinearGradient
					colors={["#1BC5DA", "#263283"]}
					style={styles.AlarmAvatarGradient}
				>
					<Image
						source={{ uri: defaultImage }}
						style={styles.AlarmAvatar}
					/>
				</LinearGradient>
			</View>
			<View style={styles.AlarmCommunityContainer}>
				<Text style={styles.AlarmText} numberOfLines={2} ellipsizeMode="tail">
					{textParts.map((part, index) => (
						<Text key={index} style={part.emphasized ? styles.AlarmEmphasizedText : styles.AlarmText}>
							{part.text}
						</Text>
					))}
				</Text>
				<Text style={styles.AlarmText}>{moment(alarm.created_at).fromNow()}</Text>
			</View>
		</TouchableOpacity>
	);
	
	if (initialLoad && isLoading) {
		return <View style={styles.Loader}><ActivityIndicator size="large" color="#0000ff"/></View>;
	}
	return (
		<View style={styles.Container}>
			<View style={styles.Header}>
				<View style={styles.HeaderButtonContainer}>
					<HeaderButton
						label="게시물"
						selected={selected}
						onPress={() => toggleSetting("게시물")}
					/>
				</View>
				<View style={styles.HeaderButtonContainer}>
					<HeaderButton
						label="커뮤니티"
						selected={selected}
						onPress={() => toggleSetting("커뮤니티")}
					/>
				</View>
			</View>
			<ScrollView
				style={{flex: 1}}
				contentContainerStyle={{alignItems: "center"}}
				onScroll={handleScroll}
				scrollEventThrottle={20}
			>
				{selected && !hasMore && (
					<View style={styles.container}>
						{(selected === "게시물" && alarmPost.length === 0) ||
						(selected === "커뮤니티" && alarmCommunity.length === 0) ? (
							<Text>불러올 알림이 없습니다.</Text>
						) : null}
					</View>
				)}
				{selected === "게시물" && alarmPost.map((alarm, index) => (
					<TouchableOpacity
						key={index}
						onPress={() => handlePress(alarm)}
						style={styles.AlarmContainer}
					>
						<View style={{ flex: 1 }}>
							{alarm.type === 4 && renderAlarmContent(alarm, "님이 댓글을 남겼습니다:", alarm.comment)}
							{alarm.type === 5 && renderAlarmContent(alarm, "님이 회원님의 댓글에 답장을 보냈습니다:", alarm.comment)}
							{alarm.type === 6 && renderMultipleProfilesAlarm(alarm)}
							{alarm.type === 7 && renderFriendRequestAlarm(alarm)}
						</View>
					</TouchableOpacity>
				))}
				{selected === "커뮤니티" && alarmCommunity.map((alarm, index) => (
					<View key={index} style={styles.AlarmContainer}>
						<View style={{ flex: 1, flexDirection: "row" }}>
							{alarm.type === 1 && renderCommunityAlarm(alarm, [
								{ text: `이번 주 "`, emphasized: false },
								{ text: alarm.rank_vote, emphasized: true },
								{ text: `" 투표에서 `, emphasized: false },
								{ text: `${alarm.rank}등`, emphasized: true },
								{ text: `을 달성하셨어요!`, emphasized: false }
							], goResult)}
							{alarm.type === 2 && renderCommunityAlarm(alarm, [
								{ text: "이번 주 투표가 마감되었어요. 확인해볼까요?", emphasized: false }
							], goResult)}
							{alarm.type === 3 && renderCommunityAlarm(alarm, [
								{ text: ` "`, emphasized: false },
								{ text: alarm.vote, emphasized: true },
								{ text: `" 질문에 `, emphasized: false },
								{ text: `${getAgeText(alarm.age)}`, emphasized: true },
								{ text: ` ${getGenderText(alarm.gender)} `, emphasized: true },
								{ text: `${alarm.username}`, emphasized: true },
								{ text: `님이 투표하셨어요. 확인해볼까요?`, emphasized: false }
							], () => navigation.navigate("UserAlarm", { userId: alarm.sender_id }))}
						</View>
					</View>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	Loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	Container: {
		flex: 1,
		backgroundColor: 'black',
	},
	
	Header: {
		width: "100%",
		height: 70,
		backgroundColor: 'black',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	HeaderButtonContainer: {
		height: "100%",
		width: "50%",
		justifyContent: 'center',
		alignItems: 'center',
	},
	HeaderButtonCommon: {
		alignItems: "center",
		justifyContent: "center",
		width: "80%",
		height: "55%",
		borderRadius: 10,
	},
	HeaderButtonActive: {
		width: "100%",
		height: "100%",
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	HeaderButtonInactive: {
		backgroundColor: 'black',
	},
	HeaderButtonText: {
		fontWeight: '900', // 글자를 굵게
		fontSize: 15,
		color: "white",   // 글자색 변경
	},
	
	AlarmContainer: {
		height: 70,
		width: "90%",
		alignItems: "center",
		flexDirection: "row",
		marginVertical: 6,
		backgroundColor: "white",
		borderRadius: 13,
	},
	AlarmAvatarContainer: {
		height: 70,
		width: 70,
		alignItems: "center",
		justifyContent: "center",
	},
	AlarmAvatarGradient: {
		height: 55,
		width: 55,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	AlarmAvatar: {
		height: 50,
		width: 50,
		borderRadius: 40,
		borderWidth: 1,
		borderColor: "white",
	},
	AlarmTextContainer: {
		flex: 1,
	},
	AlarmCommunityContainer: {
		flex: 1,
		marginRight: 10,
	},
	AlarmText: {
		fontSize: 11,
	},
	AlarmEmphasizedText: {
		fontSize: 11,
		fontWeight: "bold",
	},
	AlarmPostContainer: {
		height: 70,
		width: 70,
		alignItems: "center",
		justifyContent: "center",
	},
	AlarmPost: {
		height: 50,
		width: 50,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: "black",
	},
	
	AlarmMultipleContainer: {
		height: 70,
		width: 70,
		justifyContent: "center",
		position: 'relative'
	},
	MultipleBackAvatarGradient: {
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		left: 5,
		bottom: 15,
		height: 50,
		width: 50,
		borderRadius: 40,
	},
	MultipleBackAvatar: {
		height: 45,
		width: 45,
		borderWidth: 1,
		borderColor: "white",
		borderRadius: 40,
	},
	MultipleOverlayAvatarGradient: {
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		right: 5,
		bottom: 5,
		height: 50,
		width: 50,
		borderRadius: 40,
	},
	MultipleOverlayAvatar: {
		height: 45,
		width: 45,
		borderWidth: 1,
		borderColor: "white",
		borderRadius: 40,
		zIndex: 1, // 최신 이미지가 위에 오도록
	},
});
export default Alarm;