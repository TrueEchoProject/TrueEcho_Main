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
	Keyboard,
	PanResponder,
	Animated,
	Platform,
	KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import { Image } from 'expo-image';

const windowHeight = Dimensions.get('window').height;

export const CommentModal = React.memo(({ isVisible, postId, onClose }) => {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false); // 로딩 상태 추가
	// 답글 표시 상태를 관리하는 상태. 각 댓글의 답글 표시 여부를 저장합니다.
	const [showUnderComments, setShowUnderComments] = useState({});
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const [textInputValue, setTextInputValue] = useState('');
	const inputRef = useRef(null);
	const animatedHeight = useRef(new Animated.Value(windowHeight * 0.6)).current;
	const dragThreshold = 175; // 드래그 임계값을 150으로 설정
	
	// 드래그에 따른 모달 높이 조정 로직
	const panResponder = useMemo(() => PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onPanResponderMove: (_, gestureState) => {
			// 현재 드래그 위치에 따른 높이를 계산합니다.
			let newHeight = animatedHeight._value - gestureState.dy; // 높이 계산에 dy 값을 빼줍니다.
			
			// 드래그 동작이 위로 일어나고 있고 모달이 최대 높이에 도달한 경우
			// 또는 드래그 동작이 아래로 일어나고 있고 모달이 최소 높이에 도달한 경우
			// 높이를 변경하지 않습니다.
			if ((gestureState.dy < 0 && newHeight >= windowHeight) ||
				(gestureState.dy > 0 && newHeight <= windowHeight * 0.6)) {
				return; // 높이 변경 없음
			}
			
			// 그렇지 않으면, 계산된 새 높이를 적용합니다.
			// 높이가 최소 및 최대 범위를 넘지 않도록 합니다.
			newHeight = Math.min(Math.max(newHeight, windowHeight * 0.6), windowHeight);
			animatedHeight.setValue(newHeight);
		},
		onPanResponderRelease: () => {
			// 드래그가 끝나고 높이가 임계값 내에 있는지 여부에 따라 높이를 조정합니다.
			if (animatedHeight._value >= windowHeight - dragThreshold) {
				// 모달이 거의 최대 높이에 있으면 최대 높이로 설정합니다.
				Animated.spring(animatedHeight, {
					toValue: windowHeight,
					useNativeDriver: false
				}).start();
			} else if (animatedHeight._value <= windowHeight * 0.6 + dragThreshold) {
				// 모달이 거의 원래 높이에 있으면 원래 높이로 설정합니다.
				Animated.spring(animatedHeight, {
					toValue: windowHeight * 0.6,
					useNativeDriver: false
				}).start();
			}
		}
	}), [keyboardHeight]); // 'animatedHeight'의 값을 직접 사용하므로 의존성 배열에 포함시킬 필요가 없습니다.
	
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
			animatedHeight.setValue(windowHeight * 0.6); // 모달 높이 초기화
		}
	}, [isVisible, postId]);
	
	useEffect(() => {
		// 키보드 상태 변화 감지
		const showSubscription = Keyboard.addListener('keyboardDidShow', e => {
			setKeyboardHeight(e.endCoordinates.height);
		});
		const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardHeight(0);
		});
		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);
	
	useEffect(() => {
		if (isVisible && inputRef.current) {
			inputRef.current.focus();
			animatedHeight.setValue(windowHeight * 0.6); // 모달 높이 초기화
		}
	}, [isVisible]);
	
	// 답글 표시 상태를 토글하는 함수
	const toggleUnderComments = (index) => {
		setShowUnderComments(prevState => ({
			...prevState,
			[index]: !prevState[index]
		}));
	};
	
	const CommentItem = React.memo(({ comment, toggleUnderComments, showUnderComments, index }) => {
		return (
			<View style={styles.commentItem}>
				<Image style={styles.profileImage} source={{ uri: comment.profile_url }} />
				<Text>Date: {comment.created_at}</Text>
				<Text style={styles.commentText}>{comment.username}: {comment.comment}</Text>
				<Text style={styles.commentText}>좋아요: {comment.like_count }</Text>
				<TouchableOpacity onPress={() => toggleUnderComments(index)}>
					<Text>답글 {comment.reply_count}개 더보기</Text>
				</TouchableOpacity>
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
	
	
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={isVisible}
			onRequestClose={onClose}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"} // 플랫폼에 따라 behavior 조정
				enabled={true} // Android에서는 필요에 따라 enabled 속성 조정
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalView}>
						<TouchableOpacity onPress={onClose} style={styles.closeButton}>
							<Text>닫기</Text>
						</TouchableOpacity>
						<ScrollView
							style={{ width: "100%" }}
							keyboardShouldPersistTaps="always" // 스크롤 시 키보드 유지
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
						<TextInput
							style={styles.commentInput}
							placeholder="댓글 달기..."
							autoFocus={true} // 컴포넌트가 마운트될 때 자동으로 포커스
						/>
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
});

const styles = StyleSheet.create({
	commentInput: {
		height: 40,
		width: "100%",
		margin: 12,
		borderWidth: 1,
		padding: 10,
	},
	profileImage: {
		width: 30,
		height: 30,
		borderRadius: 15,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	modalView: {
		height: windowHeight * 0.4,
		backgroundColor: "white",
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
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
	commentText: {
		fontWeight: 'bold',
	},
	underCommentText: {
		// 필요한 경우 추가 스타일
	},
})