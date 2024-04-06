import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Image } from "expo-image"
import axios from "axios";

const windowHeight = Dimensions.get('window').height;

export const CommentModal = React.memo(({ isVisible, postId, onClose }) => {
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false); // 로딩 상태 추가
	// 답글 표시 상태를 관리하는 상태. 각 댓글의 답글 표시 여부를 저장합니다.
	const [showUnderComments, setShowUnderComments] = useState({});
	
	useEffect(() => {
		if (isVisible) {
			const fetchCommentsForPost = async () => {
				try {
					const response = await axios.get(`http://192.168.0.3:3000/comments?post_id=${postId}`);
					setComments(response.data);
					setLoading(false); // 데이터 로딩 완료
					// 초기 상태에서는 모든 답글을 숨깁니다.
					const initialShowState = response.data.reduce((acc, _, index) => {
						acc[index] = false; // 모든 답글을 기본적으로 숨깁니다.
						return acc;
					}, {});
					setShowUnderComments(initialShowState);
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
			<View style={styles.modalOverlay}>
				<View style={styles.modalView}>
					<TouchableOpacity onPress={onClose} style={styles.closeButton}>
						<Text>닫기</Text>
					</TouchableOpacity>
					<ScrollView style={{ width: "100%" }}>
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
				</View>
			</View>
		</Modal>
	);
});

const styles = StyleSheet.create({
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
		height: windowHeight * 0.7,
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
