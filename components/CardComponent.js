import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
} from 'react-native';
import { MaterialIcons, Ionicons, Feather, SimpleLineIcons } from "@expo/vector-icons";
import Api from '../Api';
import { ImageButton } from "./ImageButton";
import { CommentModal } from './CommentModal'; // 댓글 창 컴포넌트 임포트
import { useNavigation } from '@react-navigation/native'; // useNavigation import

const defaultImage = require("../assets/trueecho.png");

const CardComponent = ({ post, isOptionsVisibleExternal, setIsOptionsVisibleExternal, onBlock, onDelete }) => {
    const navigation = useNavigation(); // useNavigation 훅 사용
    const [isOptionsVisible, setIsOptionsVisible] = useState(isOptionsVisibleExternal || false);
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [imageButtonHeight, setImageButtonHeight] = useState(0);
    const [isLiked, setIsLiked] = useState(post.myLike); // 좋아요 상태 관리
    const [likesCount, setLikesCount] = useState(post.likesCount); // 좋아요 수 관리
    const [isCommentVisible, setIsCommentVisible] = useState(false); // 댓글 창 표시 상태
    const [layoutSet, setLayoutSet] = useState(false); // 레이아웃 설정 여부 상태 추가
    const windowWidth = Dimensions.get('window').width;
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
    const [friendLook, setFriendLook] = useState(true); // 좋아요 수 관리

    useEffect(() => {
        setIsOptionsVisible(isOptionsVisibleExternal);
        console.log(`Options Visible for ${post.postId}: ${isOptionsVisibleExternal}`);
    }, [isOptionsVisibleExternal]); // 이제 외부에서 받은 props가 변경될 때마다 로그를 찍고 상태를 업데이트합니다.

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
                onBlock(post.userId); // 차단 이벤트를 상위 컴포넌트에 알림
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
                onDelete(post.postId); // 삭제 이벤트를 상위 컴포넌트에 알림
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
                const FcmResponse = await Api.post(`/noti/sendToFCM`, {
                    title: null,
                    body: null,
                    data: {
                        userId: post.userId,
                        notiType: 7,
                        contentId: null
                    }
                });
            }
        } catch (error) {
            console.error('Error updating friend send:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOptionsVisibility = () => {
        const newVisibility = !isOptionsVisible;
        setIsOptionsVisible(newVisibility); // 내부 상태 업데이트
        setIsOptionsVisibleExternal(newVisibility); // 외부 상태 업데이트로 전파
    };

    const hideOptions = () => {
        if (isOptionsVisible) {
            setIsOptionsVisible(false);
            setIsOptionsVisibleExternal(false); // 외부 상태도 업데이트
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
                        <TouchableOpacity onPress={() => { navigation.navigate("UserAlarm", { userId: post.userId }) }}>
                            <Image
                                style={styles.thumbnail}
                                source={{ uri: post.profileUrl ? post.profileUrl : Image.resolveAssetSource(defaultImage).uri }}
                            />
                        </TouchableOpacity>
                        <View style={styles.body}>
                            <Text style={{ fontSize: 15, fontWeight: "500" }}>{post.username}</Text>
                            <Text style={{ fontSize: 12, fontWeight: "300" }} note>{new Date(post.createdAt).toDateString()}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.imageButtonContainer} onLayout={onImageButtonLayout}>
                    <ImageButton
                        front_image={post.postFrontUrl ? post.postFrontUrl : Image.resolveAssetSource(defaultImage).uri}
                        back_image={post.postBackUrl ? post.postBackUrl : Image.resolveAssetSource(defaultImage).uri}
                        containerHeight={imageButtonHeight}
                        windowWidth={windowWidth}
                    />
                    <TouchableOpacity style={styles.optionsIcon} onPress={toggleOptionsVisibility} onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        setButtonLayout(layout);
                    }}>
                        <SimpleLineIcons name="options-vertical" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.iconsContainer}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
                            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} style={styles.icon} size={24} color={isLiked ? 'red' : 'white'} />
                            <Text style={styles.iconText}>{likesCount}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name='chatbubbles' style={styles.icon} onPress={toggleCommentVisibility} size={24} color="white" />
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
                            <TouchableOpacity onPress={toggleDelete} style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Feather name='alert-triangle' style={{ marginLeft: 10, color: 'red' }} />
                                <Text style={[styles.optionItem, { color: 'red' }]}>삭제하기</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={toggleBlock} style={{ flexDirection: 'row', alignItems: 'center', }}>
                                <Feather name='alert-triangle' style={{ marginLeft: 10, color: 'red' }} />
                                <Text style={[styles.optionItem, { color: 'red' }]}>사용자 차단하기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <View style={{ padding: 0, zIndex: 2, minHeight: 50, backgroundColor: "white", justifyContent: 'flex-end', }}>
                    <View style={[styles.cardItem, styles.bottomTextContainer]}>
                        <Text style={styles.title}>{post.title}</Text>
                        {post.status === "FREETIME" || post.status === "LATETIME" ? (
                            <View style={[
                                styles.right,
                                styles.freeTextContainer,
                            ]}>
                                {post.status === "FREETIME" && (
                                    <Text style={styles.freeText}>free</Text>
                                )}
                                {post.status === "LATETIME" && (
                                    <Text style={styles.freeText}>late</Text>
                                )}
                            </View>
                        ) : null}
                    </View>
                    <CommentModal
                        isVisible={isCommentVisible}
                        postId={post.postId}
                        onClose={() => setIsCommentVisible(false)}
                        userId={post.userId}
                    />
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
        position: 'relative', // 추가
    },
    optionsIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 3,
    },
    iconsContainer: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        zIndex: 3,
        flexDirection: 'row',
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
        width: '100%',
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
        color: 'black',
    },
    bottomTextContainer: {
        justifyContent: 'space-between', // 제목과 free 텍스트를 양쪽에 배치
        alignItems: 'center',
    },
    freeTextContainer: {
        backgroundColor: "#3B4664",
        padding: 5,
        paddingLeft: 30,
        paddingRight: 30,
        borderRadius: 10,
    },
    freeText: {
        color: "white",
        fontSize: 25,
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
    iconText: {
        color: 'white',
    },
    right: {
        marginLeft: 'auto',
    },
});

export default CardComponent;
