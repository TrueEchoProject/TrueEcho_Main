import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Alert } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const FriendPosts = React.forwardRef((props, ref) => {
	const [currentPage, setCurrentPage] = useState(0);
	const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
	const [posts, setPosts] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [page, setPage] = useState(0);
	const pagerViewRef = useRef(null);
	const [isLoading, setIsLoading] = useState(false);
	const [noMorePosts, setNoMorePosts] = useState(false); // 추가: 더 이상 불러올 게시물이 없는지 상태 관리
	
	useEffect(() => {
		console.log("post is", posts);
	}, [posts]);
	React.useImperativeHandle(ref, () => ({
		getPosts: refreshPosts,
	}));
	useFocusEffect(useCallback(() => {
		refreshPosts();
	}, []));
	
	const refreshPosts = async () => {
		setPage(0);
		setNoMorePosts(false); // 초기화
		await getPosts(0, true);
		setRefreshing(false);
	};
	
	const getPosts = async (index, isRefresh = false) => {
		if (isLoading || noMorePosts) return; // 로딩 중이거나 더 이상 불러올 게시물이 없을 경우 리턴
		setIsLoading(true);
		let url = `${base_url}/post/read/0?index=${index}&pageCount=5`;
		try {
			console.log(`url is`, url);
			const serverResponse = await axios.get(url, {
				headers: {
					Authorization: token,
				},
			});
			const newPosts = serverResponse.data.data.readPostResponse;
			if (newPosts.length === 0) {
				setNoMorePosts(true);
				console.log("No more posts to load.");
				Alert.alert("No more posts to load.");
				setIsLoading(false);
				return;
			}
			if (isRefresh) {
				setPosts(newPosts);
			} else {
				setPosts(prevPosts => [...prevPosts, ...newPosts]);
			}
		} catch (error) {
			console.error('Error fetching posts and recommendations:', error);
		} finally {
			setIsLoading(false);
			if (isRefresh) {
				setTimeout(() => {
					pagerViewRef.current?.setPageWithoutAnimation(0);
				}, 50);
			}
		}
	};
	
	const handleBlock = async (postId) => {
		setPosts(prev => prev.filter(item => item.postId !== postId));
		await new Promise(resolve => setTimeout(resolve, 0));
	};
	
	const handlePageChange = (e) => {
		const newIndex = e.nativeEvent.position;
		setCurrentPage(newIndex);
		setOptionsVisibleStates(prevStates => {
			const newStates = {};
			posts.forEach(post => {
				newStates[post.postId] = false;
			});
			return newStates;
		});
		if (newIndex === posts.length - 1 && !noMorePosts) {
			const nextPage = page + 1;
			setPage(nextPage);
			getPosts(nextPage);
		}
	};
	
	if (posts.length === 0 && isLoading) {
		return <View style={styles.container}><Text>Loading...</Text></View>;
	}
	return (
		<ScrollView
			contentContainerStyle={styles.scrollViewContent}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshPosts} />}
		>
			<PagerView
				style={styles.pagerView}
				initialPage={0}
				ref={pagerViewRef}
				onPageSelected={handlePageChange}
			>
				{posts.map((post) => (
					<View key={post.postId} style={styles.postContainer}>
						<CardComponent
							post={post}
							onBlock={handleBlock}
							isOptionsVisibleExternal={optionsVisibleStates[post.postId]}
							setIsOptionsVisibleExternal={(visible) => setOptionsVisibleStates(prev => ({ ...prev, [post.postId]: visible }))}
						/>
					</View>
				))}
			</PagerView>
			{noMorePosts && (
				<View style={styles.footer}>
					<Text>더 이상 불러올 게시물이 없습니다.</Text>
				</View>
			)}
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
	footer: {
		padding: 20,
		alignItems: 'center',
	},
});

export default FriendPosts;