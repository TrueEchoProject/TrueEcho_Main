import React from 'react';
import {View, Button, StyleSheet, Alert} from 'react-native';
import * as Notifications from 'expo-notifications';
import storage from "../../../AsyncStorage";

const IsAlarm = () => {
	const defaultImage = "https://ppss.kr/wp-content/uploads/2020/07/01-4-540x304.png";
	
	const GoPostComment = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "테스트 알림",
					body: "이것은 테스트 알림입니다.",
					data: {
						userId: null,
						notiType: "4",
						contentId: "929",
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoPostSubComment = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "답글 추가",
					body: '당신의 댓글에 답글이 달렸어요',
					data: {
						userId: null,
						notiType: "5",
						contentId: "929",
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoPostLike= async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "좋아요",
					body: 'username"님이 좋아요를 눌렀어요!',
					data: {
						userId: null,
						notiType: "6",
						contentId: "929",
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoFriend = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "친구 요청",
					body: '새로운 친구 요청이 있어요',
					data: {
						userId: null,
						notiType: "7",
						contentId: null,
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoRankingMe = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "랭킹 달성",
					body: '이번 주 "{rank_vote}" 투표에서 {rank}등을 달성하셨어요!',
					data: {
						userId: null,
						notiType: "1",
						contentId: null,
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoRankingVote = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "투표 완료",
					body: '이번 주 투표가 마감되었어요. 확인해볼까요?',
					data: {
						userId: null,
						notiType: "2",
						contentId: null,
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoRankingVoteMe = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "투표받음",
					body: '~ 질문에 age gender username 님이 투표하셨어요. 확인해볼까요?',
					data: {
						userId: null,
						notiType: "3",
						contentId: "251",
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const GoRandom = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "사진찍을 시간",
					body: '사진을 찍어요',
					data: {
						userId: null,
						notiType: "0",
						contentId: null,
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	const none = async () => {
		try {
				await storage.set('postFront', "");
				console.log(`PostFront stored: ""`);
				await storage.set('postBack', "");
				console.log(`PostBack stored: ""`);
		} catch (error) {
			Alert.alert('오류', '사진 상태 변경 중 오류가 발생했습니다.');
		}
	}
	const front = async () => {
		try {
			await storage.set('postFront', defaultImage);
			console.log(`PostFront stored: ${defaultImage}`);
		} catch (error) {
			Alert.alert('오류', '사진 상태 변경 중 오류가 발생했습니다.');
		}
	}
	const back = async () => {
		try {
			await storage.set('postBack', defaultImage);
			console.log(`PostBack stored: ${defaultImage}`);
		} catch (error) {
			Alert.alert('오류', '사진 상태 변경 중 오류가 발생했습니다.');
		}
	}
	
	return (
		<View style={styles.container}>
			<Button title="댓글 추가" onPress={GoPostComment}/>
			<Button title="답글 추가" onPress={GoPostSubComment}/>
			<Button title="좋아요" onPress={GoPostLike}/>
			<Button title="친구 요청" onPress={GoFriend}/>
			<Button title="랭킹 등극" onPress={GoRankingMe}/>
			<Button title="투표 완료" onPress={GoRankingVote}/>
			<Button title="투표 해준 사람" onPress={GoRankingVoteMe}/>
			<Button title="무작위 알림" onPress={GoRandom}/>
			<Button title="photo: none" onPress={none}/>
			<Button title="photo: front" onPress={front}/>
			<Button title="photo: back" onPress={back}/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default IsAlarm;