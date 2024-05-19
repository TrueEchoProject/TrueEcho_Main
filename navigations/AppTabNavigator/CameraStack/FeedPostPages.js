import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Modal, Image, Alert } from 'react-native';
import secureApi from '../../../SecureApi'; // 보안 API
import storage from '../../../AsyncStorage'; // AsyncStorage 사용
import * as ImageManipulator from 'expo-image-manipulator'; // 이미지 조작 라이브러리
import { useNavigation } from '@react-navigation/native';
import { ImageDouble } from './SendPost';
import FriendPosts from '../PostTab/FriendPosts'; 
import PublicPosts from '../PostTab/PublicPosts'; 

/**
 * 알림 시간을 백엔드에 보내 ontime 여부를 검증하는 함수
 * @returns {number} - postStatus 값
 */
const checkPostStatus = async () => {
  try {
    const notificationTime = await storage.get('notificationTime');
    if (notificationTime) {
      const response = await secureApi.post('/check-post-status', { notificationTime });
      return response.data.postStatus;
    }
    return 0;
  } catch (error) {
    console.error('Error checking post status:', error);
    return 0;
  }
};

const FeedPostPage = ({ route }) => {
  const navigation = useNavigation();
  const [cameraData, setCameraData] = useState({
    front: {
      uris: [route.params.frontImage],
      selectedIndex: 0,
    },
    back: {
      uris: [route.params.backImage],
      selectedIndex: 0,
    },
  });
  const [title, setTitle] = useState(route.params.title || ''); // 게시물 제목
  const [modalVisible, setModalVisible] = useState(false); // 카메라 선택 모달 가시성
  const [friendRangeModalVisible, setFriendRangeModalVisible] = useState(false); // 친구 범위 모달 가시성
  const [friendRange, setFriendRange] = useState(0); // 친구 범위 상태
  const [selectedCamera, setSelectedCamera] = useState(null); // 선택된 카메라 상태
  const [timer, setTimer] = useState(route.params.remainingTime); // 타이머 상태
  const [postStatus, setPostStatus] = useState(0); // 게시물 상태
  const [feedType, setFeedType] = useState('unknown'); // 피드 타입

  // 타이머를 1초씩 감소시키는 useEffect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1; // 타이머 감소
        } else {
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 컴포넌트가 마운트될 때 초기 게시물 상태를 설정하는 useEffect
  useEffect(() => {
    const setInitialPostStatus = async () => {
      const status = await checkPostStatus();
      setPostStatus(status);
      updateFeedType(status);
    };

    setInitialPostStatus();
  }, []);

  // 카메라 진입 시 postStatus를 검증하는 useEffect
  useEffect(() => {
    const verifyPostStatus = async () => {
      const status = await checkPostStatus();
      setPostStatus(status);
      updateFeedType(status);
    };

    if (selectedCamera) {
      verifyPostStatus();
    }
  }, [selectedCamera]); // 카메라 선택 시마다 검증

  /**
   * 게시물 상태에 따라 피드 타입을 설정하는 함수
   * @param {number} status - 게시물 상태
   */
  const updateFeedType = (status) => {
    if (status === 1) {
      setFeedType('todayShot'); // 오늘 알림 발생 이후 사진을 찍은 사용자
    } else if (status === 2) {
      setFeedType('notTodayShot'); // 오늘 사진을 찍지 않은 사용자
    } else {
      setFeedType('recentShot'); // 그 외의 경우
    }
  };

  /**
   * 이미지를 리사이즈하는 함수
   * @param {string} uri - 이미지 URI
   * @returns {Object} - 리사이즈된 이미지 객체
   */
  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );
      return {
        uri: manipResult.uri,
        type: 'image/jpeg',
        name: 'resized.jpg',
      };
    } catch (error) {
      console.error('이미지 크기 조정 오류:', error);
    }
  };

  /**
   * 친구 범위를 선택하는 함수
   * @param {string} range - 친구 범위 ('friends' 또는 'everyone')
   */
  const handleFriendRangeSelection = (range) => {
    const newScope = range === 'friends' ? 0 : 1;
    setFriendRange(newScope); // 친구 범위 설정
    setFriendRangeModalVisible(false); // 모달 가리기
  };

  /**
   * 카메라를 선택하는 함수
   * @param {string} cameraType - 카메라 타입 ('front', 'back', 'double')
   */
  const handleCameraSelection = (cameraType) => {
    setModalVisible(false); // 모달 가리기
    setSelectedCamera(cameraType); // 선택된 카메라 설정
  };

  /**
   * 선택된 카메라 이미지 렌더링 함수
   * @returns {React.Component} - 카메라 이미지 컴포넌트
   */
  const renderCameraImage = () => {
    if (selectedCamera === 'front') {
      return <Image source={{ uri: cameraData.front.uris[cameraData.front.selectedIndex] }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'back') {
      return <Image source={{ uri: cameraData.back.uris[cameraData.back.selectedIndex] }} style={styles.cameraImage} />;
    } else {
      return <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />;
    }
  };

  /**
   * 피드에 게시물을 공유하는 함수
   */
  const shareFeed = async () => {
    const formData = new FormData();
    formData.append('title', title); // 제목 추가
    formData.append('type', friendRange); // 친구 범위 추가
    formData.append('postStatus', postStatus); // 게시물 상태 추가

    if (selectedCamera === 'front' && cameraData.front.uris[cameraData.front.selectedIndex]) {
      const resizedImage = await resizeImage(cameraData.front.uris[cameraData.front.selectedIndex]);
      formData.append('postFront', {
        uri: resizedImage.uri,
        type: 'image/jpeg',
        name: 'front.jpg',
      });
    } else if (selectedCamera === 'back' && cameraData.back.uris[cameraData.back.selectedIndex]) {
      const resizedImage = await resizeImage(cameraData.back.uris[cameraData.back.selectedIndex]);
      formData.append('postBack', {
        uri: resizedImage.uri,
        type: 'image/jpeg',
        name: 'back.jpg',
      });
    }

    try {
      const response = await secureApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('서버로부터의 응답:', response.data);

      if (response.status === 200) {
        const currentTime = new Date();
        const formattedTime = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getHours()).padStart(2, '0')}-${String(currentTime.getMinutes()).padStart(2, '0')}`;

        await storage.set('todayShot', formattedTime);
        await storage.set('ShotLog', formattedTime);

        Alert.alert('사진이 성공적으로 저장되었습니다.', `저장 시간: ${formattedTime}`);

        if (friendRange === 0) {
          navigation.navigate('FriendPosts', { refresh: true }); // 친구 게시물 화면으로 이동
        } else {
          navigation.navigate('PublicPosts', { refresh: true }); // 다른 피드 화면으로 이동
        }
      }
    } catch (error) {
      console.error('피드 업로드 오류:', error);
      Alert.alert('오류', '피드 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Timer: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</Text>
      <Text>Post Status: {postStatus}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.titleInput}
          onChangeText={setTitle}
          value={title}
          placeholder="제목을 입력해주세요."
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="친구범위" onPress={() => setFriendRangeModalVisible(true)} />
        <Button title="사진설정" onPress={() => setModalVisible(true)} />
      </View>
      <View style={styles.imageContainer}>
        {renderCameraImage()}
      </View>
      <Button title="피드에 올리기" onPress={shareFeed} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={friendRangeModalVisible}
        onRequestClose={() => setFriendRangeModalVisible(!friendRangeModalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button title="친구" onPress={() => handleFriendRangeSelection('friends')} />
            <Button title="전체" onPress={() => handleFriendRangeSelection('everyone')} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Button title="전면 카메라" onPress={() => handleCameraSelection('front')} />
            <Button title="후면 카메라" onPress={() => handleCameraSelection('back')} />
            <Button title="전/후면 카메라" onPress={() => handleCameraSelection('double')} />
          </View>
        </View>
      </Modal>

      <View style={styles.feedContainer}>
        {feedType === 'todayShot' && <FriendPosts />}
        {feedType === 'recentShot' && <PublicPosts />}
        {feedType === 'notTodayShot' && <PublicPosts />}
        {feedType === 'unknown' && <Text>알 수 없는 상태</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 12,
  },
  titleInput: {
    flex: 1,
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
  },
  imageContainer: {
    width: '90%',
    aspectRatio: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  feedContainer: {
    flex: 1,
    width: '100%',
  },
});

export default FeedPostPage;
