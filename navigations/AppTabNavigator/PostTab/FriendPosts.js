import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import Api from '../../../Api';
import { useFocusEffect } from '@react-navigation/native';
import CardComponent from '../../../components/CardComponent';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const FriendPosts = React.forwardRef((props, ref) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const pagerViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});
  
  React.useImperativeHandle(ref, () => ({
    getPosts: refreshPosts,
  }));
  useEffect(() => {
    refreshPosts();
  }, []);

  const refreshPosts = async () => {
    setPage(0);
    await getPosts(0, true, '/post/read/0'); // baseUrl 전달
    setRefreshing(false);
  };

  const getPosts = async (index, isRefresh = false, baseUrl = '/post/read/0') => {
    setIsLoading(true);
    setPosts([]);
    let url = `${baseUrl}?index=${index}&pageCount=15&type=FRIEND`; // 친구 범위 게시물만 조회
    try {
      console.log(`url is`, url);
      const serverResponse = await Api.get(url);
      const newPosts = serverResponse.data.data.readPostResponse;
      if (serverResponse.data.message === "게시물을 조회를 실패했습니다.") {
        console.log("No more posts to load.");
        alert("No more posts to load.")
        setIsLoading(false);
        return;
      }
      if (isRefresh) {
        setPosts(newPosts);
      } else {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }
    } catch (error) {
      console.error('Error fetching posts and recommendations:', error);
    } finally {
      setIsLoading(false);
      if (isRefresh) {
        setTimeout(() => {
          pagerViewRef.current?.setPageWithoutAnimation(0);
        }, 50);
      }
    }
  };
  
  const handleBlock = async (userId) => {
    setPosts(prev => prev.filter(item => item.userId !== userId));
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  const handleDelete = async (postId) => {
    setPosts(prev => prev.filter(item => item.postId !== postId));
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  const handleFriendSend = async (userId) => {
    setFriendStatuses(prev => ({ ...prev, [userId]: true }));
    try {
      const formData = new FormData();
      formData.append('targetUserId', userId);
      const response = await Api.post(`/friends/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data) {
        const FcmResponse = await Api.post(`/noti/sendToFCM`, {
          title: null,
          body: null,
          data: { userId: userId, notiType: 7, contentId: null }
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setFriendStatuses(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handlePageChange = (e) => {
    const newIndex = e.nativeEvent.position;
    setCurrentPage(newIndex);
    setOptionsVisibleStates(prevStates => {
      const newStates = {};
      posts.forEach(post => {
        newStates[post.postId] = false;
      });
      return newStates;
    });
    if (newIndex === posts.length - 5) {
      const nextPage = page + 1;
      setPage(nextPage);
      getPosts(nextPage);
    }
  };
  
  if (posts.length === 0 && isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.NoneText}>
          Loading...
        </Text>
      </View>
    )
  }
  if (posts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.NoneText , {marginBottom: windowHeight * 0.01}]}>
          아직 친구가 없어요
        </Text>
        <Text style={styles.NoneText}>
          더보기를 통해 친구를 추가해보세요!
        </Text>
      </View>
    )
  }
  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshPosts} />}
    >
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        ref={pagerViewRef}
        onPageSelected={handlePageChange}
      >
        {posts.map((post) => (
          <View key={post.postId} style={styles.postContainer}>
            <CardComponent
              post={post}
              onBlock={handleBlock}
              onDelete={() => handleDelete(post.postId)}
              isOptionsVisibleExternal={optionsVisibleStates[post.postId]}
              setIsOptionsVisibleExternal={(visible) => setOptionsVisibleStates(prev => ({ ...prev, [post.postId]: visible }))}
              isFriendAdded={friendStatuses[post.userId] || post.friend}
              onFriendSend={() => handleFriendSend(post.userId)}
            />
          </View>
        ))}
      </PagerView>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  NoneText: {
    color: "white",
    fontSize:windowHeight * 0.025,
    fontWeight:"bold"
  },
  postContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  pagerView: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default FriendPosts;
