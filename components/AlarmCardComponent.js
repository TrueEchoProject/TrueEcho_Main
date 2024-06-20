import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Share,
	Dimensions,
	ActivityIndicator,
	Image
} from 'react-native';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import
import { Ionicons, Feather, SimpleLineIcons } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton";
import { CommentModal } from './CommentModal'; // 댓글 창 컴포넌트 임포트
import { useNavigation } from '@react-navigation/native'; // useNavigation import
import Api from '../Api';
import * as Linking from 'expo-linking';

const AlarmCardComponent = ({ post, onActionComplete }) => {
	const navigation = useNavigation(); // useNavigation 훅 사용
	const [isOptionsVisible, setIsOptionsVisible] = useState(false);
	const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [imageButtonHeight, setImageButtonHeight] = useState(0);
	const [isLiked, setIsLiked] = useState(post.myLike); // 좋아요 상태 관리
	const [likesCount, setLikesCount] = useState(post.likesCount); // 좋아요 수 관리
	const [isCommentVisible, setIsCommentVisible] = useState(false); // 댓글 창 표시 상태
	const [layoutSet, setLayoutSet] = useState(false); // 레이아웃 설정 여부 상태 추가
	const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
	const windowWidth = Dimensions.get('window').width;
	const [friendLook, setFriendLook] = useState(true); // 좋아요 수 관리
	
	const toggleLike = async () => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		
		const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
		const newIsLiked = !isLiked;
		setIsLiked(newIsLiked);
		setLikesCount(newLikesCount);
		
		try {
			const response = await Api.patch(`/post/update/likes`, {
				postId: post.postId,
				isLike: newIsLiked,
			});
			if (response.data) {
				const FcmResponse = await Api.post(`/noti/sendToFCM`, {
					title: null,
					body: null,
					data: {
						userId: post.userId,
						notiType: 6,
						contentId: post.postId
					}
				});
			}
		} catch (error) {
			console.error('Error updating likes count:', error);
		} finally {
			setIsLoading(false);
		}
	};
	const toggleBlock = async () => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		
		try {
			const formData = new FormData();
			formData.append('blockUserId', post.userId);
			
			const response = await Api.post(`/blocks/add`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			if (response.data) {
				alert('유저를 정상적으로 차단했습니다');
				hideOptions();
				console.log('Blocked user:', post.userId);
				console.log('Blocked post:', post.postId);
				onActionComplete && onActionComplete(post.postId);
			}
		} catch (error) {
			console.error('Error while blocking the user:', error.response ? error.response.data : error.message);
		} finally {
			setIsLoading(false);
		}
	};
	const toggleDelete = async () => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		
		try {
			const response = await Api.delete(`/post/delete/${post.postId}`);
			if (response.data) {
				alert('정상적으로 게시물을 삭제했습니다');
				hideOptions();
				console.log('Blocked user:', post.userId);
				console.log('Blocked post:', post.postId);
				onActionComplete && onActionComplete(post.postId);
			}
		} catch (error) {
			console.error('Error while deleting the post:', error.response ? error.response.data : error.message);
		} finally {
			setIsLoading(false);
		}
	};
	const toggleFriendSend = async () => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		
		try {
			const formData = new FormData();
			formData.append('targetUserId', post.userId);
			
			const response = await Api.post(`/friends/add`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			if (response.data) {
				setFriendLook(false);
				console.log(response.data.message);
				const FcmResponse = await Api.post(`/noti/sendToFCM`, {
					title: null,
					body: null,
					data: {
						userId: post.userId,
						notiType: 7,
						contentId: post.postId
					}
				});
			}
		} catch (error) {
			console.error('Error updating Send:', error);
		} finally {
			setIsLoading(false);
		}
	};
	
	const toggleOptionsVisibility = () => {
		setIsOptionsVisible(!isOptionsVisible);
	};
	const hideOptions = () => {
		if (isOptionsVisible) {
			setIsOptionsVisible(false);
		}
	};
	const toggleCommentVisibility = () => {
		setIsCommentVisible(!isCommentVisible);
	};
	
	const onImageButtonLayout = (event) => {
		if (layoutSet) return; // 레이아웃이 이미 설정되었다면 추가 업데이트 방지
		
		const { height } = event.nativeEvent.layout;
		setImageButtonHeight(height);
		setLayoutSet(true); // 레이아웃 설정 완료 표시
	};
	
	return (
		<TouchableWithoutFeedback onPress={hideOptions}>
			<View style={styles.cardContainer}>
				<View style={styles.cardItem}>
					<View style={styles.left}>
						<TouchableOpacity onPress={() => {navigation.navigate("UserAlarm", {userId : post.userId})}}>
							<Image
								style={styles.thumbnail}
								source={{ uri: post.profileUrl }}
							/>
						</TouchableOpacity>
						<View style={styles.body}>
							<Text style={{fontSize: 15, fontWeight: "500"}}>{post.username}</Text>
							<Text style={{fontSize: 12, fontWeight: "300"}}note>{new Date(post.createdAt).toDateString()}</Text>
						</View>
					</View>
					<View style={{
						flexDirection: "column",
						marginLeft: "auto",
					}}>
						{post.friend === false && ( friendLook === true ? (
								<View style={[
									styles.right,
									{
										backgroundColor: "#3B4664",
										padding: 5,
										marginBottom: 5,
										borderRadius: 3,
									}
								]}>
									<TouchableOpacity onPress={toggleFriendSend}>
										<Text style={{
											fontSize: 15,
											color: "white",
										}}>
											친구 추가
										</Text>
									</TouchableOpacity>
								</View>
							) : (
								<View style={[
									styles.right,
									{
										backgroundColor: "#3B4664",
										padding: 5,
										marginBottom: 5,
										borderRadius: 3,
									}
								]}>
									<Text style={{
										fontSize: 15,
										color: "white",
									}}>
										추가 완료
									</Text>
								</View>
							)
						)}
						<TouchableOpacity style={styles.right} onPress={toggleOptionsVisibility} onLayout={(event) => {
							const layout = event.nativeEvent.layout;
							setButtonLayout(layout);
						}}>
							<SimpleLineIcons name="options-vertical" size={20} color="black" />
						</TouchableOpacity>
					</View>
				</View>
				{isOptionsVisible && (
					<View style={[
						styles.optionsContainer,
						post.friend === false ?
							{ top: buttonLayout.y + buttonLayout.height, right: 0 } :
							{ top: buttonLayout.y + buttonLayout.height + 30, right: 0 }
					]}>
						{post.mine ? (
							<TouchableOpacity onPress={toggleDelete} style={{ flexDirection:'row', alignItems: 'center', }}>
								<Feather name='alert-triangle' style={{ marginLeft: 10, color: 'red' }}/>
								<Text style={[styles.optionItem, {color: 'red'}]}>삭제하기</Text>
							</TouchableOpacity>
						) : (
							<TouchableOpacity onPress={toggleBlock} style={{ flexDirection:'row', alignItems: 'center', }}>
								<Feather name='alert-triangle' style={{ marginLeft: 10, color: 'red' }}/>
								<Text style={[styles.optionItem, {color: 'red'}]}>사용자 차단하기</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
				<View style={styles.imageButtonContainer} onLayout={onImageButtonLayout}>
					<ImageButton
						front_image={post.postFrontUrl}
						back_image={post.postBackUrl}
						containerHeight={imageButtonHeight}
						windowWidth={windowWidth}
					/>
				</View>
				<View style={{ padding: 5, zIndex: 2, minHeight: 90, backgroundColor: "white", }}>
					<View style={[styles.cardItem, {padding: 10}]}>
						<Text style={styles.title}>{post.title}</Text>
					</View>
					<View style={styles.cardItem}>
						<View style={styles.left}>
							<TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
								<Ionicons name={isLiked ? 'heart' : 'heart-outline'} style={styles.icon} size={24} color={isLiked ? 'red' : 'black'}/>
								<Text>{likesCount}</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.iconButton}>
								<Ionicons name='chatbubbles' style={styles.icon} onPress={toggleCommentVisibility} size={24}/>
							</TouchableOpacity>
						</View>
						<CommentModal
							isVisible={isCommentVisible}
							postId={post.postId}
							userId={post.userId}
							onClose={() => setIsCommentVisible(false)}
						/>
						{post.status === "FREETIME" || post.status === "LATETIME" ? (
							<View style={[
								styles.right,
								{
									marginLeft: 'auto',
									padding: 5,
									paddingLeft: 30,
									paddingRight: 30,
									backgroundColor: "#3B4664",
									borderRadius: 10,}
							]}>
								{post.status === "FREETIME" && (
									<Text style={{ color: "white", fontSize: 25}}>free</Text>
								)}
								{post.status === "LATETIME" && (
									<Text style={{ color: "white", fontSize: 25}}>late</Text>
								)}
							</View>
						) : null}
					</View>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};


const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageButtonContainer: {
		flex: 1,
	},
	optionsContainer: {
		position: 'absolute',
		zIndex: 2,
		backgroundColor: 'white',
		padding: 12,
		paddingLeft: 14,
		borderRadius: 4,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		shadowOpacity: 0.3,
		elevation: 4,
		marginTop: 10,
	},
	optionItem: {
		marginLeft: 10,
		marginRight: 10,
		fontSize: 15,
	},
	cardContainer: {
		flex: 1,
	},
	cardItem: {
		padding: 5,
		flexDirection: 'row',
		alignItems: 'center',
	},
	left: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	body: {
		marginLeft: 10,
		height: 55,
	},
	thumbnail: {
		width: 44,
		height: 44,
		borderRadius: 22,
	},
	title: {
		fontWeight: '900',
	},
	iconButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 15,
	},
	icon: {
		marginRight: 4,
	},
	right: {
		marginLeft: 'auto',
	},
});

export default AlarmCardComponent