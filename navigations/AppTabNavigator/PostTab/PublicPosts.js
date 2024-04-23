import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Modal } from 'react-native';
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
	const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
	const [posts, setPosts] = useState([]);
	const [location, setLocation] = useState("");
	const [refreshing, setRefreshing] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const pagerViewRef = useRef(null);
	const [optionsVisible, setOptionsVisible] = useState(false);
	
	const toggleOptions = () => {
		setOptionsVisible(!optionsVisible);
	};
	
	const getPosts = async (selectedRange = range, start = 0) => {
		setRefreshing(true);
		const limit = 10; // 한 번에 불러올 게시물 수
		let url = `http://192.168.0.3:3000/posts?scope=PUBLIC&_start=${start}&_limit=${limit}`;
		if (selectedRange) {
			try {
				const locationResponse = await axios.get('http://192.168.0.3:3000/user_location');
				const words = locationResponse.data[0].your_location.split(' ');
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
				setLocation(newLocation);
				url += `&location_contains=${encodeURIComponent(newLocation)}`;
			} catch (error) {
				console.error('Fetching user location failed:', error);
				setRefreshing(false);
				return;
			}
		} else if (location) {
			url += `&location_contains=${encodeURIComponent(location)}`;
		}
		
		try {
			const postsResponse = await axios.get(url);
			const newPosts = postsResponse.data;
			setPosts(prevPosts => start === 0 ? newPosts : [...prevPosts, ...newPosts]);
			if (start === 0) {
				setIsRefreshing(true); // 새로고침이 발생하면 이 플래그를 설정
			}
			if (newPosts.length === 0) {
				console.log("No more posts to load.");
			}
		} catch (error) {
			console.error('Fetching posts failed:', error);
		} finally {
			setRefreshing(false);
			setOptionsVisible(false);
			if (start === 0) {
				setTimeout(() => {
					pagerViewRef.current?.setPageWithoutAnimation(0);
					setIsRefreshing(false);
				}, 50); // 소폭의 지연을 추가하여 컴포넌트의 상태가 안정화되도록 합니다.
			}
		}
	};
	const refreshPosts = () => {
		setLocation('');
		setRange(null);
		setIsRefreshing(true);
		getPosts(null, 0);
	};
	
	React.useImperativeHandle(ref, () => ({
		getPosts: refreshPosts,
	}));
	
	useFocusEffect(useCallback(() => {
		refreshPosts();
	}, []));
	
	useEffect(() => {
		console.log(posts);
		console.log(location);
	}, [posts], [location]);
	
	if (posts.length === 0) {
		return <View style={style.container}><Text>Loading...</Text></View>;
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
			getPosts(range, posts.length);
		}
	};
	
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
						<View key={post.post_id} style={style.container}>
							<MemoizedCardComponent
								post={post}
								isOptionsVisibleExternal={optionsVisibleStates[post.post_id]}
								setIsOptionsVisibleExternal={(visible) => setOptionsVisibleStates(prev => ({ ...prev, [post.post_id]: visible }))}
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