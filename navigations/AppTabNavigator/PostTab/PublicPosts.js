import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Modal } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFocusEffect } from '@react-navigation/native';
import Api from '../../../Api';
import CardComponent from '../../../components/CardComponent';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PublicPosts = React.forwardRef((props, ref) => {
  const [range, setRange] = useState(null);
  const [optionsVisibleStates, setOptionsVisibleStates] = useState({});
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const pagerViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [location, setLocation] = useState("");
  const [copiedLocation, setCopiedLocation] = useState("");
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});
  const [activeButton, setActiveButton] = useState(null);

  React.useImperativeHandle(ref, () => ({
    getPosts: refreshPosts,
    toggleOptions,
  }));
  useFocusEffect(
    useCallback(() => {
      refreshPosts();
    }, [])
  );
  useEffect(() => {
    refreshPosts();
  }, []);

  const refreshPosts = async () => {
    setPage(0);
    await firstFetch();
  };
  const firstFetch = async () => {
    setRefreshing(true);
    const serverResponse = await Api.get('/post/read/1?index=0&pageCount=5&type=PUBLIC');
    setPosts(serverResponse.data.data.readPostResponse);
    setLocation(serverResponse.data.data.yourLocation);
    if (serverResponse.data) {
      setRefreshing(false);
      setOptionsVisible(false);
      setTimeout(() => {
        pagerViewRef.current?.setPageWithoutAnimation(0);
      }, 50);
    }
  };
  const getPosts = async (selectedRange = null, index = 0, baseUrl = '/post/read/1') => {
    let url = `${baseUrl}?index=${index}&pageCount=15&type=PUBLIC`;
    if (selectedRange) {
      try {
        setCopiedLocation(location);
        const words = copiedLocation.split(' ');
        let newLocation = '';
        switch (selectedRange) {
          case 'small':
            newLocation = words.join(' ');
            break;
          case 'middle':
            newLocation = words.slice(0, 2).join(' ');
            break;
          case 'big':
            newLocation = words[0];
            break;
          default:
            console.log('Invalid range');
            setRefreshing(false);
            return;
        }
        console.log('Got location:', newLocation);
        url += `&location=${encodeURIComponent(newLocation)}`;
      } catch (error) {
        console.error('Fetching user location failed:', error);
        setRefreshing(false);
        return;
      }
    }

    try {
      console.log('URL is', url);
      const serverResponse = await Api.get(url);
      const newPosts = serverResponse.data.data.readPostResponse;
      if (serverResponse.data.message === "게시물을 조회를 실패했습니다.") {
        console.log("No more posts to load.");
        alert("No more posts to load.");
        setRefreshing(false);
        return;
      }
      const allPosts = index === 0 ? newPosts : [...posts, ...newPosts];
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(allPosts);
    } catch (error) {
      console.error('Fetching posts failed:', error);
    } finally {
      setRefreshing(false);
      setOptionsVisible(false);
      if (index === 0) {
        setTimeout(() => {
          pagerViewRef.current?.setPageWithoutAnimation(0);
        }, 50);
      }
    }
  };

  const toggleOptions = () => {
    setOptionsVisible(!optionsVisible);
  };
  const handleBlock = async (userId) => {
    setPosts(prev => prev.filter(item => item.userId !== userId));
    await new Promise(resolve => setTimeout(resolve, 0));
  };
  const handleDelete = async (postId) => {
    console.log('Delete:', postId);
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
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        getPosts(range, nextPage);
        return nextPage;
      });
    }
  };
  const handlePressIn = (button) => {
    setActiveButton(button);
  };
  const handlePressOut = () => {
    setActiveButton(null);
  };
  
  if (posts.length === 0) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }
  return (
    <>
      {optionsVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={optionsVisible}
          onRequestClose={toggleOptions}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.closeButton} onPress={toggleOptions}>
                <MaterialIcons name="close" size={28} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>지역 범위</Text>
              <Text style={styles.modalSubtitle}>게시물을 볼 지역을 정해주세요</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPressIn={() => handlePressIn('big')}
                  onPressOut={handlePressOut}
                  onPress={() => {
                    toggleOptions();
                    getPosts('big');
                  }}
                >
                  {activeButton === 'big' ? (
                    <LinearGradient
                      colors={['#1BC5DA', '#263283']}
                      style={styles.gradient}
                    >
                      <Text style={styles.textStylePrimary}>넓게 보기</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.rangeButton}>
                      <Text style={styles.textStyle}>넓게 보기</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPressIn={() => handlePressIn('middle')}
                  onPressOut={handlePressOut}
                  onPress={() => {
                    toggleOptions();
                    getPosts('middle');
                  }}
                >
                  {activeButton === 'middle' ? (
                    <LinearGradient
                      colors={['#1BC5DA', '#263283']}
                      style={styles.gradient}
                    >
                      <Text style={styles.textStylePrimary}>옆 동네</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.rangeButton}>
                      <Text style={styles.textStyle}>옆 동네</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonContainer}
                  onPressIn={() => handlePressIn('small')}
                  onPressOut={handlePressOut}
                  onPress={() => {
                    toggleOptions();
                    getPosts('small');
                  }}
                >
                  {activeButton === 'small' ? (
                    <LinearGradient
                      colors={['#1BC5DA', '#263283']}
                      style={styles.gradient}
                    >
                      <Text style={styles.textStylePrimary}>동네 친구들</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.rangeButton}>
                      <Text style={styles.textStyle}>동네 친구들</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl onRefresh={() => getPosts(null, 0)} />
        }
      >
        <PagerView
          style={styles.pagerView}
          initialPage={0}
          ref={pagerViewRef}
          onPageSelected={handlePageChange}
        >
          {posts.map((post) => (
            <View key={post.postId} style={styles.container}>
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
    </>
  );
});

const styles = StyleSheet.create({
  container: {
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경 추가
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 5,
  },
  gradient: {
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center', // 버튼 내용 가운데 정렬
    width: '100%',
    height: 60, // 버튼 높이 조정
  },
  rangeButton: {
    backgroundColor: "white",
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center', // 버튼 내용 가운데 정렬
    width: '100%',
    height: 60, // 버튼 높이 조정
  },
  textStylePrimary: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PublicPosts;
