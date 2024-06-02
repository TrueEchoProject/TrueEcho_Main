import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Camera as ExpoCamera } from 'expo-camera/legacy';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const CameraScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(ExpoCamera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(ExpoCamera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [timer, setTimer] = useState(180); // 타이머 초기화
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
      setTimer(180);
      
      return () => setIsFocused(false);
    }, [])
  );
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => {
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
  
  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
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
      
      navigation.navigate("SendPosts", { frontCameraUris, backCameraUris, remainingTime: timer });
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
    fontSize: 18,
  },
});

export default CameraScreen;