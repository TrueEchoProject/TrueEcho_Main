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
	const [location, setLocation] = useState("");
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

// 범위에 따른 위치 데이터 처리를 위한 통합 함수
	const getLocationData = async (scope, range) => {
		setRefreshing(true);
		try {
			setPosts(null);
			const response1 = await axios.get('http://192.168.0.3:3000/user_location');
			let newLocation;
			const words = response1.data[0].your_location.split(' ');
			
			// 범위에 따라 처리
			switch (range) {
				case 'small':
					newLocation = words.join(' '); // 'small'의 경우 전체 위치 사용
					break;
				case 'middle':
					newLocation = words.slice(0, 2).join(' '); // 'middle'은 앞의 두 단어 사용
					break;
				case 'big':
					newLocation = words[0]; // 'big'은 첫 단어만 사용
					break;
				default:
					console.error('Invalid range');
					return;
			}
			
			console.log(newLocation);
			const response2 = await axios.get(`http://192.168.0.3:3000/posts?scope=${scope}&_limit=30&location_contains=${newLocation}`);
			setPosts(response2.data); // 상태 업데이트
		} catch (error) {
			console.error('Fetching posts failed:', error);
		} finally {
			setRefreshing(false);
			setOptionsVisible(false); // 모달 닫기
		}
	};
	
	
	const getMorePosts = async () => {
		if (refreshing) return; // 이미 새로고침 중이라면 중복 요청 방지
		try {
			let url = `http://192.168.0.3:3000/posts?scope=${currentScope}&_start=${posts.length}&_limit=10`;
			// location 상태가 설정되어 있다면 location_contains 쿼리 파라미터 추가
			if (location) {
				url += `&location_contains=${encodeURIComponent(location)}`;
			}
			const response = await axios.get(url);
			setPosts(prevPosts => [...prevPosts, ...response.data]); // 기존 데이터에 추가 데이터 병합
			if (response.data.length === 0) {
				// 더 불러올 피드가 없으면 여기서 처리
				console.log("No more posts to load.");
				return; // 함수를 여기서 종료하여 추가 작업 방지
			}
		} catch (error) {
			console.error('Fetching more posts failed:', error);
		}
	};
	
	const refreshPosts = () => {
		getPosts(currentScope);
	};
	
	useFocusEffect(
		useCallback(() => {
			getPosts('FRIEND');
			setLocation()
		}, [])
	);
	
	useEffect(() => {
		console.log(posts);
		console.log(location);
	}, [posts], [location]);
	
	if (!posts) {
		return <View style={style.container}><Text>Loading...</Text></View>;
	}
	
	return (
		<>
			<View style={{ flexDirection: "row", height: 30 }}>
				<TouchableOpacity
					style={{
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: currentScope === 'FRIEND' ? '#4B89DC' : 'white',
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
								size={28}
								style={{
									backgroundColor:"white",
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
									<TouchableOpacity
										style={style.button}
										onPress={() => setOptionsVisible(!optionsVisible)}
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
											onPress={() => getLocationData(currentScope, 'big')}
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
											onPress={() => getLocationData(currentScope, 'middle')}
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
											onPress={() => getLocationData(currentScope, 'small')}
										>
											<Text style={style.textStyle}>작은 범위</Text>
										</TouchableOpacity>
									</View>
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

export default FriendPosts;