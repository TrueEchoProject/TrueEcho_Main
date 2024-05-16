import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

const Friends = () => {
	const GoFriend = async () => {
		try {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "친구 요청",
					body: '새로운 친구 요청이 있어요',
					data: {  // 알림에 추가 데이터 포함
						type: "friend",
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
				title="친구 요청"
				onPress={GoFriend}
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