import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import axios from 'axios';

const fetchData = async () => {
	try {
		const response = await axios.get('http://192.168.123.121:3000/rank');
		return response.data || [];
	} catch (error) {
		console.error('Error fetching data:', error);
		return [];
	}
};

const Result = React.memo(() => {
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const pagerRef = useRef(null);
	
	useEffect(() => {
		const initFetch = async () => {
			const data = await fetchData();
			if (Array.isArray(data)) {
				setQuestions(data);
			} else {
				console.error('Data is not in expected format:', data);
			}
			setLoading(false);
		};
		initFetch();
	}, []);
	
	const goToPage = useCallback((pageIndex) => {
		if (pagerRef.current) {
			pagerRef.current.setPage(pageIndex);
		}
	}, []);
	
	if (loading) {
		return (
			<View style={styles.emptyPage}>
				<Text style={styles.emptyText}>Loading...</Text>
			</View>
		);
	}
	
	return (
		<View style={styles.container}>
			<PagerView ref={pagerRef} style={styles.pagerView} initialPage={0} scrollEnabled={false}>
				{questions.map((question, index) => (
					<View key={question.id.toString()} style={styles.page}>
						<View style={styles.navigationContainer}>
							<TouchableOpacity onPress={() => goToPage(index - 1)} disabled={index === 0}>
								<AntDesign name="left" size={40} color={index === 0 ? "grey" : "black"} />
							</TouchableOpacity>
							<Text style={styles.questionText}>{question.question}</Text>
							<TouchableOpacity onPress={() => goToPage(index + 1)} disabled={index === questions.length - 1}>
								<AntDesign name="right" size={40} color={index === questions.length - 1 ? "grey" : "black"} />
							</TouchableOpacity>
						</View>
						<Text style={styles.weekText}>Week: {question.week[0]}월 {question.week[1]}주차</Text>
						<View style={styles.rankDetails}>
							<Text style={styles.rankText}>1st: {question.rank['1st'].userName} ({question.rank['1st'].poll} 표)</Text>
							<Text style={styles.rankText}>2nd: {question.rank['2nd'].userName} ({question.rank['2nd'].poll} 표)</Text>
							<Text style={styles.rankText}>3rd: {question.rank['3nd'].userName} ({question.rank['3nd'].poll} 표)</Text>
						</View>
					</View>
				))}
			</PagerView>
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
	},
	pagerView: {
		flex: 1,
		width: '100%',
		height: '100%',
		padding: 10
	},
	page: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		backgroundColor: '#ffffff',
		marginHorizontal: 10,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	navigationContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',  // Ensure the navigation buttons are on the far ends
	},
	questionText: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		flex: 1  // Allows text to take up the maximum space between buttons
	},
	weekText: {
		fontSize: 16,
		color: 'grey',
		marginBottom: 20
	},
	rankDetails: {
		alignItems: 'center',
		marginBottom: 10
	},
	rankText: {
		fontSize: 16,
		color: 'black'
	},
	emptyPage: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		color: 'grey'
	}
});

export default Result;