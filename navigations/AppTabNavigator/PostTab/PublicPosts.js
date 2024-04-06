import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Modal } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';
import { MaterialIcons } from "@expo/vector-icons";

const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.post.id === nextProps.post.id && prevProps.location === nextProps.location;
});

const PublicPosts = React.forwardRef((props, ref) => {
	const [posts, setPosts] = useState([]); // 게시물 상태 초기화
	const [location, setLocation] = useState("");
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	const [optionsVisible, setOptionsVisible] = useState(false);
	const toggleOptions = () => {
		setOptionsVisible(!optionsVisible);
	};
	
	const getPosts = async (range = null) => {
		setRefreshing(true);
		
		// 위치 정보 요청이 필요 없는 경우 바로 공개 게시물을 가져옵니다.
		if (!range) {
			try {
				const response = await axios.get(`http://192.168.0.3:3000/posts?scope=PUBLIC&_limit=10`);
				setPosts(response.data);
			} catch (error) {
				console.error('Fetching public posts failed:', error);
			} finally {
				setRefreshing(false);
				pagerViewRef.current?.setPageWithoutAnimation(0); // PagerView의 첫 페이지로 이동합니다.
			}
			return;
		}
		
		// range가 주어진 경우, 사용자 위치에 따라 게시물을 필터링합니다.
		let newLocation = '';
		try {
			const locationResponse = await axios.get('http://192.168.0.3:3000/user_location');
			const words = locationResponse.data[0].your_location.split(' ');
			switch (range) {
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
					console.error('Invalid range');
					return;
			}
		} catch (error) {
			console.error('Fetching user location failed:', error);
			setRefreshing(false);
			return;
		}
		
		try {
			let url = `http://192.168.0.3:3000/posts?scope=PUBLIC&_limit=10`;
			if (newLocation) {
				url += `&location_contains=${encodeURIComponent(newLocation)}`;
				setLocation(newLocation);
			}
			
			const postsResponse = await axios.get(url);
			setPosts(postsResponse.data);
		} catch (error) {
			console.error('Fetching posts failed:', error);
		} finally {
			setRefreshing(false);
			setOptionsVisible(false);
			pagerViewRef.current?.setPageWithoutAnimation(0); // PagerView의 첫 페이지로 이동합니다.
		}
	};
	
	
	const getMorePosts = async () => {
		if (refreshing) return;
		console.log(posts.length);
		let url = `http://192.168.0.3:3000/posts?scope=PUBLIC&_start=${posts.length}&_limit=10`;
		if (location) {
			url += `&location_contains=${encodeURIComponent(location)}`;
		}
		try {
			const response = await axios.get(url);
			if (response.data.length === 0) {
				console.log("No more posts to load.");
				return;
			}
			setPosts(prevPosts => [...prevPosts, ...response.data]);
		} catch (error) {
			console.error('Fetching more posts failed:', error);
		}
	};
	
	const refreshPosts =  () => {
		getPosts(); // 데이터를 새로고침합니다.
		setLocation("")
	};
	
	// 외부에서 컴포넌트를 제어할 수 있도록 메서드를 제공합니다.
	React.useImperativeHandle(ref, () => ({
		getPosts: getPosts,
	}));
	
	useFocusEffect(
		useCallback(() => {
			getPosts();
			setLocation(''); // 위치 상태를 초기화(필요한 경우에만)
		}, [])
	);
	
	useEffect(() => {
		console.log(posts);
		console.log(location);
	}, [posts], [location]);
	
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
					onPageSelected={e => {
						const newIndex = e.nativeEvent.position;
						if (newIndex === posts.length - 3) {
							getMorePosts();
						}
					}}
				>
					{posts.map((post) => (
						<View key={post.post_id} style={style.container}>
							<MemoizedCardComponent post={post} location={location}/>
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