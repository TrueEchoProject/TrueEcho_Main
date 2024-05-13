import React, {useEffect, useState,} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { Image } from "expo-image";
import moment from 'moment';
import 'moment/locale/ko';
import axios from "axios";

const Alarm = () => {
	const [selected, setSelected] = useState("게시물");
	const [alarmPost, setAlarmPost] = useState([])
	const [alarmCommunity, setAlarmCommunity] = useState([])
	
	useEffect( () => {
		fetchAlarm()
	}, []);
	
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
						<View key={index} style={styles.alarmContainer}>
							<Image
								source={{ uri: alarm.profile_url }}
								style={styles.avatar}
							/>
							<View style={{ flex: 1 }}>
								{alarm.type === 0 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.username}</Text>
										님이 댓글을 남겼습니다:
										<Text style={styles.emphasizedText}>{alarm.comment}</Text>
									</Text>
								)}
								{alarm.type === 1 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.username}</Text>
										님이 회원님의 댓글에 답장을 보냈습니다:
										<Text style={styles.emphasizedText}>{alarm.comment}</Text>
									</Text>
								)}
								{alarm.type === 2 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.like_username}</Text>
										님이 회원님의 사진을 좋아합니다
									</Text>
								)}
								<Text>{moment(alarm.created_at).fromNow()}</Text>
							</View>
							<Image
								source={{ uri: alarm.post_back_url }}
								style={styles.post}
							/>
						</View>
					))
				}
				{alarmCommunity.length > 0 &&
					alarmCommunity.map((alarm, index) => (
						<View key={index} style={styles.alarmContainer}>
							<Image
								source={{ uri: alarm.profile_url }}
								style={styles.avatar}
							/>
							<View style={{ flex: 1 }}>
								{alarm.type === 0 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.username}</Text>
										님이 댓글을 남겼습니다:
										<Text style={styles.emphasizedText}>{alarm.comment}</Text>
									</Text>
								)}
								{alarm.type === 1 && (
									<Text style={styles.emphasizedText} numberOfLines={2} ellipsizeMode='tail'>
										이번 주 투표가 마감되었어요. 확인해볼까요?
									</Text>
								)}
								{alarm.type === 2 && (
									<Text numberOfLines={2} ellipsizeMode='tail'>
										<Text style={styles.emphasizedText}>{alarm.like_username}</Text>
										님이 회원님의 사진을 좋아합니다
									</Text>
								)}
								<Text>{moment(alarm.created_at).fromNow()}</Text>
							</View>
							<Image
								source={{ uri: alarm.post_back_url }}
								style={styles.post}
							/>
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