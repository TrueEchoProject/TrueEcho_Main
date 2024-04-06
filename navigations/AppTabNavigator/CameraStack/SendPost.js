import React, { useState } from 'react';
import { View, TouchableOpacity, Button, StyleSheet, Image } from 'react-native';

const defaultImage = 'path_to_your_default_image_here'; // 기본 이미지 경로 설정

const ImageDouble = React.memo(({ cameraData, setCameraData }) => {
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

  const [postStatus, setPostStatus] = useState('0'); // 초기 post_status 값은 '0'으로 설정
  const scopeValue = 1; // scope 값을 적절한 값으로 설정

  async function convertToBinary(uri) {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${uri}: ${response.statusText}`);
    }
    return response.blob();
  }

  const getPostStatusFromServer = async () => {
    // 서버 요청이 성공했다고 가정하고 응답을 모의하는 부분
    const serverResponseMock = {
      status: '1', // [ 0: none, 1: "free", 2: late, 3: onTime ]
    };

    // 서버로부터 받은 결과에 따라 post_status를 설정
    setPostStatus(serverResponseMock.status);
  };

  const handleSubmit = async () => {
    // 먼저 post_status를 설정하기 위해 서버와 통신
    await getPostStatusFromServer();

    const frontImageUri = cameraData.front.uris[cameraData.front.selectedIndex];
    const backImageUri = cameraData.back.uris[cameraData.back.selectedIndex];

    try {
      const frontImageData = await convertToBinary(frontImageUri); // 바이너리화
      const backImageData = await convertToBinary(backImageUri);

      const formData = new FormData();
      formData.append('scope', scopeValue);
      formData.append('post_front', frontImageData, 'front.jpg');
      formData.append('post_back', backImageData, 'back.jpg');
      formData.append('title', 'Your Post Title');
      formData.append('post_status', postStatus);

      // 서버 엔드포인트 URL
      const serverUrl = 'https://your-server.com/api/upload';
      const response = await fetch(serverUrl, { // fetch api 활용
        method: 'POST',
        body: formData,
      });

      if (!response.ok) { // 서버의 응답을 확인
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Server response:', result);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageDouble cameraData={cameraData} setCameraData={setCameraData} />
      <Button title="Submit Post" onPress={handleSubmit} />
      <Button title="Go to Camera" onPress={() => navigation.navigate("CameraOption")} />
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
