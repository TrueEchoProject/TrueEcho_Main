import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

const FeedButton = ({ title, onPress, isSelected }) => {
	return (
		<TouchableOpacity onPress={onPress} style={[styles.button, isSelected && styles.selected]}>
			<View>
				<Text style={[styles.text, isSelected && styles.selectedText]}>{title}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		marginRight: 10,
		marginLeft: 10,
		padding: 5,
		borderRadius: 5,
		height: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: 'black',
	},
	selected: {
		backgroundColor: '#3B4664', // 예시로 선택됐을 때 배경색을 변경
	},
	selectedText: {
		color: 'white', // 예시로 선택됐을 때 텍스트 색상을 변경
	},
});

export default React.memo(FeedButton);
