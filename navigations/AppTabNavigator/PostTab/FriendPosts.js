import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';

const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.post.id === nextProps.post.id;
});

const FriendPosts = React.forwardRef((props, ref) => {
	const [posts, setPosts] = useState([]); // 게시물 상태 초기화
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	const getPosts = async (start = 0) => {
		// 'refreshing' 상태는 시작 인덱스가 0일 때만 true로 설정합니다.
		if (start === 0) setRefreshing(true);
		
		const limit = 10; // 한 번에 불러올 게시물 수
		try {
			const response = await axios.get(`http://192.168.0.3:3000/posts?scope=FRIEND&_start=${start}&_limit=${limit}`);
			const newPosts = response.data;
			
			// 시작 인덱스에 따라 상태를 업데이트합니다.
			if (start === 0) {
				setPosts(newPosts); // 처음부터 불러오는 경우, 새로운 데이터로 대체합니다.
			} else {
				setPosts(prevPosts => [...prevPosts, ...newPosts]); // 추가로 불러오는 경우, 기존 목록에 추가합니다.
			}
		} catch (error) {
			console.error(start === 0 ? 'Fetching posts failed:' : 'Fetching more posts failed:', error);
		} finally {
			if (start === 0) {
				setRefreshing(false);
				pagerViewRef.current?.setPageWithoutAnimation(0); // 첫 페이지로 이동합니다.
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
					onPageSelected={e => {
						const newIndex = e.nativeEvent.position;
						if (newIndex === posts.length - 4) {
							getPosts(posts.length);
						}
					}}
				>
					{posts.map((post) => (
						<View key={post.post_id} style={styles.container}>
							<MemoizedCardComponent post={post}/>
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