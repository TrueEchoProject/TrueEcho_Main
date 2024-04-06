import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const FriendPosts = () => {
	const [posts, setPosts] = useState([]); // 게시물 상태 초기화
	const [location, setLocation] = useState(""); //
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	
	const getPosts = async () => {
		setRefreshing(true);
		try {
			const response = await axios.get('http://192.168.0.3:3000/posts?_limit=3');
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
			>
				{posts.map((post) => (
					<View key={post.id} style={style.container}>
						<Text>{post.title}</Text>
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