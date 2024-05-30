import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	RefreshControl,
	Text,
	TouchableOpacity,
	Modal,
	ActivityIndicator
} from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';
import { MaterialIcons } from "@expo/vector-icons";

const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.post.id === nextProps.post.id && prevProps.location === nextProps.location && prevProps.isOptionsVisibleExternal === nextProps.isOptionsVisibleExternal;
});

const PublicPosts = React.forwardRef((props, ref) => {
	const [range, setRange] = useState(null);
	const [currentPage, setCurrentPage] = useState(0);
	const [location, setLocation] = useState("");
	const [copiedLocation, setCopiedLocation] = useState("");
	const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
	const [posts, setPosts] = useState([]);
	const [refreshing, setRefreshing] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	const [optionsVisible, setOptionsVisible] = useState(false);

	useEffect(() => {
		console.log("post is", posts);
	}, [posts]);
	useEffect(() => {
		console.log("location is", location);
	}, [location]);
	React.useImperativeHandle(ref, () => ({
		getPosts: firstFetch,
	}));
	useFocusEffect(useCallback(() => {
		firstFetch();
	}, []));
	const refreshPosts = () => {
		setIsRefreshing(true);
		getPosts(null, 0);
	};
	
	const firstFetch = async () => {
		setRefreshing(true);
		const serverResponse = await axios.get(`${base_url}/post/read/1?index=0&pageCount=5&location`, {
			headers: {
				Authorization: token
			}
		});
		setPosts(serverResponse.data.data.readPostResponse);
		setLocation(serverResponse.data.data.yourLocation)
		if (serverResponse.data) {
			setRefreshing(false);
			setOptionsVisible(false);
			setTimeout(() => {
				pagerViewRef.current?.setPageWithoutAnimation(0);
				setIsRefreshing(false);
			}, 50); // 소폭의 지연을 추가하여 컴포넌트의 상태가 안정화되도록 합니다.
		}
	};
	const getPosts = async (selectedRange, index = 0) => {
		setRefreshing(true);
		let url = `${base_url}/post/read/1?index=${index}&pageCount=5&location`;
		if (selectedRange) {
			try {
				setCopiedLocation(location)
				const words = copiedLocation.split(' ');
				let newLocation = '';
				switch (selectedRange) {
					case 'small':
						newLocation = words.join(' ');
						break;
					case 'middle':
						newLocation = words.slice(0, 2).join(' ');
						break;
					case 'big':
						newLocation = words[0];
						break;
					default:
						console.log('Invalid range');
						setRefreshing(false);
						return;
				}
				console.log('Got location:', newLocation)
				url += `=${encodeURIComponent(newLocation)}`;
			} catch (error) {
				console.error('Fetching user location failed:', error);
				setRefreshing(false);
				return;
			}
		}
		
		try {
			console.log(`url is`, url);
			const serverResponse = await axios.get(url,
				{
					headers: {
						Authorization: token,
					},
				},
			);
			const newPosts = serverResponse.data.data.readPostResponse;
			if (index === 0) {
				setIsRefreshing(true); // 새로고침이 발생하면 이 플래그를 설정
			}
			if (newPosts.length === 0) {
				return;
				console.log("No more posts to load.");
			}
			setPosts(prevPosts => index === 0 ? newPosts : [...prevPosts, ...newPosts]);
		} catch (error) {
			console.error('Fetching posts failed:', error);
		} finally {
			setRefreshing(false);
			setOptionsVisible(false);
			if (index === 0) {
				setTimeout(() => {
					pagerViewRef.current?.setPageWithoutAnimation(0);
					setIsRefreshing(false);
				}, 50); // 소폭의 지연을 추가하여 컴포넌트의 상태가 안정화되도록 합니다.
			}
		}
	};
	
	const toggleOptions = () => {
		setOptionsVisible(!optionsVisible);
	};
	
	const handleBlock = async (postId) => {
		setPosts(prev => prev.filter(item => item.post_id !== postId));
		await new Promise(resolve => setTimeout(resolve, 0)); // 비동기 업데이트를 위한 Promise
	};
	const handlePageChange = (e) => {
		const newIndex = e.nativeEvent.position;
		setCurrentPage(newIndex);
		// 모든 옵션을 숨깁니다.
		setOptionsVisibleStates(prevStates => {
			const newStates = {};
			posts.forEach(post => {
				newStates[post.post_id] = false;
			});
			return newStates;
		})
		// 추가 데이터 로딩
		if (newIndex === posts.length - 1) {
			getPosts(range, posts.length);
		}
	};
	
	if (posts.length === 0) {
		return <View style={style.container}><Text>Loading...</Text></View>;
	}
	return (
		<>
			<View style={{ alignItems:"flex-end", backgroundColor: "white", position: "relative", }}>
				<TouchableOpacity
					onPress={toggleOptions}
				>
					<MaterialIcons
						name='settings'
						size={28}
						style={{
							backgroundColor:"white",
							marginRight: 10,
						}}/>
				</TouchableOpacity>
			</View>
			{optionsVisible && (
				<Modal
					animationType="slide"
					transparent={true}
					visible={optionsVisible}
					onRequestClose={toggleOptions} // 안드로이드에서 물리적 '뒤로 가기' 버튼을 눌렀을 때 호출됩니다.
				>
					<View style={style.centeredView}>
						<View style={style.modalView}>
							<TouchableOpacity
								style={style.button}
								onPress={toggleOptions}
							>
								<MaterialIcons name="backspace"></MaterialIcons>
							</TouchableOpacity>
							<View style={{marginTop: 10}}>
								<TouchableOpacity
									style={{
										backgroundColor: "grey",
										margin: 5,
										padding: 10,
										borderRadius: 5,
									}}
									onPress={() => getPosts('big')}
								>
									<Text style={style.textStyle}>넓은 범위</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										backgroundColor: "grey",
										margin: 5,
										padding: 10,
										borderRadius: 5,
									}}
									onPress={() => getPosts('middle')}
								>
									<Text style={style.textStyle}>중간 범위</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={{
										backgroundColor: "grey",
										margin: 5,
										padding: 10,
										borderRadius: 5,
									}}
									onPress={() => getPosts('small')}
								>
									<Text style={style.textStyle}>작은 범위</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal> )}
			<ScrollView
				contentContainerStyle={style.scrollViewContent}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={refreshPosts} />
				}
			>
				<PagerView
					style={style.pagerView}
					initialPage={0}
					ref={pagerViewRef}
					onPageSelected={handlePageChange}
				>
					{posts.map((post) => (
						<View key={post.postId} style={style.container}>
							<MemoizedCardComponent
								post={post}
								onBlock={handleBlock}
								isOptionsVisibleExternal={optionsVisibleStates[post.postId]}
								setIsOptionsVisibleExternal={(visible) => setOptionsVisibleStates(prev => ({ ...prev, [post.postId]: visible }))}
							/>
						</View>
					))}
				</PagerView>
			</ScrollView>
		</>
	);
});

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
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modalView: {
		position: "relative",
		margin: 10,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	},
	button: {
		position: "absolute",
		right: 2,
		top: 2,
		borderRadius: 20,
		padding: 10,
	},
	textStyle: {
		color: "black",
		fontWeight: "bold",
		textAlign: "center"
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center"
	}
});

export default PublicPosts;