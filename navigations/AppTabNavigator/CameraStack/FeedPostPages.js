import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Image, Alert, TouchableOpacity, Keyboard, ScrollView, Button } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { ImageDouble } from './SendPost';
import storage from '../../../AsyncStorage';
import Api from '../../../Api';
import { MaterialIcons } from '@expo/vector-icons';

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
  const [friendRange, setFriendRange] = useState('FRIEND');
  const [selectedCamera, setSelectedCamera] = useState('double');
  const [timer, setTimer] = useState(route.params.remainingTime || 180);
  const [friendRangeButtonText, setFriendRangeButtonText] = useState('친구범위');
  const [cameraButtonText, setCameraButtonText] = useState('사진설정');
  
  const defaultImageUri = 'https://via.placeholder.com/1000'; // 기본 이미지 URI
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(intervalId);
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
        [{ resize: { width: 1000 } }],
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
  
  const handleFriendRangeSelection = (range) => {
    const newScope = range === 'friends' ? 'FRIEND' : 'PUBLIC';
    setFriendRange(newScope);
    setFriendRangeModalVisible(false);
    setFriendRangeButtonText(range === 'friends' ? '친구' : '전체');
  };
  
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
  
  const renderCameraImage = () => {
    const frontImage = cameraData.front.uris[cameraData.front.selectedIndex];
    const backImage = cameraData.back.uris[cameraData.back.selectedIndex];
    
    if (selectedCamera === 'front') {
      return <Image source={{ uri: frontImage || defaultImageUri }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'back') {
      return <Image source={{ uri: backImage || defaultImageUri }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'double') {
      return <ImageDouble cameraData={cameraData} setCameraData={setCameraData} defaultImageUri={defaultImageUri} />;
    } else {
      return <Text>No image available</Text>;
    }
  };
  
  const shareFeed = async () => {
    if (!title) {
      Alert.alert('알림', '제목을 입력해주세요!');
      return;
    }

    const formData = new FormData();
    
    formData.append('type', friendRange);
    console.log('type:', friendRange);
    
    formData.append('title', title);
    console.log('title:', title);
    
    let resizedFrontImage = null;
    let resizedBackImage = null;
    
    if (selectedCamera === 'front' || selectedCamera === 'double') {
      if (cameraData.front.uris[cameraData.front.selectedIndex]) {
        resizedFrontImage = await resizeImage(cameraData.front.uris[cameraData.front.selectedIndex]);
        if (resizedFrontImage) {
          formData.append('postFront', {
            uri: resizedFrontImage.uri,
            type: 'image/jpeg',
            name: 'resizedFront.jpg',
          });
          console.log('postFront added:', resizedFrontImage.uri);
        }
      }
    }
    
    if (selectedCamera === 'back' || selectedCamera === 'double') {
      if (cameraData.back.uris[cameraData.back.selectedIndex]) {
        resizedBackImage = await resizeImage(cameraData.back.uris[cameraData.back.selectedIndex]);
        if (resizedBackImage) {
          formData.append('postBack', {
            uri: resizedBackImage.uri,
            type: 'image/jpeg',
            name: 'resizedBack.jpg',
          });
          console.log('postBack added:', resizedBackImage.uri);
        }
      }
    }
    
    if (selectedCamera === 'front' && !resizedFrontImage) {
      console.log('postBack not added, no back image selected');
    }
    
    if (selectedCamera === 'back' && !resizedBackImage) {
      console.log('postFront not added, no front image selected');
    }
    
    const currentTime = new Date();
    const formattedTime = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getHours()).padStart(2, '0')}-${String(currentTime.getMinutes()).padStart(2, '0')}`;
    formData.append('todayShot', formattedTime);
    console.log('todayShot:', formattedTime);
    
    try {
      const response = await Api.post('https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app/post/write', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 202 || response.status === 200) {
        const { data } = response;
        console.log('Server Response: ', data);
        
        await storage.set('title', title);
        console.log(`Title stored: ${title}`);
        await storage.set('type', friendRange);
        console.log(`Type stored: ${friendRange}`);
        if (resizedFrontImage) {
          await storage.set('postFront', resizedFrontImage.uri);
          console.log(`PostFront stored: ${resizedFrontImage.uri}`);
        }
        if (resizedBackImage) {
          await storage.set('postBack', resizedBackImage.uri);
          console.log(`PostBack stored: ${resizedBackImage.uri}`);
        }
        await storage.set('todayShot', formattedTime);
        console.log(`TodayShot stored: ${formattedTime}`);
        
        Alert.alert('사진이 성공적으로 저장되었습니다.', `저장 시간: ${formattedTime}`);
        
        if (friendRange === 'FRIEND') {
          navigation.navigate('FriendFeed', { initialPage: 0 });
        } else {
          navigation.navigate('OtherFeed', { initialPage: 0 });
        }
      } else {
        console.error('Unexpected response status:', response.status);
        Alert.alert('오류', '피드 업로드 중 예상치 못한 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('피드 업로드 오류:', error.response ? error.response.data : error.message);
      Alert.alert('오류', '피드 업로드 중 오류가 발생했습니다.');
      navigation.navigate('CameraOption');
    }
  };
  
  const handleTitleSave = () => {
    Keyboard.dismiss();
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.timerText}>Timer: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            onChangeText={setTitle}
            value={title}
            placeholder="제목을 입력해주세요."
            onSubmitEditing={handleTitleSave}
          />
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
        <TouchableOpacity style={styles.uploadButton} onPress={shareFeed}>
          <Text style={styles.uploadButtonText}>피드에 올리기</Text>
        </TouchableOpacity>
      </ScrollView>
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
            <TouchableOpacity style={styles.closeButton} onPress={() => setFriendRangeModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  titleInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#add8e6',
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#add8e6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  cameraImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // 이미지의 aspectRatio에 맞춰 컨테이너를 채움
  },
  uploadButton: {
    backgroundColor: '#20b2aa',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
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
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default FeedPostPage;
