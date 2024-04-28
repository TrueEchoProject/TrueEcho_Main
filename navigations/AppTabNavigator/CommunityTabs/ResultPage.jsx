import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const ResultPage = ({ question, rank }) => {
	return (
		<View style={styles.page}>
			<Text style={styles.text}>{question}</Text>
			<FontAwesome name="question-circle" size={24} color="blue" />
			<Text style={styles.rankHeader}>Week Rankings</Text>
			<Text style={styles.rankText}>1st: {rank['1st'].userName} ({rank['1st'].poll} votes)</Text>
			<Text style={styles.rankText}>2nd: {rank['2nd'].userName} ({rank['2nd'].poll} votes)</Text>
			<Text style={styles.rankText}>3rd: {rank['3nd'].userName} ({rank['3nd'].poll} votes)</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	page: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20
	},
	text: {
		fontSize: 16,
		textAlign: 'center'
	},
	rankHeader: {
		marginTop: 20,
		fontSize: 18,
		fontWeight: 'bold'
	},
	rankText: {
		fontSize: 16
	}
});

export default ResultPage;