import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Camera as ExpoCamera } from 'expo-camera';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(ExpoCamera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(ExpoCamera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, skipProcessing: true };
      const data = await cameraRef.current.takePictureAsync(options);
      // 사진을 처리하는 로직을 추가예쩡
      console.log(data.uri);
    }
  };

  const handleCapture = async () => {
    await takePicture();
    setCameraType(
      cameraType === ExpoCamera.Constants.Type.back
        ? ExpoCamera.Constants.Type.front
        : ExpoCamera.Constants.Type.back
    );
    setTimeout(() => {
      takePicture();
    }, 1000);
  };

  const handleFlashMode = () => {
    setFlashMode(
      flashMode === ExpoCamera.Constants.FlashMode.off
        ? ExpoCamera.Constants.FlashMode.on
        : ExpoCamera.Constants.FlashMode.off
    );
  };

  const handleCameraType = () => {
    setCameraType(
      cameraType === ExpoCamera.Constants.Type.back
        ? ExpoCamera.Constants.Type.front
        : ExpoCamera.Constants.Type.back
    );
  };

  const handleZoomOut = () => {
    setZoom(zoom - 0.1 >= 0 ? zoom - 0.1 : 0);
  };

  const handleZoomIn = () => {
    setZoom(zoom + 0.1 <= 1 ? zoom + 0.1 : 1);
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <ExpoCamera
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        zoom={zoom}
        ref={cameraRef}
      />
      <View style={styles.zoomContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom(Math.max(0, zoom - 0.1))}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.zoomText}>{(zoom + 1).toFixed(1)}x</Text>
        <TouchableOpacity style={styles.zoomButton} onPress={() => setZoom(Math.min(1, zoom + 0.1))}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.controlPanel}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setFlashMode(flashMode === ExpoCamera.Constants.FlashMode.off ? ExpoCamera.Constants.FlashMode.on : ExpoCamera.Constants.FlashMode.off)}>
          <MaterialIcons name={flashMode === ExpoCamera.Constants.FlashMode.off ? 'flash-off' : 'flash-on'} size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <FontAwesome name="camera" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => setCameraType(cameraType === ExpoCamera.Constants.Type.back ? ExpoCamera.Constants.Type.front : ExpoCamera.Constants.Type.back)}>
          <MaterialIcons name="flip-camera-ios" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
  
});

export default CameraScreen;
