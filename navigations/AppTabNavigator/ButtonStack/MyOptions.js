import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Share, Dimensions, } from 'react-native';
import axios from 'axios';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons, Feather, SimpleLineIcons } from "@expo/vector-icons";
import { ImageButton } from "./ImageButton";
import { CommentModal } from './CommentModal'; // 댓글 창 컴포넌트 임포트

const CardComponent = ({ post, isOptionsVisibleExternal, setIsOptionsVisibleExternal }) => {
	const [isOptionsVisible, setIsOptionsVisible] = useState(isOptionsVisibleExternal || false);
	const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [imageButtonHeight, setImageButtonHeight] = useState(0);
	const [isLiked, setIsLiked] = useState(false); // 좋아요 상태 관리
	const [likesCount, setLikesCount] = useState(post.likes_count); // 좋아요 수 관리
	const [isCommentVisible, setIsCommentVisible] = useState(false); // 댓글 창 표시 상태
	const [layoutSet, setLayoutSet] = useState(false); // 레이아웃 설정 여부 상태 추가
	const windowWidth = Dimensions.get('window').width;
	const [friendLook, setFriendLook] = useState(true); // 좋아요 수 관리
	
	useEffect(() => {
		setIsOptionsVisible(isOptionsVisibleExternal);
		console.log(`Options Visible for ${post.post_id}: ${isOptionsVisibleExternal}`);
	}, [isOptionsVisibleExternal]); // 이제 외부에서 받은 props가 변경될 때마다 로그를 찍고 상태를 업데이트합니다.
	
	const toggleOptionsVisibility = () => {
		const newVisibility = !isOptionsVisible;
		setIsOptionsVisible(newVisibility); // 내부 상태 업데이트
		setIsOptionsVisibleExternal(newVisibility); // 외부 상태 업데이트로 전파
	};
	const onImageButtonLayout = (event) => {
		if (layoutSet) return; // 레이아웃이 이미 설정되었다면 추가 업데이트 방지
		
		const { height } = event.nativeEvent.layout;
		setImageButtonHeight(height);
		setLayoutSet(true); // 레이아웃 설정 완료 표시
	};
	const hideOptions = () => {
		if (isOptionsVisible) {
			setIsOptionsVisible(false);
			setIsOptionsVisibleExternal(false); // 외부 상태도 업데이트
		}
	};
	const toggleLike = async () => {
		const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
		setIsLiked(!isLiked);
		setLikesCount(newLikesCount);
		console.log(newLikesCount)
		console.log(post.post_id)
		try {
			await axios.patch(`http://192.168.0.3:3000/posts/${post.post_id}`, {
				likes_count: newLikesCount
			});
			console.log('Likes count updated successfully');
		} catch (error) {
			console.error('Error updating likes count:', error);
		}
	};
	const toggleBlock = async () => {
		console.log(post.username);
		try {
			const response = await axios.post(`http://192.168.0.3:3000/blocked_users`, {
				username: post.username,
				profile_url: post.profile_url
			});
			console.log('User blocked successfully');
			alert('유저를 정상적으로 차단했습니다');
			hideOptions()
		} catch (error) {
			console.error('Error while blocking the user:', error.response ? error.response.data : error.message);
			// HTTP 상태 코드가 409인 경우 여기서 처리
			if (error.response && error.response.status === 409) {
				alert('This user is already blocked.');
				hideOptions()
			}
		}
	};
	
	const toggleFriendSend = async () => {
		console.log(post.username);  // 이것은 여전히 정상적으로 작동합니다.
		try {
			await axios.post(`http://192.168.0.3:3000/friendSend`, {
				friendSendUser: post.username
			});
			console.log('Send updated successfully');
			setFriendLook(false);
		} catch (error) {
			console.error('Error updating Send:', error);
		}
	};
	const toggleCommentVisibility = () => {
		setIsCommentVisible(!isCommentVisible);
	};
	
	return (
		<TouchableWithoutFeedback onPress={hideOptions}>
			<View style={styles.cardContainer}>
				<View style={styles.cardItem}>
					<View style={styles.left}>
						<Image
							style={styles.thumbnail}
							source={{ uri: post.profile_url }}
						/>
						<View style={styles.body}>
							<Text style={{fontSize: 15, fontWeight: "500"}}>{post.username}</Text>
							<Text style={{fontSize: 12, fontWeight: "300"}}note>{new Date(post.created_at).toDateString()}</Text>
							<Text style={{fontSize: 12, fontWeight: "300"}}>{post.location}</Text>
						</View>
					</View>
					<View style={{
						flexDirection: "column",
						marginLeft: "auto",
					}}>
						{post.friend === 1 && ( friendLook === true ? (
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
						post.friend === 1 ?
							{ top: buttonLayout.y + buttonLayout.height, right: 0 } :
							{ top: buttonLayout.y + buttonLayout.height + 30, right: 0 }
					]}>
						<TouchableOpacity onPress={toggleBlock} style={{ flexDirection:'row', alignItems: 'center', }}>
							<Feather name='alert-triangle' style={{ marginLeft: 10, color: 'red' }}/>
							<Text style={[styles.optionItem, {color: 'red'}]}>사용자 차단하기</Text>
						</TouchableOpacity>
					</View>
				)}
				<View style={styles.imageButtonContainer} onLayout={onImageButtonLayout}>
					<ImageButton
						front_image={post.post_front_url}
						back_image={post.post_back_url}
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
							<TouchableOpacity onPress={() => Share.share({ message: `${post.title}: http://192.168.0.3:3000/posts?post_id=${post.post_id}/` })}>
								<MaterialIcons name='send' style={styles.icon} size={24} />
							</TouchableOpacity>
						</View>
						<CommentModal
							isVisible={isCommentVisible}
							postId={post.post_id}
							onClose={() => setIsCommentVisible(false)}
						/>
						{post.post_status === 1 || post.post_status === 2 ? (
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
								{post.post_status === 1 && (
									<Text style={{ color: "white", fontSize: 25}}>free</Text>
								)}
								{post.post_status === 2 && (
									<Text style={{ color: "white", fontSize: 25}}>late</Text>
								)}
							</View>
						) : null}
					</View>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
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

export default React.memo(CardComponent)