import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

// isSelected prop을 추가합니다.
const FeedButton = ({ title, onPress }) => {
	return (
		<TouchableOpacity onPress={onPress} style={styles.button}>
			<View>
				<Text style={styles.text}>{title}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		marginRight: 10,
		marginLeft: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: 'black',
	},
});

export default FeedButton;