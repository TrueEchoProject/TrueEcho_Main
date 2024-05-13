import React, {useEffect, useState,} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { Image } from "expo-image";
import moment from 'moment';
import 'moment/locale/ko';
import axios from "axios";

const Alarm = ({ navigation }) => {
	const [selected, setSelected] = useState("게시물");
	const [alarmPost, setAlarmPost] = useState([])
	const [alarmCommunity, setAlarmCommunity] = useState([])
	const GraphImage = "https://i.ibb.co/NybJtMb/DALL-E-2024-05-06-18-33-20-A-simple-and-clear-bar-chart-representing-a-generic-voting-result-suitabl.webp"
	
	const fetchAlarm = async () => {
		try {
			const response = await axios.get(`http://192.168.0.27:3000/alarm_post`);
			setAlarmPost(response.data);
		} catch (error) {
			console.error('Error fetching data', error);
		}
	}
	const toggleSetting = async (item) => {
		setSelected(item); // 선택된 항목을 직접 설정
		if (item === "게시물") {
			try {
				const response = await axios.get(`http://192.168.0.27:3000/alarm_post`);
				setAlarmPost(response.data);
				setAlarmCommunity([]);
			} catch (error) {
				console.error('Error fetching data', error);
			}
		}
		if (item === "커뮤니티") {
			try {
				const response = await axios.get(`http://192.168.0.27:3000/alarm_community`);
				setAlarmCommunity(response.data);
				setAlarmPost([]);
			} catch (error) {
				console.error('Error fetching data', error);
			}
		}
	};
	
	const handlePress = (alarm) => {
		switch (alarm.type) {
			case 0: // 타입 0에 대한 액션
				navigation.navigate("피드 알람", { post_id : alarm.post_id })
				console.log("댓글에 대한 상세 페이지로 이동");
				break;
			case 1: // 타입 1에 대한 액션
				navigation.navigate("피드 알람")
				navigation.navigate("피드 알람", { post_id : alarm.post_id })
				console.log("답장에 대한 상세 페이지로 이동");
				break;
			case 2: // 타입 2에 대한 액션
				navigation.navigate("피드 알람")
				navigation.navigate("피드 알람", { post_id : alarm.post_id })
				console.log("사진 좋아요에 대한 상세 정보 보기");
				break;
			case 3: // 타입 3에 대한 액션
				navigation.navigate("Fri")
				console.log("친구요청에 대한 상세 정보 보기");
				break;
			default:
				console.log("알 수 없는 액션");
		}
	}
	const getGenderText = (gender) => {
		return gender === 0 ? "남성" : "여성";
	};
	const getAgeText = (age) => {
		const ageGroup = Math.floor(age / 10) * 10;
		return `${ageGroup}대`;
	};
	useEffect( () => {
		fetchAlarm()
	}, []);
	
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
			<ScrollView style={styles.bodyContainer}>
				{alarmPost.length > 0 &&
					alarmPost.map((alarm, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => handlePress(alarm)}
							style={styles.alarmContainer}
						>
							<Image
								source={{ uri: alarm.profile_url }}
								style={styles.avatar}
							/>
							<View style={{ flex: 1 }}>
								{alarm.type === 0 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.username}</Text>
										님이 댓글을 남겼습니다:
										<Text style={styles.emphasizedText}> {alarm.comment}</Text>
									</Text>
								)}
								{alarm.type === 1 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.username}</Text>
										님이 회원님의 댓글에 답장을 보냈습니다:
										<Text style={styles.emphasizedText}> {alarm.comment}</Text>
									</Text>
								)}
								{alarm.type === 2 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.like_username}</Text>
										님이 회원님의 사진을 좋아합니다
									</Text>
								)}
								{alarm.type === 3 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.friend_username}</Text>
										님이 친구요청을 보냈습니다.
									</Text>
								)}
								<Text>{moment(alarm.created_at).fromNow()}</Text>
							</View>
							<Image
								source={{ uri: alarm.post_back_url }}
								style={styles.post}
							/>
						</TouchableOpacity>
					))
				}
				{alarmCommunity.length > 0 &&
					alarmCommunity.map((alarm, index) => (
						<View key={index} style={styles.alarmContainer}>
							<View style={{ flex: 1, flexDirection: "row", }}>
								{alarm.type === 0 && (
									<TouchableOpacity onPress={() => {navigation.navigate("결과")}} style={{alignItems: "center", flexDirection: "row"}}>
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
								{alarm.type === 1 && (
									<TouchableOpacity onPress={() => {navigation.navigate("결과")}} style={{alignItems: "center", flexDirection: "row"}}>
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
								{alarm.type === 2 && (
									<TouchableOpacity onPress={() => {navigation.navigate("유저 알람")}} style={{alignItems: "center", flexDirection: "row"}}>
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