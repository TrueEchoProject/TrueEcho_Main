import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const defaultImage = 'https://via.placeholder.com/1000';

const ImageDouble = ({ cameraData, setCameraData }) => {
  const swapImageIndices = () => {
    setCameraData((prevData) => ({
      front: {
        uris: prevData.back.uris,
        selectedIndex: prevData.back.selectedIndex,
      },
      back: {
        uris: prevData.front.uris,
        selectedIndex: 0,
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
    borderRadius: 20, // 모서리를 더 둥글게 설정
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallImageContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 120, // 너비를 줄임
    height: 160, // 높이를 늘려 직사각형 모양으로 변경
    zIndex: 1,
    borderRadius: 10, // 모서리를 더 둥글게 설정
    overflow: 'hidden', // 이미지가 둥근 모서리에 맞게 잘리도록 설정
  },
  smallImage: {
    width: '100%',
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    zIndex: 0,
    
    boarderWidth: 1,
    boarderColor: 'white',
  },
});

export default ImageDouble;
