import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	ScrollView,
	TextInput,
	PanResponder,
	Animated,
	Platform,
	KeyboardAvoidingView,
	Alert,
	ActivityIndicator,
	Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import
import { AntDesign } from "@expo/vector-icons";
import Api from '../Api';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
export const CommentModal = React.memo(({ userId, isVisible, postId, onClose }) => {
	const insets = useSafeAreaInsets(); // Safe Area 여백 얻기
	const initialMarginTop = Platform.OS === 'ios' ? windowHeight * 0.3 + insets.top : windowHeight * 0.3;
	const marginTopLimit = Platform.OS === 'ios' ? insets.top : 0;
	const [page, setPage] = useState(0); // 페이지 번호
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [commentNone, setCommentNone] = useState(false);
	const [showUnderComments, setShowUnderComments] = useState({});
	const [textInputValue, setTextInputValue] = useState('');
	const animatedHeight = useRef(new Animated.Value(initialMarginTop)).current;
	const scrollViewRef = useRef(null);
	const commentRefs = useRef({});
	const scrollPositionRef = useRef(0); // 스크롤 위치 저장용
	const [replyingTo, setReplyingTo] = useState(null); // 답글을 다는 댓글의 ID
	const navigation = useNavigation();
	const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
	const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
	
	useEffect(() => {
		if (isVisible) {
			console.log(postId);
			setLoading(true);
			setTextInputValue(''); // 입력 필드 초기화
			setShowUnderComments({});
			setReplyingTo(null);
			setCommentNone(false);
			setPage(0);
			setHasMore(true); // 모달이 다시 열릴 때 더 불러올 데이터가 있다고 가정
			Animated.timing(animatedHeight, {
				toValue: initialMarginTop, // 모달을 초기 높이로 설정
				duration: 0, // 즉시 변경되도록 시간을 0으로 설정
				useNativeDriver: false
			}).start();
		} else {
			setComments([]);
			setPage(0); // 페이지 번호 초기화
		}
	}, [isVisible, postId]);
	useEffect(() => {
		if (loading) {
			fetchComments(page);
		}
	}, [loading]);
	
	const fetchComments = async (index = 0) => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		
		try {
			const currentPosition = scrollPositionRef.current;
			const serverResponse = await Api.get(`/post/read/comment/${postId}?index=${index}&pageCount=10`);
			if (serverResponse.data.status !== 202) {
				console.error("Failed to load comments:", serverResponse.data.message);
				return;
			}
			const fetchedComments = serverResponse.data.data.comments;
			
			if (fetchedComments && fetchedComments.length > 0) {
				if (index === 0) {
					setComments(fetchedComments);
					setTimeout(() => {
						scrollViewRef.current?.scrollTo({ y: 0, animated: false }); // 스크롤을 최상단으로 설정
					}, 0);
				} else {
					setComments(prevComments => [...prevComments, ...fetchedComments]);
				}
				setCommentNone(false);
				if (fetchedComments.length < 10) {
					setHasMore(false); // 더 이상 불러올 데이터가 없음
				}
			} else {
				setCommentNone(true);
				setHasMore(false); // 더 이상 불러올 데이터가 없음
			}
		} catch (error) {
			console.error('Fetching comments failed:', error.message || error);
		} finally {
			setLoading(false);
			setIsLoading(false); // 로딩 상태 종료
		}
	};
	const handleScroll = ({ nativeEvent }) => {
		const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
		scrollPositionRef.current = contentOffset.y;
		
		if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20 && !loading && hasMore) {
			setPage(prevPage => prevPage + 1);
			setLoading(true); // 추가 데이터 로드 중 상태 설정
		}
	};

	const handleDeleteComment = async (commentId) => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		
		Alert.alert(
			"댓글 삭제",
			"이 댓글을 삭제하시겠습니까?",
			[
				{ text: "취소", onPress: () => console.log("삭제 취소"), style: "cancel" },
				{ text: "삭제", onPress: async () => {
						try {
							const response = await Api.delete(`/post/delete/comment/${commentId}`);
							console.log(response.data.message);
							setTextInputValue('');
							setComments([]);
							setShowUnderComments({});
							setReplyingTo(null);
							setTextInputValue("");
							setCommentNone(false);
							setPage(0);
							setLoading(true);
							await fetchComments(0);
						} catch (error) {
							console.error('댓글 삭제 실패:', error);
							setTextInputValue(''); // 입력 필드 초기화
							setShowUnderComments({});
							setReplyingTo(null);
						} finally {
							setIsLoading(false); // 로딩 상태 종료
						}
					}}
			]
		);
	};
	const handleSubmitComment = async () => {
		if (isLoading) return; // 요청 중일 때 추가 요청 차단
		setIsLoading(true);
		if (!textInputValue.trim()) {
			alert("글을 입력해주세요.");
			setIsLoading(false); // 입력 유효성 검사 실패 시 로딩 상태 종료
			return;
		}
		
		try {
			const response = await Api.post(`/post/write/comment`, {
				postId: postId,
				parentCommentId: replyingTo,
				content: textInputValue
			});
			let FcmResponse;
			if (replyingTo) {
				const parentComment = comments.find(comment => comment.commentId === replyingTo);
				console.log('Sending FCM to user:', parentComment.userId);
				FcmResponse = await Api.post(`/noti/sendToFCM`, {
					title: null,
					body: null,
					data: {
						userId: parentComment.userId,
						notiType: 5,
						contentId: postId
					}
				});
			} else {
				console.log('Sending FCM to user:', userId);
				FcmResponse = await Api.post(`/noti/sendToFCM`, {
					title: null,
					body: null,
					data: {
						userId: userId,
						notiType: 4,
						contentId: postId
					}
				});
			}
			if (FcmResponse.data) {
				console.log('FCM Response:', FcmResponse.data);
			}
			if (response.data.message === "해당 게시물의 댓글 생성을 성공했습니다.") {
				setTextInputValue('');
				setReplyingTo(null);
				setShowUnderComments({});
				setPage(0);
				setComments([]);
				setLoading(true);
				await fetchComments(0);
			}
		} catch (error) {
			console.error('댓글 추가 실패:', error);
		} finally {
			setTextInputValue('');
			setReplyingTo(null);
			setShowUnderComments({});
			setLoading(false);
			setIsLoading(false); // 로딩 상태 종료
		}
	};
	
	const CommentItem = React.memo(({ comment, toggleUnderComments, showUnderComments, index }) => {
		const isReplyingTo = replyingTo === comment.commentId; // 현재 답글을 작성 중인지 확인
		const commentItemStyle = isReplyingTo
			? [styles.commentItem, styles.replyingCommentItem] // 답글 작성 중 스타일 적용
			: styles.commentItem;
		const commentItemRef = useRef(null);
		
		useEffect(() => {
			commentRefs.current[comment.commentId] = commentItemRef.current;
			return () => {
				delete commentRefs.current[comment.commentId]; // Cleanup on unmount
			};
		}, [comment.commentId]);
		
		const formatDate = (dateString) => {
			const date = new Date(dateString);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day} ${hours}:${minutes}`;
		};
		
		return (
			<View style={commentItemStyle} ref={commentItemRef}>
				<TouchableOpacity onPress={() => navigation.navigate("UserAlarm", { userId: comment.userId })}>
					<Image style={styles.profileImage} source={{ uri: comment.profileURL }} />
				</TouchableOpacity>
				<Text>Date: {formatDate(comment.createdAt)}</Text>
				<Text style={styles.commentText}>{comment.username}: {comment.content}</Text>
				{comment.mine ?
					<TouchableOpacity onPress={() => handleDeleteComment(comment.commentId)}>
						<Text>삭제</Text>
					</TouchableOpacity> : null
				}
				<TouchableOpacity onPress={() => setReplyingTo(comment.commentId)}>
					<Text>답글 달기</Text>
				</TouchableOpacity>
				{comment.underCommentCount > 0 && (
					<TouchableOpacity onPress={() => toggleUnderComments(index)}>
						<Text>답글 {comment.underCommentCount}개 더보기</Text>
						{showUnderComments[index] ? <Text>▲</Text> : <Text>▼</Text>}
					</TouchableOpacity>
				)}
				<UnderComments commentId={comment.commentId} underComments={comment.underComments} isVisible={showUnderComments[index]} />
			</View>
		);
	});
	const UnderCommentItem = ({ underComment }) => {
		const formatDate = (dateString) => {
			const date = new Date(dateString);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day} ${hours}:${minutes}`;
		};
		
		return (
			<View style={styles.underCommentItem}>
				<TouchableOpacity onPress={() => navigation.navigate("UserAlarm", { userId: underComment.userId })}>
					<Image style={styles.profileImage} source={{ uri: underComment.profileURL }} />
				</TouchableOpacity>
				<Text>Date: {formatDate(underComment.createdAt)}</Text>
				<Text style={styles.underCommentText}>{underComment.username}: {underComment.content}</Text>
				{underComment.mine ?
					<TouchableOpacity onPress={() => handleDeleteComment(underComment.commentId)}>
						<Text>삭제</Text>
					</TouchableOpacity> : null
				}
			</View>
		);
	};
	const UnderComments = React.memo(({ underComments, isVisible, commentId }) => {
		return isVisible ? (
			<View>
				{underComments.map((underComment, index) => (
					<UnderCommentItem key={index} underComment={underComment} commentId={commentId} />
				))}
			</View>
		) : null;
	});
	const toggleUnderComments = (index) => {
		setShowUnderComments(prevState => ({
			...prevState,
			[index]: !prevState[index]
		}));
	};
	
	const handleInputFocus = () => {
		// 키보드가 올라올 때 모달을 상단으로 이동시키는 애니메이션
		Animated.timing(animatedHeight, {
			toValue: marginTopLimit, // 모달을 최상단까지 올림 (iOS의 경우 Safe Area 고려)
			duration: 300, // 키보드 올라오는 시간과 유사하게 설정
			useNativeDriver: false,
		}).start();
	};
	const panResponder = useMemo(() => PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderMove: (_, gestureState) => {
			const dragResponse = gestureState.dy * 0.1;
			let newMarginTop = animatedHeight._value + dragResponse;
			
			newMarginTop = Math.min(Math.max(newMarginTop, marginTopLimit), windowHeight);
			animatedHeight.setValue(newMarginTop);
		},
		onPanResponderRelease: (_) => {
			// 아래로 충분한 거리 슬라이드 시 모달 닫기
			if (animatedHeight._value >= windowHeight * 0.5) { // 150은 임계값, 조정 가능
				onClose(); // 모달 닫기 함수 호출
			} else if (animatedHeight._value < windowHeight * 0.15) {
				Animated.spring(animatedHeight, {
					toValue: marginTopLimit,
					useNativeDriver: false
				}).start();
			} else {
				// 슬라이드를 멈췄을 때, 높이가 애매한 위치에 있을 경우 원래 높이로 복귀
				Animated.spring(animatedHeight, {
					toValue: initialMarginTop,
					useNativeDriver: false
				}).start();
			}
		},
	}), [insets.top]); // 의존성 배열 업데이트	// 스크롤 이벤트 처리
	const handleCancelReply = () => {
		setReplyingTo(null);
		setTextInputValue('');  // 입력 필드 초기화
	};
	
	return (
		<SafeAreaProvider>
			<Modal
				animationType="slide"
				visible={isVisible}
				onRequestClose={onClose}
				transparent={true}
			>
				<View style={styles.modalOverlay}>
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : undefined}
						{...panResponder.panHandlers}
					>
						<Animated.View style={[styles.modalView, { marginTop: animatedHeight }]}>
							<TouchableOpacity style={styles.closeButton} onPress={onClose}>
								<Text>닫기</Text>
							</TouchableOpacity>
							<ScrollView
								style={styles.commentsList}
								contentContainerStyle={{ paddingBottom: 20 }} // ScrollView의 paddingBottom 조정
								keyboardShouldPersistTaps="handled"
								ref={scrollViewRef}
								onScroll={handleScroll}
								scrollEventThrottle={150} // 이벤트 발생 간격 조정
							>
								{loading && comments.length === 0 ? (
									<ActivityIndicator size="large" color="#0000ff" />
								) : commentNone ? (
									<>
										<Text> 댓글이 없습니다. </Text>
										<Text> 댓글을 추가해보세요!. </Text>
									</>
								) : (
									<>
										{comments.map((comment, index) => (
											<CommentItem
												key={index}
												comment={comment}
												toggleUnderComments={toggleUnderComments}
												showUnderComments={showUnderComments}
												index={index}
											/>
										))}
										{loading && (
											<ActivityIndicator size="large" color="#0000ff" />
										)}
									</>
								)}
							</ScrollView>
							{replyingTo && (
								<TouchableOpacity onPress={handleCancelReply}>
									<Text style={styles.cancelButton}> 답글 취소</Text>
								</TouchableOpacity>
							)}
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									value={textInputValue}
									onChangeText={setTextInputValue}
									placeholder={replyingTo ? "답글을 작성하세요..." : "댓글 추가..."}
									onFocus={handleInputFocus}
									onSubmitEditing={handleSubmitComment} // 엔터 키를 눌러 댓글 제출
								/>
								<TouchableOpacity onPress={handleSubmitComment}>
									<View style={styles.submitButton}>
										<AntDesign name='caretup' size={25} style={{ color: 'white' }} />
									</View>
								</TouchableOpacity>
							</View>
						</Animated.View>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</SafeAreaProvider>
	);
});

const styles = StyleSheet.create({
	cancelButton: {
		color: 'red',
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginHorizontal: 5,
		borderWidth: 1,
		borderColor: 'red',
		borderRadius: 5,
	},
	submitButton: {
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "gray",
		paddingTop: 5,
		marginLeft: 10,
		width: 40,
		height: 40,
		backgroundColor: "#ccc"
	},
	modalOverlay: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
	},
	commentItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	underCommentItem: {
		paddingTop: 10, // 답글에 대한 시각적 구분
		paddingBottom: 10, // 답글에 대한 시각적 구분
		paddingLeft: 20, // 답글에 대한 시각적 구분
	},
	profileImage: {
		width: 30,
		height: 30,
		borderRadius: 15,
	},
	modalView: {
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		width: windowWidth,
		flex: 1,
		marginTop: windowHeight * 0.3,
		backgroundColor: 'white',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	closeButton: {
		marginTop: 20,
		padding: 10,
		alignItems: 'center',
	},
	commentsList: {
		padding: 20,
		paddingBottom: 10,
		flex: 1,
		width: "100%"
	},
	commentContainer: {
		padding: 8,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#ccc',
	},
	commentText: {
		fontWeight: 'bold',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: "center",
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#ccc',
	},
	input: {
		flex: 1,
		borderColor: 'gray',
		borderWidth: 1,
		paddingHorizontal: 8,
		borderRadius: 4,
		height: 40,
	},
	replyingCommentItem: {
		backgroundColor: '#f0f0f0', // 하이라이트 색상
		borderColor: '#007bff',
		borderWidth: 2,
		borderRadius: 5,
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 6,
	},
});
