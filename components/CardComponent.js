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
    }, [isOptionsVisibleExternal]);

    const toggleLike = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);

        try {
            await Api.patch(`/post/update/likes`, {
                postId: post.postId,
                isLike: newIsLiked,
            });
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
            await Api.post(`/blocks/add`, { blockUserId: post.userId });
            alert('유저를 정상적으로 차단했습니다');
            hideOptions();
            onBlock(post.userId);
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
            await Api.delete(`/post/delete/${post.postId}`);
            alert('정상적으로 게시물을 삭제했습니다');
            hideOptions();
            onDelete(post.postId);
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
            await Api.post(`/friends/add`, { targetUserId: post.userId });
            setFriendLook(false);
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
                        <TouchableOpacity onPress={() => navigation.navigate("UserAlarm", { userId: post.userId })}>
                            <Image
                                style={styles.thumbnail}
                                source={{ uri: post.profileUrl ? post.profileUrl : Image.resolveAssetSource(defaultImage).uri }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.right}>
                        <Text style={styles.username}>{post.username}</Text>
                        <View style={styles.separator} />
                        <Text style={styles.date}>{new Date(post.createdAt).toDateString()}</Text>
                    </View>
                    <View style={styles.optionsContainer}>
                        {post.friend === false && (friendLook === true ? (
                            <View style={styles.friendButtonContainer}>
                                <TouchableOpacity onPress={toggleFriendSend}>
                                    <Text style={styles.friendButtonText}>친구 추가</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.friendButtonContainer}>
                                <Text style={styles.friendButtonText}>추가 완료</Text>
                            </View>
                        ))}
                    </View>
                </View>
                {isOptionsVisible && (
                    <View style={[
                        styles.optionsDropdown,
                        post.friend === false ?
                            { top: buttonLayout.y + buttonLayout.height, right: 0 } :
                            { top: buttonLayout.y + buttonLayout.height + 30, right: 0 }
                    ]}>
                        {post.mine ? (
                            <TouchableOpacity onPress={toggleDelete} style={styles.dropdownItem}>
                                <Feather name='alert-triangle' style={styles.dropdownIcon} />
                                <Text style={styles.dropdownText}>삭제하기</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={toggleBlock} style={styles.dropdownItem}>
                                <Feather name='alert-triangle' style={styles.dropdownIcon} />
                                <Text style={styles.dropdownText}>사용자 차단하기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                <View style={styles.imageButtonContainer} onLayout={onImageButtonLayout}>
                    <ImageButton
                        front_image={post.postFrontUrl ? post.postFrontUrl : Image.resolveAssetSource(defaultImage).uri}
                        back_image={post.postBackUrl ? post.postBackUrl : Image.resolveAssetSource(defaultImage).uri}
                        containerHeight={imageButtonHeight}
                        windowWidth={windowWidth * 0.87} // 이미지의 폭을 흰색 선과 일치시킴
                    />
                    <TouchableOpacity style={styles.optionsButton} onPress={toggleOptionsVisibility}>
                        <SimpleLineIcons name="options-vertical" size={28} color="white" />
                    </TouchableOpacity>
                    <View style={styles.overlayIcons}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleLike}>
                            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} style={styles.icon} size={30} color={isLiked ? 'red' : 'white'} />
                            <Text style={styles.likesCount}>{likesCount}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleCommentVisibility}>
                            <MaterialIcons name='comment' style={styles.icon} size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.titleUnderline} />
                    <View style={[styles.cardItem, styles.titleSection]}>
                        <Text style={styles.title}>{post.title}</Text>
                        {post.status === "FREETIME" || post.status === "LATETIME" ? (
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusText}>{post.status === "FREETIME" ? "Free" : "Late"}</Text>
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
    cardContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'black',
        justifyContent: 'flex-end', // 전체 요소를 하단으로 정렬
    },
    cardItem: {
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleSection: {
        width: '92%',
        alignSelf: 'center',
        marginBottom: 0, // 제목 섹션 아래의 간격 최소화
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
    },
    right: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginLeft: 'auto',
        paddingRight: 20,
        width: '83%',
    },
    separator: {
        width: '95%',
        height: 1,
        backgroundColor: 'white',
        marginVertical: 3,
        marginLeft: 10,
    },
    username: {
        fontSize: 15,
        fontWeight: "500",
        color: 'white',
    },
    date: {
        fontSize: 12,
        fontWeight: "300",
        color: 'white',
    },
    thumbnail: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'white',
    },
    title: {
        fontWeight: '900',
        color: 'white',
        fontSize: 24,
        marginTop: 0, // 제목 위의 간격 최소화
    },
    titleUnderline: {
        width: '89%',
        height: 1,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginTop: 5, // 흰색 선 위의 간격 최소화
        marginBottom: 0, // 흰색 선 아래의 간격 최소화
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
        left: 20,
    },
    icon: {
        marginRight: 4,
    },
    likesCount: {
        color: 'white',
    },
    optionsContainer: {
        flexDirection: "column",
        marginLeft: "auto",
    },
    friendButtonContainer: {
        backgroundColor: "#3B4664",
        padding: 5,
        marginBottom: 5,
        borderRadius: 3,
    },
    friendButtonText: {
        fontSize: 15,
        color: "white",
    },
    optionsButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    optionsDropdown: {
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
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dropdownIcon: {
        marginLeft: 10,
        color: 'red',
    },
    dropdownText: {
        marginLeft: 10,
        marginRight: 10,
        fontSize: 15,
        color: 'red',
    },
    imageButtonContainer: {
        alignSelf: 'center',
        width: '87%', // 양옆 여백 최소화
        marginBottom: 0, // 이미지와 아래 흰색 선 사이의 간격 최소화
    },
    contentContainer: {
        padding: 0, // 패딩을 제거하여 간격 최소화
        zIndex: 2,
        minHeight: 90,
        backgroundColor: "black",
        marginBottom: 0, // 하단 여백 최소화
    },
    overlayIcons: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        flexDirection: 'row',
    },
    statusContainer: {
        padding: 5,
        paddingLeft: 30,
        paddingRight: 30,
        backgroundColor: "black",
        borderRadius: 10,
        marginTop: 0, // "Free" 텍스트 위의 간격 최소화
    },
    statusText: {
        color: "white",
        fontSize: 30,
        left: 30,
    },
});

export default CardComponent;
