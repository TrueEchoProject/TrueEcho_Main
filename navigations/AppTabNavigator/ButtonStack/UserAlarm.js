import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserAlarm = () => {
	return (
		<View style={style.container}>
			<Text>UserAlarm</Text>
		</View>
	);
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});
export default UserAlarm