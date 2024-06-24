import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Image, Alert, TouchableOpacity, Keyboard, Button} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import storage from '../../../AsyncStorage';
import Api from '../../../Api';
import ImageDouble from './ImageDouble';
import { MaterialIcons } from '@expo/vector-icons'; // 아이콘 추가

const FeedPostPage = ({ route }) => {
  const navigation = useNavigation();
  const { frontCameraUris, backCameraUris, remainingTime } = route.params;
  const [cameraData, setCameraData] = useState({
    front: {
      uris: frontCameraUris,
      selectedIndex: 0,
    },
    back: {
      uris: backCameraUris,
      selectedIndex: 0,
    },
  });
  const [title, setTitle] = useState(route.params.title || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [friendRangeModalVisible, setFriendRangeModalVisible] = useState(false);
  const [friendRange, setFriendRange] = useState('FRIEND');
  const [selectedCamera, setSelectedCamera] = useState('double');
  const [timer, setTimer] = useState(remainingTime || 180);
  const [friendRangeButtonText, setFriendRangeButtonText] = useState('친구범위');
  const [cameraButtonText, setCameraButtonText] = useState('사진설정');
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 요청 방지 상태

  const defaultImageUri = 'https://via.placeholder.com/1000';

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
      return <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />;
    } else {
      return <Text>No image available</Text>;
    }
  };

  const shareFeed = async () => {
    if (isSubmitting) return; // 이미 제출 중이면 아무 작업도 하지 않음

    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요!');
      return;
    }

    setIsSubmitting(true); // 제출 시작

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
    } finally {
      setIsSubmitting(false); // 제출 완료
    }
  };

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
      <TouchableOpacity style={styles.submitButton} onPress={shareFeed} disabled={isSubmitting}>
        <Text style={styles.submitButtonText}>피드에 올리기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>뒤로 가기</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={friendRangeModalVisible}
        onRequestClose={() => setFriendRangeModalVisible(!friendRangeModalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setFriendRangeModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
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
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

export default FeedPostPage;
