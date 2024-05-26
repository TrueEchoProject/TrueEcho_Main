import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Modal, Image, Alert, TouchableOpacity, Keyboard } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { ImageDouble } from './SendPost';
import axios from 'axios';
import storage from '../../../AsyncStorage';

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
  const [title, setTitle] = useState(route.params.title || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [friendRangeModalVisible, setFriendRangeModalVisible] = useState(false);
  const [friendRange, setFriendRange] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [timer, setTimer] = useState(route.params.remainingTime || 180); // 3분 타이머로 초기화
  const [postStatus, setPostStatus] = useState(route.params.postStatus || 0); // postStatus 추가
  const [friendRangeButtonText, setFriendRangeButtonText] = useState('친구범위');
  const [cameraButtonText, setCameraButtonText] = useState('사진설정');
  
  useEffect(() => {
    // 타이머 설정을 위한 useEffect
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(intervalId);
          setPostStatus(1); // 타이머가 끝나면 postStatus를 1로 변경
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 타이머 정리
  }, []);
  
  // 이미지를 리사이즈하는 함수
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
      return null;
    }
  };
  
  // 친구 범위 선택 처리 함수
  const handleFriendRangeSelection = (range) => {
    const newScope = range === 'friends' ? 0 : 1;
    setFriendRange(newScope);
    setFriendRangeModalVisible(false);
    setFriendRangeButtonText(range === 'friends' ? '친구' : '전체');
  };
  
  // 카메라 선택 처리 함수
  const handleCameraSelection = (cameraType) => {
    setModalVisible(false);
    setSelectedCamera(cameraType);
    switch (cameraType) {
      case 'front':
        setCameraButtonText('전면사진');
        break;
      case 'back':
        setCameraButtonText('후면사진');
        break;
      case 'double':
        setCameraButtonText('전/후면사진');
        break;
      default:
        setCameraButtonText('사진설정');
    }
  };
  
  // 선택된 카메라 이미지를 렌더링하는 함수
  const renderCameraImage = () => {
    if (selectedCamera === 'front') {
      return <Image source={{ uri: cameraData.front.uris[cameraData.front.selectedIndex] }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'back') {
      return <Image source={{ uri: cameraData.back.uris[cameraData.back.selectedIndex] }} style={styles.cameraImage} />;
    } else {
      return <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />;
    }
  };
  
  // 게시물을 서버에 공유하는 함수
  const shareFeed = async () => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', friendRange);
    formData.append('postStatus', postStatus);
    
    let resizedFrontImage = null;
    let resizedBackImage = null;
    
    const cameraToUse = selectedCamera || 'double';
    
    // 전면 카메라 또는 전/후면 카메라 사용 시 전면 이미지 리사이즈 및 추가
    if (cameraToUse === 'front' || cameraToUse === 'double') {
      if (cameraData.front.uris[cameraData.front.selectedIndex]) {
        resizedFrontImage = await resizeImage(cameraData.front.uris[cameraData.front.selectedIndex]);
        if (resizedFrontImage) {
          formData.append('postFront', {
            uri: resizedFrontImage.uri,
            type: 'image/jpeg',
            name: 'resized_front.jpg',
          });
        } else {
          formData.append('postFront', null);
        }
      }
    } else {
      formData.append('postFront', null);
    }
    
    // 후면 카메라 또는 전/후면 카메라 사용 시 후면 이미지 리사이즈 및 추가
    if (cameraToUse === 'back' || cameraToUse === 'double') {
      if (cameraData.back.uris[cameraData.back.selectedIndex]) {
        resizedBackImage = await resizeImage(cameraData.back.uris[cameraData.back.selectedIndex]);
        if (resizedBackImage) {
          formData.append('postBack', {
            uri: resizedBackImage.uri,
            type: 'image/jpeg',
            name: 'resized_back.jpg',
          });
        } else {
          formData.append('postBack', null);
        }
      }
    } else {
      formData.append('postBack', null);
    }
    
    // 서버에 게시물 업로드
    try {
      const response = await axios.post('https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app/post/write', formData);
      
      if (response.status === 200) {
        const { data } = response;
        const currentTime = new Date();
        const formattedTime = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getHours()).padStart(2, '0')}-${String(currentTime.getMinutes()).padStart(2, '0')}`;
        
        // 스토리지에 게시물 세부 정보 저장
        await storage.set('todayShot', formattedTime);
        await storage.set('title', title);
        await storage.set('postStatus', postStatus.toString());
        if (resizedFrontImage) {
          await storage.set('postFront', resizedFrontImage.uri);
        }
        if (resizedBackImage) {
          await storage.set('postBack', resizedBackImage.uri);
        }
        
        Alert.alert('사진이 성공적으로 저장되었습니다.', `저장 시간: ${formattedTime}`);
        
        // 성공적으로 게시되었는지 확인 후 네비게이션
        if (data.posted) {
          if (friendRange === 0) {
            navigation.navigate('FriendFeed', { posted: true });
          } else {
            navigation.navigate('OtherFeed', { posted: true });
          }
        } else {
          navigation.navigate('CameraOption', { posted: false });
        }
      }
    } catch (error) {
      console.error('피드 업로드 오류:', error);
      Alert.alert('오류', '피드 업로드 중 오류가 발생했습니다.');
      navigation.navigate('CameraOption', { posted: false });
    }
  };
  
  // 제목 입력 완료 처리 함수
  const handleTitleSave = () => {
    Keyboard.dismiss();
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
          onSubmitEditing={handleTitleSave}
        />
        <Button title="입력" onPress={handleTitleSave} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setFriendRangeModalVisible(true)}>
          <Text style={styles.buttonText}>{friendRangeButtonText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>{cameraButtonText}</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
