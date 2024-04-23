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
	Keyboard,
	KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Image } from 'expo-image';
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
	
	const handleSubmitComment = async () => {
		// 입력된 텍스트가 비어 있는지 확인
		if (!textInputValue.trim()) {
			alert("댓글을 입력해주세요."); // 또는 사용자에게 피드백을 제공하는 다른 방법 사용
			return; // 함수 실행을 여기서 중단
		}
		try {
			const response = await axios.post('http://192.168.0.3:3000/comments', {
				comment: textInputValue, // 사용자가 입력한 댓글 내용
				username: "신형",
				profile_url: "https://cdn.discordapp.com/attachments/990816789246124032/1224126578963906620/funnyclown123_A_military_theater_website_builder_interface._Pri_1627dd46-1d83-4728-a68a-ed6e163d64b7.png?ex=661c5bb7&is=6609e6b7&hm=caff3eeb850c8c3e11bf68cfa709bcf370426b73bdd105862a1d3d517c8b05d3&",
				created_at: "2024-03-25",
				under_comments: [],
				post_id: postId, // 댓글이 추가될 게시글의 ID
				id: postId + Date.now(),
				reply_count: 0,
			});
			const newCommentObject = response.data; // 가정: 서버가 추가된 댓글의 정보를 반환
			setComments([newCommentObject, ...comments]); // 새 댓글을 목록 최상단에 추가
			setTextInputValue("")
		} catch (error) {
			console.error('댓글 추가 실패:', error);
		}
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
	
	useEffect(() => {
		if (isVisible) {
			setLoading(true);
			axios.get(`http://192.168.0.3:3000/comments?post_id=${postId}`)
				.then(response => {
					setComments(response.data);
					setLoading(false);
				})
				.catch(error => {
					console.error('Fetching comments failed:', error);
					setLoading(false);
				});
		} else {
			setComments([]); // 모달이 닫힐 때 댓글 상태 초기화
			animatedHeight.setValue(windowHeight * 0.3); // 모달 높이 초기화
		}
	}, [isVisible, postId]);
	
	const CommentItem = React.memo(({ comment, toggleUnderComments, showUnderComments, index }) => {
		return (
			<View style={styles.commentItem}>
				<Image style={styles.profileImage} source={{ uri: comment.profile_url }} />
				<Text>Date: {comment.created_at}</Text>
				<Text style={styles.commentText}>{comment.username}: {comment.comment}</Text>
				<TouchableOpacity>
					<Text>답글 달기</Text>
				</TouchableOpacity>
				{ comment.reply_count === 0 ? (
					<></>
				) : (
					<TouchableOpacity onPress={() => toggleUnderComments(index)}>
						<Text>답글 {comment.reply_count}개 더보기</Text>
					</TouchableOpacity>
				)}
				<UnderComments underComments={comment.under_comments} isVisible={showUnderComments[index]} />
			</View>
		);
	});
	
	const UnderComments = React.memo(({ underComments, isVisible }) => {
		return isVisible ? (
			<View>
				{underComments.map((underComment, underIndex) => (
					<View key={underIndex} style={styles.underCommentItem}>
						<Image style={styles.profileImage} source={{ uri: underComment.profile_url }} />
						<Text>Date: {underComment.created_at}</Text>
						<Text style={styles.underCommentText}>{underComment.username}: {underComment.under_comment}</Text>
					</View>
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
							<View style={styles.inputContainer}>
								<TextInput
									style={styles.input}
									value={textInputValue}
									onChangeText={setTextInputValue}
									placeholder="댓글 추가..."
									onFocus={handleInputFocus}
									onSubmitEditing={handleSubmitComment} // 엔터 키를 눌러 댓글 제출
								/>
								<TouchableOpacity onPress={handleSubmitComment}>
									<View style={{
										justifyContent: "center",
										alignItems: "center",
										borderRadius: 5,
										borderWidth: 1,
										borderColor: "gray",
										paddingTop: 5,
										marginLeft:10,
										width: 40,
										height: 40,
										backgroundColor: "#ccc"
									}}>
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
});