import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../assets/logo.png')}
        resizeMode="contain"
      />
      <LottieView
        source={require('../assets/loading.json')} // 올바른 경로를 사용하세요
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  lottie: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;

