import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const SendPostStack = ({ navigation }) => {
	
	return (
		<View style={style.container}>
			<Text>SendPost</Text>
			<Button
				title="ToCamera"
				onPress={() => navigation.navigate("Camera")}
			/>
		</View>
	);
};

const style = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	}
});

export default SendPostStack;