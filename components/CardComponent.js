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
import { LinearGradient } from 'expo-linear-gradient';
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
                            <LinearGradient
                                colors={['#1BC5DA', '#263283', '#4641D9']}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.thumbnailGradient}
                            >
                                <Image
                                    style={styles.thumbnail}
                                    source={{ uri: post.profileUrl ? post.profileUrl : Image.resolveAssetSource(defaultImage).uri }}
                                />
                            </LinearGradient>
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
                                {post.status === "FREETIME" ? 'Free' : 'Late'}
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
                    <>
                        <View style={[
                            styles.optionsContainer,
                            { top: buttonLayout.y + buttonLayout.height + 80, right: 60 }
                        ]}>
                            {post.mine ? (
                                <TouchableOpacity onPress={toggleDelete} style={styles.optionRow}>
                                    <Text style={[styles.optionItem, styles.optionTextDelete]}>삭제</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {!post.mine && (
                            <View style={[
                                styles.optionsContainer,
                                { top: buttonLayout.y + buttonLayout.height + 80, right: 50 } // 사용자 차단 버튼 위치 조정
                            ]}>
                                <TouchableOpacity onPress={toggleBlock} style={styles.optionRow}>
                                    <Text style={[styles.optionItem, styles.optionTextBlock]}>사용자 차단</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
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
        marginHorizontal: Dimensions.get('window').width * 0.1, // 양쪽 여백을 화면 너비의 10%로 설정
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
        backgroundColor: 'grey', // 배경 색상 흰색
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
        color: 'white', // 글자 색상 빨강
    },
    optionTextBlock: {
        color: 'white', // 글자 색상 빨강
    },
    optionRow: {
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
    },
    optionIcon: {
        marginLeft: 10, // 왼쪽 여백 10단위
        color: 'white', // 아이콘 색상 빨강
    },
    cardContainer: {
        flex: 1, // 컨테이너가 가용 공간을 차지하게 함
        width: '100%', // 가로 크기 100%
        backgroundColor: 'black', // 배경 색상 검정
        marginBottom: 0, // 하단 여백 제거
    },
    cardItem: {
        padding: Dimensions.get('window').width * 0.025, // 내부 여백을 화면 너비의 2.5%로 설정
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        marginBottom: 0, // 하단 여백 제거
    },
    left: {
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
    },
    body: {
        marginLeft: Dimensions.get('window').width * 0.02, // 왼쪽 여백을 화면 너비의 2%로 설정
        height: Dimensions.get('window').height * 0.075, // 높이를 화면 높이의 7.5%로 설정
        flex: 1, // 남은 공간 차지
    },
    rightAlignedContainer: {
        flexDirection: 'column', // 자식 요소들을 세로로 배치
        alignItems: 'flex-end', // 자식 요소들을 오른쪽 정렬
        marginRight: Dimensions.get('window').width * 0.07, // 오른쪽 여백을 화면 너비의 5%로 설정
    },
    thumbnailGradient: {
        borderRadius: Dimensions.get('window').width * 0.06, // 프로필 이미지의 둥근 테두리 반경에 맞춤
        padding: 3, // 그라데이션 테두리 두께를 조금 더 두껍게 설정
        marginLeft: Dimensions.get('window').width * 0.06, // 왼쪽 여백을 화면 너비의 5%로 설정 (오른쪽으로 이동)
    },
    thumbnail: {
        width: Dimensions.get('window').width * 0.12 - 6, // 패딩을 제외한 크기로 설정
        height: Dimensions.get('window').width * 0.12 - 6, // 패딩을 제외한 크기로 설정
        borderRadius: (Dimensions.get('window').width * 0.12 - 6) / 2, // 둥근 모서리 반경을 새로운 크기에 맞게 조정
    },
    username: {
        fontSize: Dimensions.get('window').width * 0.04, // 글자 크기를 화면 너비의 4.5%로 설정
        fontWeight: "500", // 글자 굵기 500
        color: 'white', // 글자 색상 흰색
        marginBottom: Dimensions.get('window').height * 0.005, // 아래쪽 여백을 화면 높이의 0.5%로 설정
        marginTop: Dimensions.get('window').height * 0.005, // 위쪽 여백을 화면 높이의 0.5%로 설정
        alignSelf: 'flex-end', // 자식 요소를 오른쪽 정렬
    },
    date: {
        fontSize: Dimensions.get('window').width * 0.03, // 글자 크기를 화면 너비의 3.5%로 설정
        fontWeight: "300", // 글자 굵기 300
        color: 'white', // 글자 색상 흰색
        marginTop: 0, // 위쪽 여백 5단위
        marginLeft: 0, // 왼쪽 여백 제거
        marginRight: 0, // 오른쪽 여백 제거
        alignSelf: 'flex-end', // 자식 요소를 오른쪽 정렬
    },
    title: {
        fontWeight: '900', // 글자 굵기 900
        color: 'white', // 글자 색상 흰색
        marginBottom: Dimensions.get('window').height * 0.005, // 아래쪽 여백을 화면 높이의 0.5%로 설정
        fontSize: Dimensions.get('window').width * 0.04, // 글자 크기를 화면 너비의 4%로 설정
        marginTop: Dimensions.get('window').height * 0.007, // 위쪽 여백을 화면 높이의 0.5%로 설정
    },
    
    freeText: {
        color: "white", // 글자 색상 흰색
        fontSize: Dimensions.get('window').width * 0.06, // 글자 크기를 화면 너비의 6%로 설정
    },
    iconButton: {
        flexDirection: 'row', // 자식 요소들을 가로로 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        justifyContent: 'center', // 자식 요소들을 중앙에 정렬
        marginRight: Dimensions.get('window').width * 0.04, // 오른쪽 여백을 화면 너비의 4%로 설정
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
        marginVertical: Dimensions.get('window').height * 0.01, // 상하 여백을 화면 높이의 1%로 설정
        marginHorizontal: 0, // 좌우 여백 0단위
        marginBottom: 0, // 아래쪽 여백 0단위
        marginTop: 10, // 위쪽 여백 10단위
    },
    usernameSeparator: {
        height: 1,
        backgroundColor: 'white',
        width: '100%', // 원하는 만큼 길이를 늘리기 위해 100%로 설정
        marginVertical: Dimensions.get('window').height * 0.005, // 상하 여백을 화면 높이의 0.5%로 설정
        alignSelf: 'flex-end', // 자식 요소를 오른쪽 정렬
    },
    bottomContainer: {
        padding: 0, // 내부 여백 0단위
        zIndex: 2, // 다른 요소들보다 앞에 표시
        minHeight: Dimensions.get('window').height * 0.075, // 최소 높이를 화면 높이의 7.5%로 설정
        backgroundColor: "black", // 배경 색상 검정
        justifyContent: 'flex-end', // 자식 요소들을 아래쪽에 정렬
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        marginHorizontal: Dimensions.get('window').width * 0.1, // 좌우 여백을 화면 너비의 10%로 설정
    },
    textRow: {
        flexDirection: 'row', // 텍스트를 가로로 나란히 배치
        alignItems: 'center', // 자식 요소들을 중앙 정렬
        justifyContent: 'space-between', // 양쪽 끝에 배치
        width: '100%', // 전체 너비를 차지하도록 설정
        marginTop: Dimensions.get('window').width * 0.01,
    },
});

export default CardComponent;
