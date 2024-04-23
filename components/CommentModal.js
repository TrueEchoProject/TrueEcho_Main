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
} from 'react-native';
import axios from 'axios';
import { Image } from 'expo-image';

const windowHeight = Dimensions.get('window').height;
export const CommentModal = React.memo(({ isVisible, postId, onClose }) => {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false); // 로딩 상태 추가
	const [showUnderComments, setShowUnderComments] = useState({});
	const [textInputValue, setTextInputValue] = useState('');
	
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
		}
	}, [isVisible, postId]);
	
	const CommentItem = React.memo(({ comment, toggleUnderComments, showUnderComments, index }) => {
		return (
			<View style={styles.commentItem}>
				<Image style={styles.profileImage} source={{ uri: comment.profile_url }} />
				<Text>Date: {comment.created_at}</Text>
				<Text style={styles.commentText}>{comment.username}: {comment.comment}</Text>
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
	const toggleUnderComments = (index) => {
		setShowUnderComments(prevState => ({
			...prevState,
			[index]: !prevState[index]
		}));
	};
	
	return (
		<Modal
			animationType="slide"
			visible={isVisible}
			onRequestClose={onClose}
			transparent={true}
		>
			<View style={styles.modalOverlay}>
				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={styles.modalView}
				>
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
						/>
					</View>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
})

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: 'flex-end',
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
		width:"100%",
		flex: 1,
		marginTop: windowHeight * 0.2,
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
		paddingHorizontal: 8,
		paddingVertical: 8,
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