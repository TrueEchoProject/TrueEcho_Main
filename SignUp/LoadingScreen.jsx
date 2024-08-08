import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ZigzagGauge = ({ percentage }) => {
  const pathData = 'M10 60 L15 50 L30 10 L40 50 L50 80 L60 40 L70 10 L80 60 L90 80'; // 지그재그 경로
  const totalLength = 180; // 경로의 총 길이 (직접 측정하거나 계산 필요)
  const strokeDashoffset = totalLength - (totalLength * percentage) / 100;

  return (
    <Svg height="100" width="100" viewBox="0 0 100 100">
      <Path
        d={pathData}
        stroke="#e6e6e6"
        strokeWidth="5"
        fill="none"
      />
      <Path
        d={pathData}
        stroke="#3b5998"
        strokeWidth="5"
        fill="none"
        strokeDasharray={totalLength}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const LoadingScreen = () => {
  const [progress, setProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const percentage = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../assets/logo.png')}
        resizeMode="contain"
      />
      <Animated.View style={styles.zigzagContainer}>
        <ZigzagGauge percentage={percentage} />
      </Animated.View>
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
  zigzagContainer: {
    width: 200,
    height: 200,
  },
});

export default LoadingScreen;
