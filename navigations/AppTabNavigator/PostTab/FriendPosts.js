import React, { useState, useCallback, useRef, useEffect } from 'react';
import {View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Modal } from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';
import { MaterialIcons } from "@expo/vector-icons";

const MemoizedCardComponent = React.memo(CardComponent, (prevProps, nextProps) => {
	return prevProps.post.id === nextProps.post.id && prevProps.location === nextProps.location;
});

const FriendPosts = () => {
	const [posts, setPosts] = useState(null); // 게시물 상태 초기화
	const [location, setLocation] = useState(""); //
	const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리합니다.
	const pagerViewRef = useRef(null); // PagerView 컴포넌트를 참조하기 위한 ref입니다.
	const [currentScope, setCurrentScope] = useState('FRIEND'); // 'FRIEND' 또는 'PUBLIC'
	const [optionsVisible, setOptionsVisible] = useState(false);
	
	const toggleOptions = () => {
		setOptionsVisible(!optionsVisible);
	};
	
	const getPosts = async (scope) => {
		setRefreshing(true);
		try {
			setPosts(null)
			const response = await axios.get(`http://192.168.0.3:3000/posts?scope=${scope}&_limit=10`);
			setPosts(response.data); // 상태 업데이트
			setCurrentScope(scope); // 현재 스코프 상태 업데이트
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
			setLocation(response.data[0]); // 상태 업데이트
		} catch (error) {
			console.error('Fetching posts failed:', error);
		}
	};
	const getMorePosts = async () => {
		if (refreshing) return; // 이미 새로고침 중이라면 중복 요청 방지
		try {
			const response = await axios.get(`http://192.168.0.3:3000/posts?scope=${currentScope}&_start=${posts.length}&_limit=10`);
			setPosts(prevPosts => [...prevPosts, ...response.data]); // 기존 데이터에 추가 데이터 병합
		} catch (error) {
			console.error('Fetching more posts failed:', error);
		}
	}
	
	const refreshPosts = () => {
		getPosts(currentScope);
	};
	
	useFocusEffect(
		useCallback(() => {
			getPosts('FRIEND');
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
		<>
			<View style={{ flexDirection: "row" }}>
				<TouchableOpacity
					style={{
						flex: 1,
						alignItems: "center",
						backgroundColor: currentScope === 'FRIEND' ? '#4B89DC' : 'white',
						height: 20,
					}}
					onPress={() => {setCurrentScope('FRIEND'); getPosts('FRIEND');}}
				>
					<Text
						style={{
							color: currentScope === 'FRIEND' ? 'white' : 'grey'// 조건부 배경색 설정
						}}
					>
						FRIEND</Text>
				</TouchableOpacity>
				<View style={{ flex: 1, flexDirection: "row", backgroundColor: "white" }}>
					<TouchableOpacity
						style={{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: currentScope === 'PUBLIC' ? '#4B89DC' : 'white', // 조건부 배경색 설정
							height: 20,
						}}
						onPress={() => {setCurrentScope('PUBLIC'); getPosts('PUBLIC');}}
					>
						<Text
							style={{
								color: currentScope === 'PUBLIC' ? 'white' : 'grey'
							}}
						>
							PUBLIC</Text>
					</TouchableOpacity>
					{currentScope === 'PUBLIC' && (
						<TouchableOpacity
							onPress={toggleOptions}
						>
							<MaterialIcons
								name='settings'
								size={20}
								style={{
									backgroundColor:"white",
									height: 20,
									width:20,
									marginRight:10,
									marginLeft: 10,
								}}/>
						</TouchableOpacity>
					)}
					{optionsVisible && (
						<Modal
							animationType="slide"
							transparent={true}
							visible={optionsVisible}
							onRequestClose={() => setOptionsVisible(!optionsVisible)} // 안드로이드에서 물리적 '뒤로 가기' 버튼을 눌렀을 때 호출됩니다.
						>
							<View style={style.centeredView}>
								<View style={style.modalView}>
									<Text style={style.modalText}>현재 피드 숨기기</Text>
									<TouchableOpacity
										style={[style.button, style.buttonClose]}
										onPress={() => setOptionsVisible(!optionsVisible)}
									>
										<Text style={style.textStyle}>닫기</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Modal>
					)}
				</View>
			</View>
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
						if (newIndex === posts.length - 6) {
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
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	modalView: {
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
		borderRadius: 20,
		padding: 10,
		elevation: 2
	},
	buttonClose: {
		backgroundColor: "#2196F3",
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center"
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center"
	}
});

export default FriendPosts;