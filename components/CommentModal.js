import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Image } from "expo-image"
import axios from "axios";

const windowHeight = Dimensions.get('window').height;

const CommentModal = ({ isVisible, postId, onClose }) => {
	const [comments, setComments] = useState([]);
	
	useEffect(() => {
		if (isVisible) {
			const fetchCommentsForPost = async () => {
				try {
					const response = await axios.get(`http://192.168.0.3:3000/comments?post_id=${postId}`);
					setComments(response.data);
					setLoading(false); // 데이터 로딩 완료
					// 초기 상태에서는 모든 답글을 숨깁니다.
				} catch (error) {
					console.error('Fetching comments failed:', error);
					setLoading(false); // 오류 발생 시 로딩 완료 처리
				}
			};
			fetchCommentsForPost();
		} else {
			setComments([]); // 모달이 닫힐 때 댓글 상태 초기화
		}
	}, [isVisible, postId]);
	// 답글 표시 상태를 토글하는 함수
	const toggleUnderComments = (index) => {
		setShowUnderComments(prevState => ({
			...prevState,
			[index]: !prevState[index]
		}));
	};
	const CommentItem = ({ comment, toggleUnderComments, showUnderComments, index }) => {
		return (
			<View style={styles.commentItem}>
				<Image style={styles.profileImage} source={{ uri: comment.profile_url }} />
				<Text>Date: {comment.created_at}</Text>
				<Text style={styles.commentText}>{comment.username}: {comment.comment}</Text>
				<TouchableOpacity onPress={() => toggleUnderComments(index)}>
					<Text>답글 확인</Text>
				</TouchableOpacity>
				<UnderComments underComments={comment.under_comments} isVisible={showUnderComments[index]} />
			</View>
		);
	};
	
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={isVisible}
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={onClose}>
				<View style={styles.modalOverlay}>
					<View style={styles.modalView}>
						<ScrollView style={{ width: "100%" }}>
							{loading ? (
								<Text>Loading comments...</Text> // 로딩 인디케이터 표시
							) : (
								<>
									<TouchableOpacity onPress={onClose} style={styles.closeButton}>
										<Text>닫기</Text>
									</TouchableOpacity>
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
					</View>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

const styles = StyleSheet.create({
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
	},
	commentItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	underCommentItem: {
		paddingLeft: 20, // 답글에 대한 시각적 구분
	},
	commentText: {
		fontWeight: 'bold',
	},
	underCommentText: {
		// 필요한 경우 추가 스타일
	},
});

export default CommentModal;