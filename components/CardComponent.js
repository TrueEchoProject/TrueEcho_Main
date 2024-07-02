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
import { CommentModal } from './CommentModal';
import { useNavigation } from '@react-navigation/native';

const defaultImage = require("../assets/trueecho.png");

const CardComponent = ({ post, isOptionsVisibleExternal, setIsOptionsVisibleExternal, onBlock, onDelete }) => {
    const navigation = useNavigation();
    const [isOptionsVisible, setIsOptionsVisible] = useState(isOptionsVisibleExternal || false);
    const [buttonLayout, setButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [imageButtonHeight, setImageButtonHeight] = useState(0);
    const [isLiked, setIsLiked] = useState(post.myLike);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isCommentVisible, setIsCommentVisible] = useState(false);
    const [layoutSet, setLayoutSet] = useState(false);
    const windowWidth = Dimensions.get('window').width;
    const [isLoading, setIsLoading] = useState(false);
    const [friendLook, setFriendLook] = useState(true);

    useEffect(() => {
        setIsOptionsVisible(isOptionsVisibleExternal);
        console.log(`Options Visible for ${post.postId}: ${isOptionsVisibleExternal}`);
    }, [isOptionsVisibleExternal]);

    const toggleLike = async () => {
        if (isLoading) return;
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
        if (isLoading) return;
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
                onBlock(post.userId);
            }
        } catch (error) {
            console.error('Error while blocking the user:', error.response ? error.response.data : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDelete = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await Api.delete(`/post/delete/${post.postId}`);
            if (response.data) {
                alert('정상적으로 게시물을 삭제했습니다');
                hideOptions();
                onDelete(post.postId);
            }
        } catch (error) {
            console.error('Error while deleting the post:', error.response ? error.response.data : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFriendSend = async () => {
        if (isLoading) return;
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
        setIsOptionsVisible(newVisibility);
        setIsOptionsVisibleExternal(newVisibility);
    };

    const hideOptions = () => {
        if (isOptionsVisible) {
            setIsOptionsVisible(false);
            setIsOptionsVisibleExternal(false);
        }
    };

    const toggleCommentVisibility = () => {
        setIsCommentVisible(!isCommentVisible);
    };

    const onImageButtonLayout = (event) => {
        if (layoutSet) return;

        const { height } = event.nativeEvent.layout;
        setImageButtonHeight(height);
        setLayoutSet(true);
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
                            <View style={styles.rightAlignedContainer}>
                                <Text style={styles.username}>{post.username}</Text>
                                <View style={styles.usernameSeparator} />
                                <Text style={styles.date}>{new Date(post.createdAt).toDateString()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.imageButtonContainer} onLayout={onImageButtonLayout}>
                    <View style={styles.imageWrapper}>
                        <ImageButton
                            front_image={post.postFrontUrl ? post.postFrontUrl : Image.resolveAssetSource(defaultImage).uri}
                            back_image={post.postBackUrl ? post.postBackUrl : Image.resolveAssetSource(defaultImage).uri}
                            containerHeight={imageButtonHeight}
                            windowWidth={windowWidth}
                            style={styles.imageButton} // 스타일 추가
                        />
                        <View style={styles.iconsContainer}>
                            <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
                                <Ionicons name={isLiked ? 'heart' : 'heart-outline'} style={styles.icon} size={28} color={isLiked ? 'red' : 'white'} />
                                <Text style={styles.iconText}>{likesCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={toggleCommentVisibility}>
                                <MaterialIcons name='comment' style={styles.icon} size={28} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.optionsIcon} onPress={toggleOptionsVisibility} onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        setButtonLayout(layout);
                    }}>
                        <SimpleLineIcons name="options-vertical" size={28} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.separator} />
                    <View style={styles.textRow}>
                        <Text style={styles.title}>{post.title}</Text>
                        {post.status === "FREETIME" || post.status === "LATETIME" ? (
                            <Text style={styles.freeText}>
                                {post.status === "FREETIME" ? 'free' : 'late'}
                            </Text>
                        ) : null}
                    </View>
                    <CommentModal
                        isVisible={isCommentVisible}
                        postId={post.postId}
                        onClose={() => setIsCommentVisible(false)}
                        userId={post.userId}
                    />
                </View>
                {isOptionsVisible && (
                    <View style={[
                        styles.optionsContainer,
                        post.friend === false ?
                            { top: buttonLayout.y + buttonLayout.height, right: 10 } :
                            { top: buttonLayout.y + buttonLayout.height + 30, right: 10 }
                    ]}>
                        {post.mine ? (
                            <TouchableOpacity onPress={toggleDelete} style={styles.optionRow}>
                                <Feather name='alert-triangle' style={styles.optionIcon} />
                                <Text style={[styles.optionItem, styles.optionTextDelete]}>삭제하기</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={toggleBlock} style={styles.optionRow}>
                                <Feather name='alert-triangle' style={styles.optionIcon} />
                                <Text style={[styles.optionItem, styles.optionTextBlock]}>사용자 차단하기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1, // 로더를 화면 중앙에 배치
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtonContainer: {
        flex: 1, // 컨테이너가 가용 공간을 차지하게 함
        position: 'relative',
        marginBottom: 0, // 하단 여백 제거
        paddingBottom: 0, // 하단 패딩 제거
        paddingHorizontal: 0, // 수평 패딩 제거
        marginHorizontal: 40, // 양쪽 여백을 40단위로 설정하여 textRow와 일치
    },
    imageWrapper: {
        width: '100%', // 부모 컨테이너의 너비를 100%로 설정
        height: '100%', // 부모 컨테이너의 높이를 100%로 설정
        overflow: 'hidden', // 넘치는 부분을 숨김
        position: 'relative', // 아이콘이 이미지 안에 위치하도록 설정
    },
    imageButton: {
        width: '100%', // 부모 컨테이너의 너비를 100%로 설정
        height: '100%', // 부모 컨테이너의 높이를 100%로 설정
    },
    optionsIcon: {
        position: 'absolute', // 부모 뷰 내에서 절대 위치
        top: 10, // 위에서 10단위 떨어진 위치
        right: 10, // 오른쪽에서 10단위 떨어진 위치
        zIndex: 3, // 다른 요소들보다 앞에 표시
    },
    iconsContainer: {
        position: 'absolute', // 부모 뷰 내에서 절대 위치
        bottom: 10, // 아래에서 10단위 떨어진 위치
        right: -5, // 오른쪽에서 10단위 떨어진 위치
        zIndex: 3, // 다른 요소들보다 앞에 표시
        flexDirection: 'row', // 자식 요소들을 가로로 배치
    },
    optionsContainer: {
        position: 'absolute', // 부모 뷰 내에서 절대 위치
        zIndex: 4, // 다른 요소들보다 앞에 표시
        backgroundColor: 'white', // 배경 색상 흰색
        padding: 12, // 내부 여백 12단위
        paddingLeft: 14, // 왼쪽 여백 14단위
        borderRadius: 4, // 모서리 둥글게 4단위
        shadowColor: 'black', // 그림자 색상 검정
        shadowOffset: { width: 0, height: 2 }, // 그림자 오프셋
        shadowRadius: 4, // 그림자 반경
        shadowOpacity: 0.3, // 그림자 투명도
        elevation: 4, // 안드로이드 그림자 효과
        marginTop: 10, // 상단 여백 10단위
    },
    optionItem: {
        marginLeft: 10, // 왼쪽 여백 10단위
        marginRight: 10, // 오른쪽 여백 10단위
        fontSize: 15, // 글자 크기 15단위
    },
    optionTextDelete: {
        color: 'red', // 글자 색상 빨강
    },
    optionTextBlock: {
        color: 'red', // 글자 색상 빨강
    },
    optionRow: {
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
    },
    optionIcon: {
        marginLeft: 10, // 왼쪽 여백 10단위
        color: 'red', // 아이콘 색상 빨강
    },
    cardContainer: {
        flex: 1, // 컨테이너가 가용 공간을 차지하게 함
        width: '100%', // 가로 크기 100%
        backgroundColor: 'black', // 배경 색상 검정
        marginBottom: 0, // 하단 여백 제거
    },
    cardItem: {
        padding: 10, // 내부 여백 10단위
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        marginBottom: 0, // 하단 여백 제거
    },
    left: {
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        
    },
    body: {
        marginLeft: 10, // 왼쪽 여백 10단위
        height: 55, // 높이 55단위
    },
    rightAlignedContainer: {
        flexDirection: 'column', // 자식 요소들을 세로로 배치
        alignItems: 'flex-start', // 자식 요소들을 왼쪽 정렬
        marginLeft: 20, // 왼쪽 여백 20단위
    },
    thumbnail: {
        width: 50, // 너비 44단위
        height: 50, // 높이 44단위
        borderRadius: 22, // 둥근 모서리 반경 22단위
        marginLeft: 30, // 오른쪽 여백을 추가하여 이미지를 오른쪽으로 이동
    },
    username: {
        fontSize: 18, // 글자 크기 15단위
        fontWeight: "500", // 글자 굵기 500
        color: 'white', // 글자 색상 흰색
        marginBottom: 0, // 아래쪽 여백 3단위
        marginTop: 5, // 위쪽 여백 3단위
        alignSelf: 'flex-end', // 선을 왼쪽으로 정렬
        marginRight: 3, // 오른쪽 여백 10단위
    },
    date: {
        fontSize: 14, // 글자 크기 12단위
        fontWeight: "300", // 글자 굵기 300
        color: 'white', // 글자 색상 흰색
        marginTop: -5, // 위쪽 여백 5단위
        marginLeft: 150, // 왼쪽 여백 5단위
        marginRight: 5, // 오른쪽 여백 10단위
    },
    title: {
        fontWeight: '900', // 글자 굵기 900
        color: 'white', // 글자 색상 흰색
        marginBottom: 3, // 아래쪽 여백 3단위
        fontSize: 16, // 글자 크기 18단위
    },
    freeText: {
        color: "white", // 글자 색상 흰색
        fontSize: 25, // 글자 크기 25단위
    },
    iconButton: {
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        justifyContent: 'center', // 자식 요소들을 중앙에 정렬
        marginRight: 15, // 오른쪽 여백 15단위
        marginBottom: -5, // 위쪽 여백 10단위
    },
    icon: {
        marginRight: 4, // 오른쪽 여백 4단위
    },
    iconText: {
        color: 'white', // 글자 색상 흰색
    },
    right: {
        marginLeft: 'auto', // 왼쪽 여백 자동 설정 (가능한 만큼)
    },
    separator: {
        height: 1, // 높이 1단위
        backgroundColor: 'white', // 배경 색상 흰색
        width: '100%', // 너비 100%
        marginVertical: 5, // 상하 여백 5단위
        marginHorizontal: 0, // 좌우 여백 0단위
        marginBottom: 0, // 아래쪽 여백 5단위
        marginTop: 10, // 위쪽 여백 5단위
    },
    usernameSeparator: {
        height: 1,
        backgroundColor: 'white',
        width: '105%', // 원하는 만큼 길이를 늘리기 위해 100%로 설정
        marginVertical: 5,
        alignSelf: 'flex-end', // 선을 왼쪽으로 정렬
        marginRight: 5, // 오른쪽 여백 10단위
    },
    bottomContainer: {
        padding: 0, // 내부 여백 0단위
        zIndex: 2, // 다른 요소들보다 앞에 표시
        minHeight: 50, // 최소 높이 50단위
        backgroundColor: "black", // 배경 색상 검정
        justifyContent: 'flex-end', // 자식 요소들을 아래쪽에 정렬
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        marginHorizontal: 40, // 좌우 여백 40단위
    },
    textRow: {
        flexDirection: 'row', // 텍스트를 가로로 나란히 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        justifyContent: 'space-between', // 양쪽 끝에 배치
        width: '100%', // 전체 너비를 차지하도록 설정
    },
});

export default CardComponent;
