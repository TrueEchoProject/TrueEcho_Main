import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const FeedButton = ({ title, onPress, isSelected }) => {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.button, isSelected && styles.selected]}>
			<View>
				<Text style={isSelected ? styles.selectedText : styles.text}>{title}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		marginRight: 5,
		marginLeft: 5,
		padding: 4,
		borderRadius: 6,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: 'grey', // Default text color
	},
	selected: {
		backgroundColor: '#3B4664',
	},
	selectedText: {
		color: 'white', // Text color when selected
	},
});

export default FeedButton;