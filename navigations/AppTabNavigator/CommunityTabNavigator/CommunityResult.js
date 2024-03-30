import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const CommunityResult = ({ navigation }) => {
	return (
		<View style={style.container}>
			<Text>CommunityResult</Text>
			<Button
				title="CommunityStart"
				onPress={() => navigation.navigate("Start")}
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

export default CommunityResult;