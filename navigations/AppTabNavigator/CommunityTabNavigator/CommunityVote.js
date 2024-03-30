import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const CommunityVote = ({ navigation }) => {
	return (
		<View style={style.container}>
			<Text>CommunityResult</Text>
			<Button
				title="CommunityResult"
				onPress={() => navigation.navigate("Result")}
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

export default CommunityVote;