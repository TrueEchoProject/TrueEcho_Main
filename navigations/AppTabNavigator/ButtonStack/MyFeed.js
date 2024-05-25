import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity} from 'react-native';
import axios from 'axios';

const MyFeed = ({ navigation }) => {
	const [serverPosts, setServerPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(1); // 페이지 번호 상태 추가
	const [isFetchingMore, setIsFetchingMore] = useState(false); // 추가 데이터 로드 상태 추가
	const [isEndReached, setIsEndReached] = useState(false); // onEndReached 호출 상태
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
	
	useEffect(() => {
		if (serverPosts) {
			console.log('server updated:', serverPosts);
		}
	}, [serverPosts]);
	useEffect(() => {
		fetchData();
	}, []);
	
	const fetchData = async (page) => {
		try {
			const serverResponse = await axios.get(`${base_url}/post/read/2?index=0&pageCount=10&location=&page=${page}`, {
				headers: {
					Authorization: `${token}`
				}
			});
			const newPosts = serverResponse.data.data.readPostResponse;
			setServerPosts(prevPosts => {
				const postIds = new Set(prevPosts.map(post => post.postId));
				const filteredNewPosts = newPosts.filter(post => !postIds.has(post.postId));
				return [...prevPosts, ...filteredNewPosts];
			});
		} catch (error) {
			console.error('Error fetching data', error);
		} finally {
			setIsLoading(false);
			setIsFetchingMore(false);
		}
	};
	
	const handleLoadMore = () => {
		if (!isFetchingMore && !isEndReached) {
			setIsFetchingMore(true);
			setIsEndReached(true);
			setPage(prevPage => {
				const nextPage = prevPage + 1;
				fetchData(nextPage);
				return nextPage;
			});
		}
	};
	const renderItem = ({ item }) => (
		<TouchableOpacity
			onPress={() => navigation.navigate("피드 알람", { post_id: item.postId })}
			style={styles.postContainer}
		>
			<Image source={{ uri: item.postBackUrl || defaultImage }} style={styles.postImage} />
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
				serverPosts.length > 0 ? (
					<FlatList
						data={serverPosts}
						renderItem={renderItem}
						keyExtractor={item => item.postId.toString()}
						numColumns={3}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.1}
						ListFooterComponent={renderFooter}
						onMomentumScrollBegin={() => setIsEndReached(false)}
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
