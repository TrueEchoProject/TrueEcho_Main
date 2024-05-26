import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';

const LoadingScreen = () => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ]),
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ])
    ).start();
  }, [scaleValue, opacityValue]);

  return (
    <View style={styles.container}>
      <Animated.Image
        style={[
          styles.logo, 
          { transform: [{ scale: scaleValue }], opacity: opacityValue }
        ]}
        source={require('../assets/logo.png')}
        resizeMode="contain"
      />
      <Text style={styles.text}>반가워요!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 20,
  },
  text: {
    fontSize: 36,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
});

export default LoadingScreen;
