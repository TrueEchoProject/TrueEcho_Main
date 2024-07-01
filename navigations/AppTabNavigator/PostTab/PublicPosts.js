import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity, Modal } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFocusEffect } from '@react-navigation/native';
import Api from '../../../Api';
import CardComponent from '../../../components/CardComponent';
import { MaterialIcons } from '@expo/vector-icons';

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

  React.useImperativeHandle(ref, () => ({
    getPosts: refreshPosts,
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
    const serverResponse = await Api.get(`/post/read/1?index=0&pageCount=5&type=PUBLIC`);
    setPosts(serverResponse.data.data.readPostResponse);
    setLocation(serverResponse.data.data.yourLocation)
    if (serverResponse.data) {
      setRefreshing(false);
      setOptionsVisible(false);
      setTimeout(() => {
        pagerViewRef.current?.setPageWithoutAnimation(0);
      }, 50); // 소폭의 지연을 추가하여 컴포넌트의 상태가 안정화되도록 합니다.
    }
  };

  const getPosts = async (selectedRange = null, index = 0, baseUrl = '/post/read/1') => {
    let url = `${baseUrl}?index=${index}&pageCount=15&type=PUBLIC`;
    if (selectedRange) {
      try {
        setCopiedLocation(location)
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
        console.log('Got location:', newLocation)
        url += `&location=${encodeURIComponent(newLocation)}`;
      } catch (error) {
        console.error('Fetching user location failed:', error);
        setRefreshing(false);
        return;
      }
    }

    try {
      console.log(`url is`, url);
      const serverResponse = await Api.get(url);
      const newPosts = serverResponse.data.data.readPostResponse;
      if (serverResponse.data.message === "게시물을 조회를 실패했습니다.") {
        console.log("No more posts to load.");
        alert("No more posts to load.")
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

  if (posts.length === 0) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <>
      <View style={{ alignItems: "flex-end", backgroundColor: "white", position: "relative" }}>
        <TouchableOpacity onPress={toggleOptions}>
          <MaterialIcons
            name='settings'
            size={28}
            style={{
              backgroundColor: "white",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      </View>
      {optionsVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={optionsVisible}
          onRequestClose={toggleOptions}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity style={styles.button} onPress={toggleOptions}>
                <MaterialIcons name="backspace"></MaterialIcons>
              </TouchableOpacity>
              <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.rangeButton}
                  onPress={() => getPosts('big')}
                >
                  <Text style={styles.textStyle}>넓은 범위</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rangeButton}
                  onPress={() => getPosts('middle')}
                >
                  <Text style={styles.textStyle}>중간 범위</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rangeButton}
                  onPress={() => getPosts('small')}
                >
                  <Text style={styles.textStyle}>작은 범위</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => getPosts(null, 0)} />
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
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  pagerView: {
    flex: 1,
    backgroundColor: 'white',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    position: "relative",
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    position: "absolute",
    right: 2,
    top: 2,
    borderRadius: 20,
    padding: 10,
  },
  rangeButton: {
    backgroundColor: "grey",
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default PublicPosts;
