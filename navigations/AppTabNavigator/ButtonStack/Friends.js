import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

const Friends = () => {
	const scheduleNotification = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "메시지가 왔어요",
					body: '새로운 메시지의 내용',
					data: {  // 알림에 추가 데이터 포함
						senderName: "박신형",
						type: "message",
						message: "Hello, World!"
					}
				},
				trigger: { seconds: 1 },
			});
		} catch (error) {
			console.error('Error scheduling notification:', error);
		}
	};
	
	return (
		<View style={styles.container}>
			<Button
				title="메세지"
				onPress={scheduleNotification}
			/>
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

export default Friends;