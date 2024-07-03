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
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Api from '../Api';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const defaultImage = require("../assets/trueecho.png");

export const CommentModal = React.memo(({ userId, isVisible, postId, onClose }) => {
    const insets = useSafeAreaInsets();
    const initialMarginTop = Platform.OS === 'ios' ? windowHeight * 0.3 + insets.top : windowHeight * 0.3;
    const marginTopLimit = Platform.OS === 'ios' ? insets.top : 0;
    const [page, setPage] = useState(0);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [commentNone, setCommentNone] = useState(false);
    const [showUnderComments, setShowUnderComments] = useState({});
    const [textInputValue, setTextInputValue] = useState('');
    const animatedHeight = useRef(new Animated.Value(initialMarginTop)).current;
    const scrollViewRef = useRef(null);
    const commentRefs = useRef({});
    const scrollPositionRef = useRef(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (isVisible) {
            setLoading(true);
            setTextInputValue('');
            setShowUnderComments({});
            setReplyingTo(null);
            setCommentNone(false);
            setPage(0);
            setHasMore(true);
            Animated.timing(animatedHeight, {
                toValue: initialMarginTop,
                duration: 0,
                useNativeDriver: false
            }).start();
        } else {
            setComments([]);
            setPage(0);
        }
    }, [isVisible, postId]);

    useEffect(() => {
        if (loading) {
            fetchComments(page);
        }
    }, [loading]);

    const fetchComments = async (index = 0) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
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
                        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
                    }, 0);
                } else {
                    setComments(prevComments => [...prevComments, ...fetchedComments]);
                }
                setCommentNone(false);
                if (fetchedComments.length < 10) {
                    setHasMore(false);
                }
            } else {
                setCommentNone(true);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Fetching comments failed:', error.message || error);
        } finally {
            setLoading(false);
            setIsLoading(false);
        }
    };

    const handleScroll = ({ nativeEvent }) => {
        const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
        scrollPositionRef.current = contentOffset.y;

        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20 && !loading && hasMore) {
            setPage(prevPage => prevPage + 1);
            setLoading(true);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (isLoading) return;
        setIsLoading(true);

        Alert.alert(
            "댓글 삭제",
            "이 댓글을 삭제하시겠습니까?",
            [
                { text: "취소", onPress: () => console.log("삭제 취소"), style: "cancel" },
                {
                    text: "삭제", onPress: async () => {
                        try {
                            const response = await Api.delete(`/post/delete/comment/${commentId}`);
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
                            setTextInputValue('');
                            setShowUnderComments({});
                            setReplyingTo(null);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSubmitComment = async () => {
        if (isLoading) return;
        setIsLoading(true);
        if (!textInputValue.trim()) {
            alert("글을 입력해주세요.");
            setIsLoading(false);
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
            setIsLoading(false);
        }
    };

    const CommentItem = React.memo(({ comment, toggleUnderComments, showUnderComments, index }) => {
		const isReplyingTo = replyingTo === comment.commentId;
		const commentItemStyle = isReplyingTo
			? [styles.commentItem, styles.replyingCommentItem]
			: styles.commentItem;
		const commentItemRef = useRef(null);
	
		useEffect(() => {
			commentRefs.current[comment.commentId] = commentItemRef.current;
			return () => {
				delete commentRefs.current[comment.commentId];
			};
		}, [comment.commentId]);
	
		const formatDate = (dateString) => {
			const date = new Date(dateString);
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${month}-${day} ${hours}:${minutes}`;
		};
	
		return (
			<View style={commentItemStyle} ref={commentItemRef}>
				<View style={styles.commentHeader}>
					<LinearGradient
						colors={['#1BC5DA', '#263283']}
						start={{ x: 0, y: 0.5 }}
						end={{ x: 1, y: 0.5 }}
						style={styles.thumbnailGradient}
					>
						<Image
							style={styles.profileImage}
							source={{ uri: comment.profileURL ? comment.profileURL : Image.resolveAssetSource(defaultImage).uri }}
						/>
					</LinearGradient>
					<View style={styles.commentBody}>
						<Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
						<Text style={styles.commentUsername}>{comment.username}: <Text style={styles.commentContent}>{comment.content}</Text></Text>
						<View style={styles.separator} />
						<View style={styles.commentActions}>
							<TouchableOpacity onPress={() => setReplyingTo(comment.commentId)}>
								<Text style={styles.replyButton}>답글 달기</Text>
							</TouchableOpacity>
							{comment.mine && (
								<TouchableOpacity onPress={() => handleDeleteComment(comment.commentId)}>
									<Text style={styles.deleteButtonComment}>삭제</Text>
								</TouchableOpacity>
							)}
						</View>
						{comment.underComments.length > 0 && (
							<TouchableOpacity onPress={() => toggleUnderComments(index)}>
								<Text style={styles.moreButton}>답글 더보기</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
				<UnderComments commentId={comment.commentId} underComments={comment.underComments} isVisible={showUnderComments[index]} />
			</View>
		);
	});
	

    const UnderCommentItem = ({ underComment }) => {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${month}-${day} ${hours}:${minutes}`;
        };

        return (
            <View style={styles.underCommentItem}>
                <LinearGradient
                    colors={['#1BC5DA', '#263283']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.underCommentThumbnailGradient}
                >
                    <TouchableOpacity onPress={() => navigation.navigate("UserAlarm", { userId: underComment.userId })}>
                        <Image style={styles.underProfileImage} source={{ uri: underComment.profileURL }} />
                    </TouchableOpacity>
                </LinearGradient>
                <View style={styles.commentBody}>
                    <Text style={styles.underCommentDate}>{formatDate(underComment.createdAt)}</Text>
                    <Text style={styles.underCommentUsername}>{underComment.username}: <Text style={styles.underCommentContent}>{underComment.content}</Text></Text>
                    <View style={styles.separator} />
                    {underComment.mine && (
                        <TouchableOpacity onPress={() => handleDeleteComment(underComment.commentId)}>
                            <Text style={styles.deleteButtonReply}>삭제</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const UnderComments = React.memo(({ underComments, isVisible, commentId }) => {
        const commentsToShow = isVisible ? underComments : underComments.slice(0, 2);
        return (
            <View style={styles.underCommentsContainer}>
                {commentsToShow.map((underComment, index) => (
                    <UnderCommentItem key={index} underComment={underComment} commentId={commentId} />
                ))}
            </View>
        );
    });

    const toggleUnderComments = (index) => {
        setShowUnderComments(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleInputFocus = () => {
        Animated.timing(animatedHeight, {
            toValue: marginTopLimit,
            duration: 300,
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
            if (animatedHeight._value >= windowHeight * 0.5) {
                onClose();
            } else if (animatedHeight._value < windowHeight * 0.15) {
                Animated.spring(animatedHeight, {
                    toValue: marginTopLimit,
                    useNativeDriver: false
                }).start();
            } else {
                Animated.spring(animatedHeight, {
                    toValue: initialMarginTop,
                    useNativeDriver: false
                }).start();
            }
        },
    }), [insets.top]);

    const handleCancelReply = () => {
        setReplyingTo(null);
        setTextInputValue('');
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
                                contentContainerStyle={{ paddingBottom: 20 }}
                                keyboardShouldPersistTaps="handled"
                                ref={scrollViewRef}
                                onScroll={handleScroll}
                                scrollEventThrottle={150}
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
								<LinearGradient
									colors={['#1BC5DA', '#263283']}
									start={{ x: 0, y: 0.5 }}
									end={{ x: 1, y: 0.5 }}
									style={styles.cancelButtonGradient}
								>
									<View style={styles.cancelButton}>
										<Text style={styles.cancelButtonText}>답글 취소</Text>
									</View>
								</LinearGradient>
							</TouchableOpacity>
                            )}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={textInputValue}
                                    onChangeText={setTextInputValue}
                                    placeholder={replyingTo ? "답글을 작성하세요..." : "댓글 추가..."}
                                    onFocus={handleInputFocus}
                                    onSubmitEditing={handleSubmitComment}
                                    placeholderTextColor="#a3a3a3"
                                />
                                <TouchableOpacity onPress={handleSubmitComment}>
                                    <LinearGradient
                                        colors={['#1BC5DA', '#263283']}
                                        style={styles.submitButton}
                                    >
                                        <AntDesign name='caretup' size={25} style={{ color: 'black' }} />
                                    </LinearGradient>
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
		paddingHorizontal: 100,
        paddingVertical: 5,
        marginHorizontal: 5,
        borderRadius: 5,
        backgroundColor: 'white', // 배경 흰색으로 설정
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "black",
        width: 40,
        height: 40,
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    commentItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF',
        backgroundColor: '#fff',
        marginBottom: 0, // 간격을 줄이려면 이 값을 더 작게 설정합니다
        borderRadius: 0,
    },
    replyingCommentItem: {
        backgroundColor: 'white', // 회색 배경 제거
        borderColor: '#1BC5DA',
        borderWidth: 3,
        borderRadius: 0,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
        overflow: 'hidden', // 테두리 잘림 문제 해결
		marginBottom: 1, // 간격을 줄이려면 이 값을 더 작게 설정합니다
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnailGradient: {
        borderRadius: 40,
        padding: 3,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    commentBody: {
        marginLeft: 10,
        flex: 1,
    },
    commentUsername: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    commentContent: {
        fontWeight: 'normal',
    },
    commentDate: {
        fontSize: 12,
        color: '#888',
    },
    commentActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    replyButton: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12,
    },
    deleteButtonComment: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14,
        alignSelf: 'flex-end', // 삭제 버튼 오른쪽 정렬
    },
    deleteButtonReply: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 10, // 답글의 삭제 버튼 폰트 크기를 다르게 설정
        alignSelf: 'flex-end', // 삭제 버튼 오른쪽 정렬
    },
    moreButton: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12,
    },
    separator: {
        height: 1,
        backgroundColor: 'black',
        marginVertical: 5,
    },
    underCommentItem: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        backgroundColor: 'transparent', // 회색 배경 제거
        borderRadius: 10,
        marginBottom: -15, // 간격을 줄이려면 이 값을 더 작게 설정합니다
        flexDirection: 'row',
    },
    underCommentsContainer: {
        paddingLeft: 50, // 답글 들여쓰기
    },
    underCommentThumbnailGradient: {
        borderRadius: 25, // 반지름을 반으로 설정하여 정확한 원이 되도록
        padding: 3,
        width: 46, // 테두리 포함한 전체 크기
        height: 46, // 테두리 포함한 전체 크기
        justifyContent: 'center', // 중앙 정렬 추가
        alignItems: 'center', // 중앙 정렬 추가
    },
    underProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    underCommentUsername: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    underCommentContent: {
        fontWeight: 'normal',
        fontSize: 12,
    },
    underCommentDate: {
        fontSize: 10,
        color: '#888',
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
        width: "100%",
    },
    commentContainer: {
        padding: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
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
        borderColor: '#a3a3a3',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        height: 40,
        backgroundColor: '#f1f1f1',
    },
    cancelButtonGradient: {
        borderRadius: 5,
        padding: 3, // 테두리 두께 조절
    },
    cancelButtonText: {
        color: 'black', // 텍스트 색상 변경
        fontSize: 16,
        fontWeight: 'bold',
    },
});


