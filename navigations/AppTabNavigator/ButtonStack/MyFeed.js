import React, { useEffect, useState } from 'react';
import {View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions} from 'react-native';
import Api from '../../../Api';
import { LinearGradient } from "expo-linear-gradient";

const windowHeight = Dimensions.get("window").height;
const windowWidth = Dimensions.get("window").width;
const MyFeed = ({ navigation, route }) => {
	const [serverPosts, setServerPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [page, setPage] = useState(0); // 페이지 번호 상태 추가
	const [isFetchingMore, setIsFetchingMore] = useState(false); // 추가 데이터 로드 상태 추가
	const [isEndReached, setIsEndReached] = useState(false); // onEndReached 호출 상태
	const [noMoreData, setNoMoreData] = useState(false); // 더 이상 불러올 데이터가 없는지 확인하는 상태
	const defaultImage = "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";

	useEffect(() => {
		if (route.params?.deletedPostId) {
			console.log('Received deletedPostId response:', route.params.deletedPostId);
			const { deletedPostId } = route.params;
			setServerPosts(prevPosts => prevPosts.filter(post => post.postId !== deletedPostId));
		}
	}, [route.params?.deletedPostId]);
	useEffect(() => {
		if (serverPosts) {
			console.log('server updated:', serverPosts);
		}
	}, [serverPosts]);
	useEffect(() => {
		fetchData(page);
	}, []);

	const fetchData = async (page) => {
		try {
			const serverResponse = await Api.get(`/post/read/2?index=${page}&pageCount=8`);
			if (serverResponse.data.message === "게시물을 조회를 실패했습니다.") {
				return;
			} else {
				const newPosts = serverResponse.data.data.readPostResponse;
				if (newPosts.length === 0) {
					setNoMoreData(true);
				} else {
					setServerPosts(prevPosts => {
						const postIds = new Set(prevPosts.map(post => post.postId));
						const filteredNewPosts = newPosts.filter(post => !postIds.has(post.postId));
						return [...prevPosts, ...filteredNewPosts];
					});
				}
			}
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching data', error);
		} finally {
			setIsFetchingMore(false);
		}
	};
	const handleLoadMore = () => {
		if (!isFetchingMore && !isEndReached && !noMoreData) {
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
		<LinearGradient
			colors={["#1BC5DA", "#263283"]}
			style={styles.PostContainerGradient}
		>
			<TouchableOpacity
				onPress={() => navigation.navigate("FeedAlarm", { postId: item.postId })}
				style={styles.PostContainerGradient}
			>
				<Image
					style={styles.Post}
					source={{ uri: item.postBackUrl || item.postFrontUrl || defaultImage }}
				/>
			</TouchableOpacity>
		</LinearGradient>
	);
	const renderFooter = () => {
		if (noMoreData) {
			return (
				<View style={styles.footer}>
					<Text style={{ color: 'white' }}>더 이상 불러올 게시물이 없습니다.</Text>
				</View>
			);
		}
		if (!isFetchingMore) return null;
		return (
			<View style={styles.footer}>
				<ActivityIndicator size="small" color="#0000ff" />
			</View>
		);
	};

	if (isLoading) {
		return <View style={styles.loader}><ActivityIndicator size="large" color="#0000ff" /></View>;
	}
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
						numColumns={2}
						key="flatlist-columns-2" // 고유한 key 설정
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.1}
						ListFooterComponent={renderFooter}
						onMomentumScrollBegin={() => setIsEndReached(false)}
						contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
					/>
				) : (
					<View style={styles.emptyContainer}>
						<Text style={styles.emptyText}>게시물을 추가해보세요!</Text>
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
		backgroundColor: '#000', // 배경색을 검정으로 설정
	},
	PostContainerGradient: {
		height: windowHeight * 0.3,
		width: windowWidth * 0.4,
		borderRadius: 5,
		margin: 10,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
	},
	PostContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	Post: {
		height: windowHeight * 0.29,
		width: windowWidth * 0.38,
		borderRadius: 3,
		alignItems: 'center',
		borderColor: "white",
		borderWidth: 2,
		justifyContent: 'center',
	},
	footer: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		color: 'white',
		fontSize: 24,
	},
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	}
});

export default MyFeed;
