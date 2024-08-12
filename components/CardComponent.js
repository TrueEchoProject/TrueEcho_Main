import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import Api from '../Api';
import { ImageButton } from "./ImageButton";
import { CommentModal } from './CommentModal';
import { useNavigation } from '@react-navigation/native';
import storage from '../AsyncStorage';

const defaultImage = require("../assets/logo.png");

const CardComponent = ({ post, isOptionsVisibleExternal, setIsOptionsVisibleExternal, onBlock, onDelete, isFriendAdded, onFriendSend }) => {
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
    const [myPicture, setMyPicture] = useState("");  // 블러 상태를 관리하는 state 추가

    useEffect(() => {
        setIsOptionsVisible(isOptionsVisibleExternal);
        console.log(`Options Visible for ${post.postId}: ${isOptionsVisibleExternal}`);
    }, [isOptionsVisibleExternal]);

    useEffect(() => {
        checkPostedIn24H();  // 컴포넌트가 마운트되면 상태 확인 함수 호출
    }, []);

    const fetchPostDataFromServer = async (requireRefresh = false) => {
        const baseUrl = post.type === 'public' ? '/post/read/1' : '/post/read/0';
        try {
            const response = await Api.get(`${baseUrl}?index=0&pageCount=1&postId=${post.postId}&requireRefresh=${requireRefresh}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching post data:', error);
            return null;
        }
    };

    const checkPostedIn24H = async () => {
        try {
            const response = await fetchPostDataFromServer(true);
            if (response) {
                const { postedIn24H } = response.data;

                if (postedIn24H) {
                    const newPostedIn24H = {
                        postedFront: postedIn24H.postedFront,
                        postedBack: postedIn24H.postedBack,
                        postedAt: postedIn24H.postedAt,
                    };
                    await storage.set(`postedIn24H-${post.postId}`, JSON.stringify(newPostedIn24H));

                    // 블러 처리를 위한 상태 업데이트
                    if (postedIn24H.postedFront && postedIn24H.postedBack) {
                        setMyPicture("both"); // 양면이 업로드된 경우 블러 없음
                    } else if (postedIn24H.postedFront) {
                        setMyPicture("front"); // 앞면만 업로드된 경우
                    } else if (postedIn24H.postedBack) {
                        setMyPicture("back"); // 뒷면만 업로드된 경우
                    } else {
                        setMyPicture("none"); // 아무것도 업로드되지 않은 경우
                    }
                }
            }
        } catch (error) {
            console.error('Error checking postedIn24H:', error);
        }
    };

    const onImageButtonLayout = (event) => {
        if (layoutSet) return;
        const { height } = event.nativeEvent.layout;
        setImageButtonHeight(height);
        setLayoutSet(true);
    };

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
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    {post.friend === false && post.mine === false && (isFriendAdded === false ? (
                                        <TouchableOpacity onPress={onFriendSend}>
                                            <LinearGradient
                                                colors={['#1BC5DA', '#263283']}
                                                style={styles.friendButton}
                                            >
                                                <Text style={styles.friendText}>친구 추가</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={[styles.friendButton, {
                                            backgroundColor: "#292929",
                                            borderRadius: 5,
                                        }]}>
                                            <Text style={styles.friendText}>추가 완료</Text>
                                        </View>
                                    )
                                    )}
                                    <Text style={styles.username}>{post.username}</Text>
                                </View>
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
                            myPicture={myPicture}  // 상태를 전달
                            style={styles.imageButton}
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
    friendButton: {
        height: Dimensions.get('window').width * 0.07,
        width: Dimensions.get('window').width * 0.15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 5,
    },
    friendText: {
        fontSize: Dimensions.get('window').width * 0.03,
        color: "white",
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtonContainer: {
        flex: 1,
        position: 'relative',
        marginBottom: 0,
        marginTop: 0,
        paddingBottom: 0,
        paddingHorizontal: 0,
        marginHorizontal: Dimensions.get('window').width * 0.1,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
    },
    imageButton: {
        width: '100%',
        height: '100%',
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
        right: -5,
        zIndex: 3,
        flexDirection: 'row',
    },
    optionsContainer: {
        position: 'absolute',
        zIndex: 4,
        backgroundColor: 'grey',
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
    optionTextDelete: {
        color: 'white',
    },
    optionTextBlock: {
        color: 'white',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        marginLeft: 10,
        color: 'white',
    },
    cardContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'black',
        marginBottom: 0,
        borderColor: 'black',
    },
    cardItem: {
        padding: Dimensions.get('window').width * 0.025,
        flexDirection: 'row',
        alignItems: 'center',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    body: {
        marginLeft: Dimensions.get('window').width * 0.02,
        height: Dimensions.get('window').height * 0.075,
        flex: 1,
    },
    rightAlignedContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginRight: Dimensions.get('window').width * 0.07,
        marginTop: Dimensions.get('window').height * 0.015,
    },
    thumbnailGradient: {
        padding: 3,
        marginLeft: Dimensions.get('window').width * 0.06,
        borderRadius: 100,
    },
    thumbnail: {
        width: Dimensions.get('window').width * 0.17 - 6,
        height: Dimensions.get('window').width * 0.17 - 6,
        borderRadius: 100,
    },
    username: {
        fontSize: Dimensions.get('window').width * 0.04,
        fontWeight: "500",
        color: 'white',
        marginBottom: Dimensions.get('window').height * 0.005,
        marginTop: Dimensions.get('window').height * 0.005,
        alignSelf: 'flex-end',
    },
    date: {
        fontSize: Dimensions.get('window').width * 0.03,
        fontWeight: "300",
        color: 'white',
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        alignSelf: 'flex-end',
    },
    title: {
        fontWeight: '900',
        color: 'white',
        marginBottom: Dimensions.get('window').height * 0.005,
        fontSize: Dimensions.get('window').width * 0.04,
        marginTop: Dimensions.get('window').height * 0.007,
    },
    freeText: {
        color: "white",
        fontSize: Dimensions.get('window').width * 0.06,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Dimensions.get('window').width * 0.04,
        marginBottom: -5,
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
    separator: {
        height: 1,
        backgroundColor: 'white',
        width: '100%',
        marginVertical: Dimensions.get('window').height * 0.01,
        marginHorizontal: 0,
        marginBottom: 0,
        marginTop: 10,
    },
    usernameSeparator: {
        height: 1,
        backgroundColor: 'white',
        width: '100%',
        marginVertical: Dimensions.get('window').height * 0.005,
        alignSelf: 'flex-end',
    },
    bottomContainer: {
        padding: 0,
        zIndex: 2,
        minHeight: Dimensions.get('window').height * 0.075,
        backgroundColor: "black",
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginHorizontal: Dimensions.get('window').width * 0.1,
    },
    textRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: Dimensions.get('window').width * 0.01,
    },
});

export default CardComponent;
