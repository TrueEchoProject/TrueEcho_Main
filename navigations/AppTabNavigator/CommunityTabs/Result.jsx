import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Api from '../../../Api'; // Api가 같은 디렉토리에 있다고 가정합니다.
import ResultPage from './ResultPage'; // ResultPage 컴포넌트를 불러옵니다.

const fetchData = async () => {
	try {
		const response = await Api.get('/rank/read'); // axios 대신 Api 사용
		return response.data.data || [];
	} catch (error) {
		console.error('데이터를 가져오는 중 오류 발생:', error);
		return [];
	}
};

const Result = React.memo(({ navigation }) => {
	const [questions, setQuestions] = useState([]);
	const [thisWeek, setThisWeek] = useState('');
	const [loading, setLoading] = useState(true);
	const pagerRef = useRef(null);
	
	useEffect(() => {
		const initFetch = async () => {
			const data = await fetchData();
			setQuestions(data.rankList);
			setThisWeek(data.thisWeek); // thisWeek 데이터를 별도로 저장
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
				<TouchableOpacity
					onPress={() => navigation.navigate('Vote')}
					style={{padding: 20, backgroundColor: "grey"}}
				>
					<Text>뒤로가기</Text>
				</TouchableOpacity>
				<Text style={styles.emptyText}>로딩 중...</Text>
			</View>
		);
	}
	
	return (
		<View style={styles.container}>
			<PagerView ref={pagerRef} style={styles.pagerView} initialPage={0} scrollEnabled={false}>
				{questions.map((question, index) => (
					<View key={question.voteId.toString()} style={styles.page}>
						<View style={styles.navigationContainer}>
							<TouchableOpacity onPress={() => goToPage(index - 1)} disabled={index === 0}>
								<AntDesign name="left" size={40} color={index === 0 ? "grey" : "black"} />
							</TouchableOpacity>
							<Text style={styles.questionText}>{question.title}</Text>
							<TouchableOpacity onPress={() => goToPage(index + 1)} disabled={index === questions.length - 1}>
								<AntDesign name="right" size={40} color={index === questions.length - 1 ? "grey" : "black"} />
							</TouchableOpacity>
						</View>
						<ResultPage question={question.title} topRankList={question.topRankList} thisWeek={thisWeek} />
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
		width: '100%',
	},
	questionText: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		flex: 1
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
