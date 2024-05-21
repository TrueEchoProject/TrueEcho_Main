import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import axios from 'axios';

const MyFeed = ({ navigation }) => {
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1); // 페이지 번호 상태 추가
	const [isFetchingMore, setIsFetchingMore] = useState(false); // 추가 데이터 로드 상태 추가
	const [isEndReached, setIsEndReached] = useState(false); // onEndReached 호출 상태
	
	useEffect(() => {
		if (posts.length > 0) {
			console.log('posts updated:', posts);
		}
	}, [posts]);
	
	useEffect(() => {
		fetchData(page);
	}, []);
	
	const fetchData = async (page) => {
		try {
			const response = await axios.get(`http://192.168.0.27:3000/postPins?_limit=12&_page=${page}`);
			setPosts(prevPosts => [...prevPosts, ...response.data]);
		} catch (error) {
			console.error('Error fetching data', error);
		} finally {
			setIsLoading(false);
			setIsFetchingMore(false); // 추가 데이터 로드 완료
		}
	}
	
	const handleLoadMore = () => {
		if (!isFetchingMore && !isEndReached) {
			setIsFetchingMore(true);
			setIsEndReached(true); // set it to true to avoid multiple calls
			setPage(prevPage => {
				const nextPage = prevPage + 1;
				fetchData(nextPage);
				return nextPage;
			});
		}
	}
	const renderItem = ({ item }) => (
		<TouchableOpacity
			onPress={() => navigation.navigate("피드 알람", { post_id: item.post_id })}
			style={styles.postContainer}
		>
			<Image source={{ uri: item.post_back_url }} style={styles.postImage} />
		</TouchableOpacity>
	);
	
	const renderFooter = () => {
		if (!isFetchingMore) return null;
		return (
			<View style={styles.footer}>
				<ActivityIndicator size="small" color="#0000ff" />
			</View>
		);
	};
	
	return (
		<View style={styles.container}>
			{isLoading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : (
				posts.length > 0 ? (
					<FlatList
						data={posts}
						renderItem={renderItem}
						keyExtractor={item => item.post_id.toString()}
						numColumns={3}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.1}
						ListFooterComponent={renderFooter}
						onMomentumScrollBegin={() => setIsEndReached(false)} // reset on scroll
					/>
				) : (
					<View style={styles.emptyContainer}>
						<Text>게시물을 추가해보세요!</Text>
					</View>
				)
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 20,
	},
	postContainer: {
		marginBottom: 20,
		alignItems: 'center',
	},
	postImage: {
		width: 100,
		height: 100,
		margin: 10,
		borderRadius: 10,
	},
	footer: {
		paddingVertical: 20,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default MyFeed;
