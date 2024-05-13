import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const FriendPosts = React.forwardRef((props, ref) => {
	const [currentPage, setCurrentPage] = useState(0);
	const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
	const [contentList, setContentList] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [friendStatus, setFriendStatus] = useState([]);
	const pagerViewRef = useRef(null);
	const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
	const [lastFetchedIndex, setLastFetchedIndex] = useState(0);
	
	const fetchPostsAndRecommendations = async (start) => {
		if (start <= lastFetchedIndex && contentList.length > 0) return;  // 이미 불러온 데이터 범위 내라면 요청 중지
		setIsLoading(true); // 로딩 시작
		const postLimit = 8;
		const recommendationLimit = 4;
		try {
			const postResponse = await axios.get(`http://192.168.0.27:3000/posts?scope=FRIEND&_start=${start}&_limit=${postLimit}`);
			const newPosts = postResponse.data;
			
			const updatedContentList = [...contentList, ...newPosts.map(post => ({ type: 'post', data: post }))];
			setOptionsVisibleStates(newOptionsVisibleStates => {
				const newOptions = { ...newOptionsVisibleStates };
				newPosts.forEach(post => {
					newOptions[post.post_id] = false;
				});
				return newOptions;
			});
			
			if (newPosts.length === postLimit) {
				const recsResponse = await axios.get(`http://192.168.0.27:3000/recommendations?_start=${contentList.filter(item => item.type === 'recommendation').length}&_limit=${recommendationLimit}`);
				const newRecs = recsResponse.data;
				if (newRecs && newRecs.length > 0) {
					updatedContentList.push({ type: 'recommendation', data: newRecs });
					setFriendStatus(friendStatus => [...friendStatus, ...new Array(newRecs.length).fill(false)]);
				}
			}
			setContentList(updatedContentList);
		} catch (error) {
			console.error('Error fetching posts and recommendations:', error);
		} finally {
			setLastFetchedIndex(start + postLimit); // 가져온 마지막 게시물 인덱스 업데이트
			setIsLoading(false);
		}
	};
	const getPosts = async (start = 0) => {
		if (start === 0) {
			setRefreshing(true);
			setContentList([]);
			setOptionsVisibleStates({});
			setFriendStatus([]);
		}
		await fetchPostsAndRecommendations(start);
		setRefreshing(false);
		if (start === 0) {
			pagerViewRef.current?.setPageWithoutAnimation(0);
		}
	};
	
	const toggleFriendSend = async (index, item) => {
		try {
			await axios.post(`http://192.168.0.27:3000/friendSend`, {
				friendSendUser: item.username
			});
			const newFriendStatus = [...friendStatus];
			newFriendStatus[index] = true;
			setFriendStatus(newFriendStatus);
		} catch (error) {
			console.error('Error sending friend request:', error);
		}
	};
	
	useFocusEffect(
		useCallback(() => {
			getPosts();
		}, [])
	);
	const handleBlock = async (postId) => {
		setContentList(prev => prev.filter(item => item.data.post_id !== postId));
		await new Promise(resolve => setTimeout(resolve, 0)); // 비동기 업데이트를 위한 Promise
	};
	const handlePageChange = useCallback((e) => {
		const newIndex = e.nativeEvent.position;
		if (newIndex === currentPage) return; // 페이지가 실제로 변경되지 않았다면 종료
		
		setCurrentPage(newIndex);
		// 페이지 변경 시 이전 페이지 옵션 비활성화
		setOptionsVisibleStates(prev => ({
			...prev,
			[contentList[currentPage]?.data?.post_id]: false
		}));
	}, [currentPage]);
	useEffect(() => {
		const thresholdIndex = contentList.length - 5; // 데이터를 더 불러오기 시작할 임계점
		if (currentPage >= thresholdIndex && !isLoading) {
			fetchPostsAndRecommendations(contentList.length);
		}
	}, [currentPage, isLoading, contentList]);
	
	React.useImperativeHandle(ref, () => ({
		getPosts: getPosts,
	}));
	
	useEffect(() => {
		console.log(contentList);
	}, [contentList]);
	
	if (contentList.length === 0) {
		return <View style={styles.container}><Text>Loading...</Text></View>;
	}
	return (
		<ScrollView
			contentContainerStyle={styles.scrollViewContent}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => getPosts(0)} />}
		>
			<PagerView
				style={styles.pagerView}
				initialPage={0}
				ref={pagerViewRef}
				onPageSelected={handlePageChange}
			>
				{contentList.map((item, index) => (
					<View key={index} style={styles.postContainer}>
						{item.type === 'post' ? (
							<CardComponent
								post={item.data}
								onBlock={handleBlock}
								isOptionsVisibleExternal={optionsVisibleStates[item.data.post_id]}
								setIsOptionsVisibleExternal={(visible) => setOptionsVisibleStates(prev => ({ ...prev, [item.data.post_id]: visible }))}
							/>
						) : (
							Array.isArray(item.data) && item.data.map((rec, recIndex) => (  // Check if item.data is an array
								<View key={rec.Recommendation_id} style={styles.recommendationContainer}>
									<Image source={{ uri: rec.profile_url }} style={styles.profileImage} />
									<Text style={styles.username}>{rec.username}</Text>
									{!friendStatus[recIndex] ? (
										<TouchableOpacity onPress={() => toggleFriendSend(recIndex, rec)} style={styles.button}>
											<Text style={styles.buttonText}>친구 추가</Text>
										</TouchableOpacity>
									) : (
										<View style={styles.button}>
											<Text style={styles.buttonText}>추가 완료</Text>
										</View>
									)}
								</View>
							))
						)}
					</View>
				))}
			</PagerView>
		</ScrollView>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	},
	postContainer: {
		flex: 1,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollViewContent: {
		flexGrow: 1,
	},
	pagerView: {
		flex: 1,
		backgroundColor: 'white',
	},
	recommendationContainer: {
		width: windowWidth * 0.8,
		height: windowHeight * 0.17,
		justifyContent: "center",
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		alignItems: 'center',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	profileImage: {
		width: 45,
		height: 45,
		borderRadius: 45,
		marginTop: 10,
	},
	username: {
		marginTop: 10,
		marginBottom: 10,
	},
	button: {
		backgroundColor: "#3B4664",
		padding: 5,
		marginBottom: 10,
		borderRadius: 3,
		alignItems: 'center',
		justifyContent: 'center'
	},
	buttonText: {
		fontSize: 15,
		color: "white",
	},
});

export default FriendPosts;
