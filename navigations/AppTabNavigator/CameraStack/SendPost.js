import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Button, StyleSheet, Image, Text } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator'; // 이미지 조작 라이브러리
import * as FileSystem from 'expo-file-system'; // 파일 시스템 라이브러리
import { useNavigation } from '@react-navigation/native';

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

const SendPostStack = ({ route }) => {
  const navigation = useNavigation();
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
  const [timer, setTimer] = useState(route.params.remainingTime); // 타이머 상태

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer > 0) return prevTimer - 1; // 타이머 감소
        clearInterval(intervalId); // 타이머가 0이 되면 멈춤
        return 0;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const goToCameraScreen = () => {
    navigation.navigate("CameraOption"); // CameraOption 화면으로 이동
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

  const handleNext = async () => {
    try {
      const selectedFrontImageUri = cameraData.front.uris[cameraData.front.selectedIndex];
      const selectedBackImageUri = cameraData.back.uris[cameraData.back.selectedIndex];

      const resizedFrontImage = await resizeImage(selectedFrontImageUri); // 전면 사진 리사이즈
      const resizedBackImage = await resizeImage(selectedBackImageUri); // 후면 사진 리사이즈

      navigation.navigate('FeedPostPage', {
        frontImage: resizedFrontImage.uri,
        backImage: resizedBackImage.uri,
        remainingTime: timer, // 남은 시간 전달
      });
    } catch (error) {
      console.error('Error resizing images:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Timer: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</Text>
      <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />
      <Button title="Go to Camera" onPress={goToCameraScreen} />
      <Button title="Next" onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default SendPostStack;
