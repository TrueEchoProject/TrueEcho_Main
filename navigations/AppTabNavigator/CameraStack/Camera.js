import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Camera as ExpoCamera } from 'expo-camera/legacy';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImageManipulator from 'expo-image-manipulator';

const CameraScreen = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(ExpoCamera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(ExpoCamera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const initialTimer = route.params?.remainingTime !== undefined ? route.params.remainingTime : 180;
  const [timer, setTimer] = useState(initialTimer); // 타이머 초기화
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      setCameraType(ExpoCamera.Constants.Type.back);

      return () => setIsFocused(false);
    }, [])
  );

  useEffect(() => {
    if (timer === 0) return; // 타이머가 0초가 되면 더 이상 감소하지 않도록

    let intervalId;
    if (timer > 0) {
      intervalId = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(intervalId);
            return 0;
          }
        });
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [timer]);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      let data = await cameraRef.current.takePictureAsync(options);

      if (cameraType === ExpoCamera.Constants.Type.front) {
        const manipResult = await ImageManipulator.manipulateAsync(
          data.uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
        );
        data.uri = manipResult.uri;
      }

      return data;
    }
    return null;
  };

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

    const nextCameraType = cameraType === ExpoCamera.Constants.Type.back ? ExpoCamera.Constants.Type.front : ExpoCamera.Constants.Type.back;
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

      // FeedPostPage로 데이터를 전달합니다
      navigation.navigate("FeedPostPage", { frontCameraUris, backCameraUris, remainingTime: timer });
    }, 1000);
  };

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

  const handleCameraType = () => {
    setCameraType(
      cameraType === ExpoCamera.Constants.Type.back
        ? ExpoCamera.Constants.Type.front
        : ExpoCamera.Constants.Type.back
    );
  };

  const handleZoomOut = () => {
    if (Platform.OS === 'ios') {
      setZoom(zoom - 0.01 >= 0 ? zoom - 0.01 : 0);
    } else if (Platform.OS === 'android') {
      setZoom(zoom - 0.1 >= 0 ? zoom - 0.1 : 0);
    }
  };

  const handleZoomIn = () => {
    if (Platform.OS === 'ios') {
      setZoom(zoom + 0.01 <= 1 ? zoom + 0.01 : 1);
    } else if (Platform.OS === 'android') {
      setZoom(zoom + 0.1 <= 10 ? zoom + 0.1 : 10);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {hasPermission === null ? (
        <View />
      ) : hasPermission === false ? (
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
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
          <View style={styles.controlPanel}>
            <TouchableOpacity style={styles.iconButton} onPress={handleFlashMode}>
              {flashMode === ExpoCamera.Constants.FlashMode.off && <MaterialIcons name="flash-off" size={28} color="white" />}
              {flashMode === ExpoCamera.Constants.FlashMode.on && <MaterialIcons name="flash-on" size={28} color="white" />}
              {flashMode === ExpoCamera.Constants.FlashMode.auto && <MaterialIcons name="flash-auto" size={28} color="white" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <FontAwesome name="camera" size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleCameraType}>
              <MaterialIcons name="flip-camera-ios" size={28} color="white" />
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  iconButton: {
    padding: 15, // Increased padding for larger buttons
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 15,
  },
  captureButton: {
    padding: 20, // Increased padding for larger button
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: 'white',
    borderWidth: 2,
    marginHorizontal: 25,
  },
  zoomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  zoomButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 25,
    width: 45, // Increased width for larger button
    height: 45, // Increased height for larger button
    justifyContent: 'center', // Center content horizontally
    alignItems: 'center', // Center content vertically
    marginHorizontal: 20,
  },
  zoomText: {
    color: 'white',
    fontSize: 28, // Increased font size
    textAlign: 'center',
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 32,
  },
});

export default CameraScreen;
