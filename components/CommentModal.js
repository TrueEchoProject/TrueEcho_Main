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
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Image as ExpoImage } from 'expo-image'; // expo-image 패키지 import
import { AntDesign } from "@expo/vector-icons";

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
export const CommentModal = React.memo(({ isVisible, postId, onClose }) => {
	const insets = useSafeAreaInsets(); // Safe Area 여백 얻기
	const initialMarginTop = Platform.OS === 'ios' ? windowHeight * 0.3 + insets.top : windowHeight * 0.3;
	const marginTopLimit = Platform.OS === 'ios' ? insets.top : 0;
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showUnderComments, setShowUnderComments] = useState({});
	const [textInputValue, setTextInputValue] = useState('');
	const animatedHeight = useRef(new Animated.Value(initialMarginTop)).current;
	const scrollViewRef = useRef(null);
	const commentRefs = useRef({});
	const [currentPage, setCurrentPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const scrollPositionRef = useRef(0); // 스크롤 위치 저장용
	const [replyingTo, setReplyingTo] = useState(null); // 답글을 다는 댓글의 ID
	const fetchComments = async (page) => {
		setLoading(true);
		const currentPosition = scrollPositionRef.current; // 로딩 전 스크롤 위치 저장
		try {
			const response = await axios.get(`http://192.168.0.27:3000/comments`, {
				params: {
					post_id: postId,
					_page: page,
					_limit: 5
				}
			});
			if (response.data.length > 0) {
				setComments(prevComments => [...prevComments, ...response.data]);
				setCurrentPage(page);
				setTimeout(() => {
					scrollViewRef.current?.scrollTo({ y: currentPosition, animated: false }); // 스크롤 위치 복원
				}, 0); // setTimeout으로 지연하여 스크롤 위치를 정확하게 복원
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Fetching comments failed:', error);
		}
		setLoading(false);
	};
	const handleDeleteComment = async (commentId) => {
		Alert.alert(
			"댓글 삭제", // 알림 제목
			"이 댓글을 삭제하시겠습니까?", // 메시지
			[
				{ text: "취소",
					onPress: () => console.log("삭제 취소"),
					style: "cancel" },
				{ text: "삭제",
					onPress: async () => {
						try {
							await axios.delete(`http://192.168.0.27:3000/comments/${commentId}`);
							setComments(comments.filter(comment => comment.id !== commentId)); // UI에서 댓글 제거
							setTextInputValue(''); // 입력 필드 초기화
							setShowUnderComments({})
							setReplyingTo(null);
						} catch (error) {
							console.error('댓글 삭제 실패:', error);
							setTextInputValue(''); // 입력 필드 초기화
							setShowUnderComments({})
							setReplyingTo(null);
						}}}]);
	};
	const handleDeleteUnderComment = async (commentId, underCommentId) => {
		// 삭제 확인을 요청하는 Alert 추가
		Alert.alert(
			"답글 삭제", // 알림 제목
			"이 답글을 삭제하시겠습니까?", // 메시지
			[
				{ text: "취소",
					onPress: () => console.log("답글 삭제 취소"),
					style: "cancel" },
				{ text: "삭제",
					onPress: async () => {
						try {
							const response = await axios.delete(`http://192.168.0.27:3000/comments/${commentId}/under_comments/${underCommentId}`);
							if (response.status === 204) {
								setComments(prevComments => prevComments.map(comment => {
									if (comment.id === commentId) {
										const updatedUnderComments = comment.under_comments.filter(uc => uc.id !== underCommentId);
										return {
											...comment,
											under_comments: updatedUnderComments,
											reply_count: Math.max(0, updatedUnderComments.length) // 답글 수 감소
										};}
									return comment;}));
							}
							setTextInputValue(''); // 입력 필드 초기화
							setShowUnderComments({})
							setReplyingTo(null);
						} catch (error) {
							console.error('답글 삭제 실패:', error);
						}}}]);
	};
	const handleSubmitComment = async () => {
		if (!textInputValue.trim()) {
			alert("글을 입력해주세요.");
			return;
		}
		const currentDate = new Date();
		const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
		if (replyingTo) {
			console.log(replyingTo)
			// 답글 제출 로직
			try {
				const response = await axios.post(`http://192.168.0.27:3000/comments/${replyingTo}/under_comments`, {
					under_comment: textInputValue,
					username: "신형",
					profile_url: "https://cdn.discordapp.com/attachments/990816789246124032/1224126578963906620/funnyclown123_A_military_theater_website_builder_interface._Pri_1627dd46-1d83-4728-a68a-ed6e163d64b7.png?ex=661c5bb7&is=6609e6b7&hm=caff3eeb850c8c3e11bf68cfa709bcf370426b73bdd105862a1d3d517c8b05d3&",
					created_at: formattedDate,
					id: formattedDate,
				});
				const newUnderComment = response.data;
				setComments(prevComments => {
					return prevComments.map(comment => {
						if (comment.id === replyingTo) {
							// 답글 목록에 새 답글 추가 및 reply_count 증가
							return {
								...comment,
								under_comments: [...comment.under_comments, newUnderComment],
								reply_count: comment.reply_count + 1 // 답글 수 업데이트
							};
						} else {
							return comment;
						}});
				});
				setTextInputValue("");
				setReplyingTo(null);
				return;  // 함수 실행 종료
			} catch (error) {
				console.error('답글 추가 실패:', error);
			}
		} else {
			// 새 댓글 추가 로직
			try {
				const response = await axios.post('http://192.168.0.27:3000/comments', {
					comment: textInputValue, // 사용자가 입력한 댓글 내용
					username: "신형",
					profile_url: "https://cdn.discordapp.com/attachments/990816789246124032/1224126578963906620/funnyclown123_A_military_theater_website_builder_interface._Pri_1627dd46-1d83-4728-a68a-ed6e163d64b7.png?ex=661c5bb7&is=6609e6b7&hm=caff3eeb850c8c3e11bf68cfa709bcf370426b73bdd105862a1d3d517c8b05d3&",
					created_at: formattedDate,
					under_comments: [],
					post_id: postId, // 댓글이 추가될 게시글의 ID
					id: postId + Date.now(),
					reply_count: 0,
				});
				const newComment = response.data;
				setComments(prevComments => [newComment, ...prevComments]); // 새 댓글을 배열의 시작 부분에 추가
				setTextInputValue("");
				scrollViewRef.current?.scrollTo({ y: 0, animated: false }); // 스크롤을 최상단으로 이동
			} catch (error) {
				console.error('댓글 추가 실패:', error);
			}
		}
		setTextInputValue(''); // 입력 필드 초기화
		setShowUnderComments({})
		setReplyingTo(null);
	};
	
	// 초기 데이터 및 추가 데이터 불러오기
	useEffect(() => {
		if (isVisible) {
			fetchComments(1); // 초기 페이지 로드
			setTextInputValue(''); // 입력 필드 초기화
			setShowUnderComments({})
			setReplyingTo(null);
			Animated.timing(animatedHeight, {
				toValue: initialMarginTop, // 모달을 초기 높이로 설정
				duration: 0, // 즉시 변경되도록 시간을 0으로 설정
				useNativeDriver: false
			}).start();
		} else {
			setComments([]);
			setCurrentPage(1);
			setHasMore(true);
		}
	}, [isVisible, postId]);
	
	const CommentItem = React.memo(({ comment, toggleUnderComments, showUnderComments, index }) => {
		const isReplyingTo = replyingTo === comment.id; // 현재 답글을 작성 중인지 확인
		const commentItemStyle = isReplyingTo
			? [styles.commentItem, styles.replyingCommentItem] // 답글 작성 중 스타일 적용
			: styles.commentItem;
		const commentItemRef = useRef(null);
		
		useEffect(() => {
			commentRefs.current[comment.id] = commentItemRef.current;
			return () => {
				delete commentRefs.current[comment.id]; // Cleanup on unmount
			};
		}, [comment.id]);
		
		return (
			<View style={commentItemStyle} ref={commentItemRef}>
				<ExpoImage style={styles.profileImage} source={{ uri: comment.profile_url }} />
				<Text>Date: {comment.created_at}</Text>
				<Text style={styles.commentText}>{comment.username}: {comment.comment}</Text>
				<TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
					<Text>삭제</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => setReplyingTo(comment.id)}>
					<Text>답글 달기</Text>
				</TouchableOpacity>
				{comment.reply_count > 0 && (
					<TouchableOpacity onPress={() => toggleUnderComments(index)}>
						<Text>답글 {comment.reply_count}개 더보기</Text>
					</TouchableOpacity>
				)}
				<UnderComments commentId={comment.id} underComments={comment.under_comments} isVisible={showUnderComments[index]} />
			</View>
		);
	});
	const UnderCommentItem = ({ underComment, commentId }) => {
		return (
			<View style={styles.underCommentItem}>
				<ExpoImage style={styles.profileImage} source={{ uri: underComment.profile_url }} />
				<Text>Date: {underComment.created_at}</Text>
				<Text style={styles.underCommentText}>{underComment.username}: {underComment.under_comment}</Text>
				<TouchableOpacity onPress={() => handleDeleteUnderComment(commentId, underComment.id)}>
					<Text>삭제</Text>
				</TouchableOpacity>
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
	}), [insets.top]); // 의존성 배열 업데이트
	// 스크롤 이벤트 처리
	const handleScroll = ({ nativeEvent }) => {
		const { contentOffset } = nativeEvent;
		scrollPositionRef.current = contentOffset.y;
		if (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
			nativeEvent.contentSize.height - 20) {
			if (hasMore && !loading) {
				fetchComments(currentPage + 1);
			}
		}
	};
	
	
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
								{loading ? (
									<Text>Loading comments...</Text> // 로딩 인디케이터 표시
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
										<AntDesign name='caretup' size={25} style={{ color: 'white' }}/>
									</View>
								</TouchableOpacity>
							</View>
						</Animated.View>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</SafeAreaProvider>
	);
})

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