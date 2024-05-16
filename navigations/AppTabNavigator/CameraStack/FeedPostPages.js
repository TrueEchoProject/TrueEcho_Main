import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Modal, Image } from 'react-native';
import { ImageDouble } from './SendPost'; 
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

const FeedPostPage = ({ route }) => {
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
  const [title, setTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [friendRangeModalVisible, setFriendRangeModalVisible] = useState(false);
  // 친구 범위는 기본적으로 '친구'로 설정, 이는 scope 0에 해당합니다.
  const [friendRange, setFriendRange] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [timer, setTimer] = useState(route.params.remainingTime);
  // post_status는 기본적으로 'none' 상태입니다.
  const [postStatus, setPostStatus] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          // 'ontime' 상태 처리: 타이머가 3분(180초) 이내면 post_status를 'ontime'으로 설정합니다.
          if (prevTimer <= 180) {
            setPostStatus(3);
          }
          return prevTimer - 1;
        } else {
          // 'late' 상태 처리: 타이머가 0이 되면 post_status를 'late'으로 설정합니다.
          setPostStatus(2);
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // 너비만 지정하여 종횡비 유지
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

  const handleFriendRangeSelection = (range) => {
    // '친구'를 선택하면 scope를 0으로, '전체'를 선택하면 scope를 1로 설정합니다.
    const newScope = range === 'friends' ? 0 : 1;
    setFriendRange(newScope);
    setFriendRangeModalVisible(false);
  };

  const handleCameraSelection = (cameraType) => {
    setModalVisible(false);
    setSelectedCamera(cameraType);
  };

  const renderCameraImage = () => {
    if (selectedCamera === 'front') {
      return <Image source={{ uri: cameraData.front.uris[cameraData.front.selectedIndex] }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'back') {
      return <Image source={{ uri: cameraData.back.uris[cameraData.back.selectedIndex] }} style={styles.cameraImage} />;
    } else {
      return <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />;
    }
  };

  const shareFeed = async () => {
    // 'free' 상태 처리: 사용자가 게시물을 올릴 준비가 되었을 때 post_status를 'free'로 설정합니다.
    if (timer > 0 && timer <= 180) {
      setPostStatus(1);
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('scope', friendRange);
    formData.append('post_status', postStatus);

    // 이미지 처리
    if (selectedCamera === 'front' && cameraData.front.uris[cameraData.front.selectedIndex]) {
      const resizedImage = await resizeImage(cameraData.front.uris[cameraData.front.selectedIndex]);
      formData.append('post_front', {
        uri: resizedImage.uri,
        type: 'image/jpeg',
        name: 'front.jpg',
      });
    } else if (selectedCamera === 'back' && cameraData.back.uris[cameraData.back.selectedIndex]) {
      const resizedImage = await resizeImage(cameraData.back.uris[cameraData.back.selectedIndex]);
      formData.append('post_back', {
        uri: resizedImage.uri,
        type: 'image/jpeg',
        name: 'back.jpg',
      });
    }

    // 서버로 데이터 전송
    try {
      const response = await axios.post('https://192.168.0.101:8081', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('서버로부터의 응답:', response.data);
    } catch (error) {
      console.error('피드 업로드 오류:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Timer: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</Text>
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
});

export default FeedPostPage;