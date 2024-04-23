import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';

const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.post.id === nextProps.post.id && prevProps.isOptionsVisibleExternal === nextProps.isOptionsVisibleExternal;
});


const FriendPosts = React.forwardRef((props, ref) => {
	const [currentPage, setCurrentPage] = useState(0);
	const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
	const [posts, setPosts] = useState([]); // 게시물 상태 초기화
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	const getPosts = async (start = 0) => {
		if (start === 0) setRefreshing(true);
		
		const limit = 10; // 한 번에 불러올 게시물 수
		try {
			const response = await axios.get(`http://192.168.0.3:3000/posts?scope=FRIEND&_start=${start}&_limit=${limit}`);
			const newPosts = response.data;
			
			// 각 배치 끝에 새로운 ExtraComponent를 추가
			if (start === 0) {
				setPosts(newPosts);
				const initialVisibleStates = {};
				newPosts.forEach(post => {
					initialVisibleStates[post.id] = false;  // 확실한 초기화
				});
				setOptionsVisibleStates(initialVisibleStates);
			} else {
				// 이전 ExtraComponent를 유지하면서 새로운 ExtraComponent 추가
				setPosts(prevPosts => [...prevPosts, ...newPosts]);
			}
		} catch (error) {
			console.error(start === 0 ? 'Fetching posts failed:' : 'Fetching more posts failed:', error);
		} finally {
			if (start === 0) {
				setRefreshing(false);
				pagerViewRef.current?.setPageWithoutAnimation(0);
			}
		}
	};
	
	const refreshPosts = async () => {
		await getPosts(); // 데이터를 새로고침합니다.
		pagerViewRef.current?.setPageWithoutAnimation(0); // PagerView의 첫 페이지로 이동합니다.
	};
	
	// 외부에서 컴포넌트를 제어할 수 있도록 메서드를 제공합니다.
	React.useImperativeHandle(ref, () => ({
		getPosts: getPosts,
	}));
	
	useFocusEffect(
		useCallback(() => {
			getPosts(); // 처음 포커스 될 때 게시물 불러오기
		}, [])
	);
	
	useEffect(() => {
		console.log(posts);
	}, [posts]);
	
	if (posts.length === 0) {
		return <View style={styles.container}><Text>Loading...</Text></View>;
	}
	const handlePageChange = (e) => {
		const newIndex = e.nativeEvent.position;
		setCurrentPage(newIndex);
		
		// 상태 초기화 로그 확인
		console.log("Resetting option visibility states due to page change.");
		
		// 모든 옵션을 숨깁니다.
		setOptionsVisibleStates(prevStates => {
			const newStates = {};
			posts.forEach(post => {
				newStates[post.post_id] = false;
			});
			return newStates;
		});
		
		// 추가 데이터 로딩
		if (newIndex === posts.length - 4) {
			getPosts(posts.length);
		}
	};
	
	return (
		<>
			<ScrollView
				contentContainerStyle={styles.scrollViewContent}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={refreshPosts} />
				}
			>
				<PagerView
					style={styles.pagerView}
					initialPage={0}
					ref={pagerViewRef}
					onPageSelected={handlePageChange}
				>
					{posts.map((item) => (
						<View key={item.post_id} style={styles.container}>
							<MemoizedCardComponent
								post={item}
								isOptionsVisibleExternal={optionsVisibleStates[item.post_id]}
								setIsOptionsVisibleExternal={(visible) => setOptionsVisibleStates(prev => ({ ...prev, [item.post_id]: visible }))}
							/>
						</View>
					))}
				</PagerView>
			</ScrollView>
		</>
	);
});

const styles = StyleSheet.create({
	container: {
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
	}
});

export default FriendPosts;