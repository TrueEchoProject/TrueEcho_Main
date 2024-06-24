import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const defaultImage = 'https://via.placeholder.com/1000'; // 기본 이미지 URI

const ImageDouble = ({ cameraData, setCameraData }) => {
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
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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

export default ImageDouble;
