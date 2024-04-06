import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';

const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.post.id === nextProps.post.id;
});

const FriendPosts = () => {
	const [posts, setPosts] = useState(null); // 게시물 상태 초기화
	const [location, setLocation] = useState(""); //
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	
	const getPosts = async () => {
		setRefreshing(true);
		try {
			const response = await axios.get('http://192.168.0.3:3000/posts?_limit=10');
			setPosts(response.data); // 상태 업데이트
		} catch (error) {
			console.error('Fetching posts failed:', error);
		} finally {
			setRefreshing(false); // 새로고침 상태를 false로 설정합니다.
			pagerViewRef.current?.setPageWithoutAnimation(0);
		}
	};
	const getLocation = async () => {
		try {
			const response = await axios.get('http://192.168.0.3:3000/user_location');
			setLocation(response.data); // 상태 업데이트
		} catch (error) {
			console.error('Fetching posts failed:', error);
		}
	};
	const getMorePosts = async () => {
		if (refreshing) return; // 이미 새로고침 중이라면 중복 요청 방지
		try {
			const response = await axios.get(`http://192.168.0.3:3000/posts?_start=${posts.length}&_limit=10`);
			setPosts(prevPosts => [...prevPosts, ...response.data]); // 기존 데이터에 추가 데이터 병합
		} catch (error) {
			console.error('Fetching more posts failed:', error);
		}
	}
	
	// 컴포넌트가 마운트될 때 fetchPosts 함수 호출
	useFocusEffect(
		useCallback(() => {
			getPosts();
			getLocation();
		}, [])
	);
	
	useEffect(() => {
		console.log(posts);
		console.log(location);
	}, [posts]);
	
	if (!posts) {
		return <View style={style.container}><Text>Loading...</Text></View>;
	}
	
	return (
		<ScrollView
			contentContainerStyle={style.scrollViewContent}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={getPosts} />
			}
		>
			<PagerView
				style={style.pagerView}
				initialPage={0}
				ref={pagerViewRef}
				onPageSelected={e => {
					const newIndex = e.nativeEvent.position;
					if (newIndex === posts.length - 6) {
						getMorePosts();
					}
				}}
			>
				{posts.map((post) => (
					<View key={post.post_id} style={style.container}>
						<MemoizedCardComponent post={post} />
					</View>
				))}
			</PagerView>
		</ScrollView>
	);
};

const style = StyleSheet.create({
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
	},
});

export default FriendPosts;