import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, Alert, TouchableOpacity, Keyboard, Dimensions } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import storage from '../../../AsyncStorage';
import Api from '../../../Api';
import ImageDouble from './ImageDouble';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

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
  const [friendRange, setFriendRange] = useState('FRIEND');
  const [selectedCamera, setSelectedCamera] = useState('dual');
  const [timer, setTimer] = useState(remainingTime !== undefined ? remainingTime : 180);
  const [friendRangeButtonText, setFriendRangeButtonText] = useState('Friend');
  const [cameraButtonText, setCameraButtonText] = useState('Dual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultImageUri = 'https://via.placeholder.com/1000';

  useEffect(() => {
    if (timer === 0) return;

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
  }, [timer]);

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

  const handleFriendRangeToggle = () => {
    setFriendRange((prevRange) => {
      const newRange = prevRange === 'FRIEND' ? 'PUBLIC' : 'FRIEND';
      setFriendRangeButtonText(newRange === 'FRIEND' ? 'Friend' : 'Public');
      return newRange;
    });
  };

  const handleCameraSelection = () => {
    setSelectedCamera((prevCamera) => {
      switch (prevCamera) {
        case 'front':
          setCameraButtonText('Back');
          return 'back';
        case 'back':
          setCameraButtonText('Dual');
          return 'dual';
        case 'dual':
        default:
          setCameraButtonText('Front');
          return 'front';
      }
    });
  };

  const renderCameraImage = () => {
    const frontImage = cameraData.front.uris[cameraData.front.selectedIndex];
    const backImage = cameraData.back.uris[cameraData.back.selectedIndex];

    if (selectedCamera === 'front') {
      return <Image source={{ uri: frontImage || defaultImageUri }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'back') {
      return <Image source={{ uri: backImage || defaultImageUri }} style={styles.cameraImage} />;
    } else if (selectedCamera === 'dual') {
      return <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />;
    } else {
      return <Text>No image available</Text>;
    }
  };

  const shareFeed = async () => {
    if (isSubmitting) return;

    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요!');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    formData.append('type', friendRange);
    formData.append('title', title);

    let resizedFrontImage = null;
    let resizedBackImage = null;

    if (selectedCamera === 'front' || selectedCamera === 'dual') {
      if (cameraData.front.uris[cameraData.front.selectedIndex]) {
        resizedFrontImage = await resizeImage(cameraData.front.uris[cameraData.front.selectedIndex]);
        if (resizedFrontImage) {
          formData.append('postFront', {
            uri: resizedFrontImage.uri,
            type: 'image/jpeg',
            name: 'resizedFront.jpg',
          });
        }
      }
    }

    if (selectedCamera === 'back' || selectedCamera === 'dual') {
      if (cameraData.back.uris[cameraData.back.selectedIndex]) {
        resizedBackImage = await resizeImage(cameraData.back.uris[cameraData.back.selectedIndex]);
        if (resizedBackImage) {
          formData.append('postBack', {
            uri: resizedBackImage.uri,
            type: 'image/jpeg',
            name: 'resizedBack.jpg',
          });
        }
      }
    }

    const currentTime = new Date();
    const formattedTime = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getHours()).padStart(2, '0')}-${String(currentTime.getMinutes()).padStart(2, '0')}`;
    formData.append('todayShot', formattedTime);

    try {
      const response = await Api.post('post/write', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 202 || response.status === 200) {
        const { data } = response;

        await storage.set('title', title);
        await storage.set('type', friendRange);
        if (resizedFrontImage) {
          await storage.set('postFront', resizedFrontImage.uri);
        }
        if (resizedBackImage) {
          await storage.set('postBack', resizedBackImage.uri);
        }
        await storage.set('todayShot', formattedTime);

        const postedIn24H = {
          postedFront: !!resizedFrontImage,
          postedBack: !!resizedBackImage,
          postedAt: formattedTime
        };
        await storage.set('postedIn24H', JSON.stringify(postedIn24H));

        // Navigate to the appropriate tab
        if (friendRange === 'PUBLIC') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainPost', params: { initialTab: 'OtherFeed' } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainPost', params: { initialTab: 'FriendFeed' } }],
          });
        }
      } else {
        console.error('Unexpected response status:', response.status);
        Alert.alert('오류', '피드 업로드 중 예상치 못한 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('피드 업로드 오류:', error.response ? error.response.data : error.message);
      Alert.alert('오류', '피드 업로드 중 오류가 발생했습니다.');
      navigation.navigate('CameraOption', { remainingTime: timer });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleSave = () => {
    Keyboard.dismiss();
  };

  const handleBack = () => {
    navigation.navigate('CameraOption', { remainingTime: timer });
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {formatTime(timer)}
      </Text>
      <View style={styles.imageContainer}>
        {renderCameraImage()}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.innerButtonContainer}>
          <TouchableOpacity style={styles.innerButton} onPress={handleCameraSelection}>
            <Text style={styles.innerButtonText}>{cameraButtonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.innerButton} onPress={handleFriendRangeToggle}>
            <Text style={styles.innerButtonText}>{friendRangeButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setTitle}
          value={title}
          placeholder="글을 작성해주세요"
          placeholderTextColor="white"
          onSubmitEditing={handleTitleSave}
        />
        <View style={styles.inputUnderline} />
      </View>
      <TouchableOpacity style={styles.shareButton} onPress={shareFeed} disabled={isSubmitting}>
        <Text style={styles.shareButtonText}>공유</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  timerText: {
    color: 'white',
    fontSize: width * 0.06,
    marginBottom: height * 0.01,
  },
  inputContainer: {
    width: '90%',
    backgroundColor: 'black',
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.02,
    marginBottom: height * 0.01,
  },
  input: {
    color: 'white',
    fontSize: width * 0.04,
  },
  inputUnderline: {
    height: 1,
    backgroundColor: 'gray',
    marginTop: height * 0.005,
  },
  imageContainer: {
    width: '90%', // 제목란과 동일한 너비로 설정
    aspectRatio: 3 / 4,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02, // 너비와 맞춰 조정
    overflow: 'hidden',
    position: 'relative',
    marginBottom: height * 0.01,
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: height * 0.01,
  },
  innerButtonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: height * 0.01,
    width: '90%',
    justifyContent: 'space-evenly',
  },
  innerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.02,
  },
  innerButtonText: {
    color: 'white',
    fontSize: width * 0.04,
  },
  shareButton: {
    backgroundColor: '#fff',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.05,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
  },
  shareButtonText: {
    color: '#000',
    fontSize: width * 0.04,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.01,
    right: width * 0.02,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: width * 0.02,
    padding: width * 0.01,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: width * 0.05,
    borderRadius: width * 0.02,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: height * 0.01,
    right: width * 0.02,
  },
});


export default FeedPostPage;
