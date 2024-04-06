import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const CommunityStart = ({ navigation }) => {
	return (
		<View style={style.container}>
			<Text>CommunityStart</Text>
			<Button
				title="CommunityVote"
				onPress={() => navigation.navigate("Vote")}
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

export default CommunityStart;
