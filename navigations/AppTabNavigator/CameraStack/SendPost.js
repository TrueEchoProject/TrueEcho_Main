import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Button, TextInput, StyleSheet, Image, Alert, Text } from 'react-native';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const defaultImage = 'https://mblogthumb-phinf.pstatic.net/MjAyMjAyMDdfMjEy/MDAxNjQ0MTk0Mzk2MzY3.WAeeVCu2V3vqEz_98aWMOjK2RUKI_yHYbuZxrokf-0Ug.sV3LNWlROCJTkeS14PMu2UBl5zTkwK70aKX8B1w2oKQg.JPEG.41minit/1643900851960.jpg?type=w800';

export const ImageDouble = React.memo(({ cameraData, setCameraData }) => {
  const swapImageIndices = () => {
    setCameraData((prevData) => ({
      front: {
        uris: prevData.back.uris,
        selectedIndex: prevData.back.selectedIndex,
      },
      back: {
        uris: prevData.front.uris,
        selectedIndex: prevData.front.selectedIndex,
      },
    }));
  };

  const frontImageUri = cameraData.front.uris[cameraData.front.selectedIndex] || defaultImage;
  const backImageUri = cameraData.back.uris[cameraData.back.selectedIndex] || defaultImage;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={swapImageIndices} style={styles.imageTouchable}>
        <Image source={{ uri: backImageUri }} style={styles.mainImage} />
        <View style={styles.smallImageContainer}>
          <Image source={{ uri: frontImageUri }} style={styles.smallImage} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const SendPostStack = ({ navigation, route }) => {
  const [cameraData, setCameraData] = useState({
    front: {
      uris: route.params.frontCameraUris || [],
      selectedIndex: 0,
    },
    back: {
      uris: route.params.backCameraUris || [],
      selectedIndex: 0,
    },
  });
  const [title, setTitle] = useState('');
  const [timer, setTimer] = useState(route.params.remainingTime); // 넘겨받은 타이머 값으로 초기화

  // 타이머를 계속 진행시키는 로직
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer > 0) return prevTimer - 1;
        clearInterval(intervalId);
        return 0;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const goToCameraScreen = () => {
    navigation.navigate("CameraOption");
  };

  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);

      console.log('Resized image URI:', manipResult.uri);
      console.log(`Resized Image dimensions: ${manipResult.width} x ${manipResult.height}`);
      console.log(`Resized image size: ${fileInfo.size} bytes`);

      return { uri: manipResult.uri, type: 'image/jpeg', name: 'photo.jpg' };
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  };

  const shareImage = async () => {
    try {
      const selectedFrontImageUri = cameraData.front.uris[cameraData.front.selectedIndex];
      const selectedBackImageUri = cameraData.back.uris[cameraData.back.selectedIndex];

      const resizedFrontImage = await resizeImage(selectedFrontImageUri);
      const resizedBackImage = await resizeImage(selectedBackImageUri);

      const formData = new FormData();
      formData.append('scope', 1);
      formData.append('post_front', resizedFrontImage);
      formData.append('post_back', resizedBackImage);
      formData.append('title', title);
      formData.append('post_status', 1);

      await axios.post('http://192.168.0.102:8081', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigation.navigate('FeedPostPage', {
        frontImage: cameraData.front.uris[cameraData.front.selectedIndex],
        backImage: cameraData.back.uris[cameraData.back.selectedIndex],
        title: title,
        remainingTime: timer  // 타이머 상태를 전달
      });

      //Alert.alert("Success", "게시물이 성공적으로 등록되었습니다.");
    } catch (error) {
      //console.error('Error sharing images and post data:', error);
      //Alert.alert("Error", "게시물 등록에 실패했습니다.");
    }
  };

  const FeedPage = ({ route }) => {
    // route.params를 통해 전달된 이미지 URI 가져오기
    const { frontImage, backImage } = route.params;
    
    return (
      <View style={styles.feedContainer}>
        <Text>Feed Page</Text>
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: frontImage }} style={styles.previewImage} />
          <Image source={{ uri: backImage }} style={styles.previewImage} />
        </View>
        {/* 피드 내 다른 게시물을 렌더링하는 로직 */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 타이머 표시 */}
      <Text>Timer: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</Text>
      <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />
      <Button title="Go to Camera" onPress={goToCameraScreen} />
      <Button title="Share" onPress={shareImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
  },
  previewImage: {
    width: 100,
    height: 100,
    margin: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallImageContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1,
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  }
});

export default SendPostStack;