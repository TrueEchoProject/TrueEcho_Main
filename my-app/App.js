import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './style'; 


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function CustomCamera() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [isCapturing, setIsCapturing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const cameraRef = useRef(null);

  // 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // 카메라 전환 함수
  const toggleCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  // 플래시 전환 함수
  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  // 줌 인 함수
  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 1)); // 최대 줌 레벨은 1로 설정
  };

  // 줌 아웃 함수
  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0)); // 최소 줌 레벨은 0으로 설정
  };

  // 사진 촬영 함수
  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);

      // 후면 카메라 촬영
      const backgroundPhoto = await cameraRef.current.takePictureAsync();

      // 전면 카메라로 전환
      setCameraType(Camera.Constants.Type.front);

      // Show "활짝 웃으세요" message for 1 second
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1000);

      // 1초 후에 사진 촬영
      setTimeout(async () => {
        const frontPhoto = await cameraRef.current.takePictureAsync();

        // 촬영 후 작업 추가 (예: 이미지 저장, 전송 등)
        console.log('후면 사진:', backgroundPhoto);
        console.log('전면 사진:', frontPhoto);

        setIsCapturing(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (hasPermission === false) {
      Alert.alert(
        '카메라 권한 요청',
        '이 기능을 사용하려면 카메라 권한이 필요합니다.',
        [
          {
            text: '확인',
            onPress: () => console.log('카메라 권한 요청 확인 버튼 클릭'),
          },
        ],
        { cancelable: false }
      );
    }
  }, [hasPermission]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={[styles.camera, { height: windowHeight - 200 }]} // 카메라 화면 높이 조정
        type={cameraType}
        flashMode={flashMode}
        zoom={zoomLevel} // 줌 레벨 적용
        ref={cameraRef}
      >
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.button}
            onPress={toggleFlash}
          >
            <MaterialIcons
              name={flashMode === Camera.Constants.FlashMode.on ? 'flash-on' : 'flash-off'}
              size={30}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={toggleCamera}
          >
            <MaterialIcons
              name="flip-camera-ios"
              size={30}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </Camera>
      {showMessage && (
        <View style={styles.overlay}>
         
         <Text style={styles.overlayText}>활짝 웃으세요</Text>
        </View>
      )}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <MaterialIcons name="zoom-in" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <MaterialIcons name="zoom-out" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}