import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Camera as ExpoCamera } from 'expo-camera/legacy';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null); // 카메라 권한 상태
  const [cameraType, setCameraType] = useState(ExpoCamera.Constants.Type.back); // 카메라 종류 (전면/후면)
  const [flashMode, setFlashMode] = useState(ExpoCamera.Constants.FlashMode.off); // 플래시 모드 상태
  const [zoom, setZoom] = useState(0); // 줌 상태
  const [isFocused, setIsFocused] = useState(false); // 화면 포커스 상태
  const [timer, setTimer] = useState(180); // 타이머 상태 (180초)
  const [postStatus, setPostStatus] = useState(2); // 기본값은 freetime (2)
  const cameraRef = useRef(null); // 카메라 참조
  
  // 카메라 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // 카메라 ontime 검증
  useEffect(() => {
    const checkCameraOnTime = async () => {
      try {
        const response = await axios.get('https://port-0-true-echo-85phb42blucciuvv.sel5.cloudtype.app/post/check');
        if (response.status === 200) {
          setPostStatus(response.data.isChecked);
        }
      } catch (error) {
        console.error('카메라 ontime 검증 오류:', error);
      }
    };
    
    checkCameraOnTime();
  }, []);
  
  // 화면 포커스 상태 업데이트
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setIsFocused(true);
      setCameraType(ExpoCamera.Constants.Type.back);
    });
    
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setIsFocused(false);
    });
    
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);
  
  // 타이머 설정
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          clearInterval(intervalId);
          if (postStatus === 0) {
            setPostStatus(1); // late 상태로 변경
          }
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 타이머 정리
  }, [postStatus]);
  
  // 사진 촬영 함수
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      return data;
    }
    return null;
  };
  
  // 사진 캡처 및 화면 전환 처리 함수
  const handleCapture = async () => {
    const firstPictureData = await takePicture();
    let frontCameraUris = [];
    let backCameraUris = [];
    
    if (firstPictureData && firstPictureData.uri) {
      if (cameraType === ExpoCamera.Constants.Type.back) {
        backCameraUris.push(firstPictureData.uri);
      } else {
        frontCameraUris.push(firstPictureData.uri);
      }
    }
    
    const nextCameraType = cameraType === ExpoCamera.Constants.Type.back ? ExpoCamera.Constants.Type.front : ExpoCamera.Constants.Type.front;
    setCameraType(nextCameraType);
    
    setTimeout(async () => {
      const secondPictureData = await takePicture();
      if (secondPictureData && secondPictureData.uri) {
        if (nextCameraType === ExpoCamera.Constants.Type.back) {
          backCameraUris.push(secondPictureData.uri);
        } else {
          frontCameraUris.push(secondPictureData.uri);
        }
      }
      
      navigation.navigate("SendPosts", { frontCameraUris, backCameraUris, remainingTime: timer, postStatus }); // postStatus 전달
    }, 1000);
  };
  
  // 플래시 모드 변경 함수
  const handleFlashMode = () => {
    setFlashMode((prevMode) => {
      switch (prevMode) {
        case ExpoCamera.Constants.FlashMode.off:
          return ExpoCamera.Constants.FlashMode.on;
        case ExpoCamera.Constants.FlashMode.on:
          return ExpoCamera.Constants.FlashMode.auto;
        case ExpoCamera.Constants.FlashMode.auto:
        default:
          return ExpoCamera.Constants.FlashMode.off;
      }
    });
  };
  
  // 카메라 종류 변경 함수
  const handleCameraType = () => {
    setCameraType(
      cameraType === ExpoCamera.Constants.Type.back
        ? ExpoCamera.Constants.Type.front
        : ExpoCamera.Constants.Type.back
    );
  };
  
  // 줌 아웃 함수
  const handleZoomOut = () => {
    if (Platform.OS === 'ios') {
      setZoom(zoom - 0.01 >= 0 ? zoom - 0.01 : 0);
    } else if (Platform.OS === 'android') {
      setZoom(zoom - 0.1 >= 0 ? zoom - 0.1 : 0);
    }
  };
  
  // 줌 인 함수
  const handleZoomIn = () => {
    if (Platform.OS === 'ios') {
      setZoom(zoom + 0.01 <= 1 ? zoom + 0.01 : 1);
    } else if (Platform.OS === 'android') {
      setZoom(zoom + 0.1 <= 10 ? zoom + 0.1 : 10);
    }
  };
  
  return (
    <View style={styles.container}>
      {hasPermission === null ? ( // 카메라 권한 확인
        <View />
      ) : hasPermission === false ? ( // 카메라 권한 없음
        <Text>No access to camera</Text>
      ) : (
        <React.Fragment>
          {isFocused && (
            <ExpoCamera
              style={styles.camera}
              type={cameraType}
              flashMode={flashMode}
              zoom={zoom}
              ref={cameraRef}
            />
          )}
          <View style={styles.zoomContainer}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.zoomText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.zoomText}>{(zoom * 10).toFixed(1)}x</Text>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.zoomText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>Timer: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</Text>
          </View>
          <View style={styles.controlPanel}>
            <TouchableOpacity style={styles.iconButton} onPress={handleFlashMode}>
              {flashMode === ExpoCamera.Constants.FlashMode.off && <MaterialIcons name="flash-off" size={24} color="white" />}
              {flashMode === ExpoCamera.Constants.FlashMode.on && <MaterialIcons name="flash-on" size={24} color="white" />}
              {flashMode === ExpoCamera.Constants.FlashMode.auto && <MaterialIcons name="flash-auto" size={24} color="white" />}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <FontAwesome name="camera" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleCameraType}>
              <MaterialIcons name="flip-camera-ios" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </React.Fragment>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButton: {
    padding: 15,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'white',
    borderWidth: 2,
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 30,
    padding: 10,
  },
  zoomText: {
    color: 'white',
    fontSize: 18,
  },
  timerContainer: { // 타이머 컨테이너 스타일 추가
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerText: { // 타이머 텍스트 스타일
    color: 'white',
    fontSize: 18,
  },
});

export default CameraScreen;

