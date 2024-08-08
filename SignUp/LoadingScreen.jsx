import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const frames = [
  require('../assets/loadingFrame/frame1.png'),
  require('../assets/loadingFrame/frame2.png'),
  require('../assets/loadingFrame/frame3.png'),
  require('../assets/loadingFrame/frame4.png'),
  require('../assets/loadingFrame/frame5.png'),
  require('../assets/loadingFrame/frame6.png'),
  require('../assets/loadingFrame/frame7.png'),
  require('../assets/loadingFrame/frame8.png'),
  require('../assets/loadingFrame/frame9.png'),
  require('../assets/loadingFrame/frame10.png'),
  require('../assets/loadingFrame/frame11.png'),
  require('../assets/loadingFrame/frame12.png'),
];

const LoadingScreen = ({ onFinish }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex === frames.length) {
          clearInterval(interval);
          setTimeout(onFinish, 200); // 마지막 프레임이 끝난 후 onFinish 콜백 호출
          return prevIndex;
        }
        return nextIndex;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../assets/loadingLogo.png')}
        resizeMode="contain"
      />
      <View style={styles.animationContainer}>
        {frames.map((frame, index) => (
          <Image
            key={index}
            style={[
              styles.image,
              {
                opacity: index === currentFrameIndex ? 1 : 0,
                position: 'absolute',
              },
            ]}
            source={frame}
            resizeMode="contain"
          />
        ))}
      </View>
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
    width: wp('100%'), // 로고 너비를 화면 너비의 70%로 설정
    height: hp('40%'), // 로고 높이를 화면 높이의 25%로 설정
    marginBottom: hp('2%'), // 로고와 애니메이션 사이의 간격을 화면 높이의 2%로 설정
  },
  animationContainer: {
    width: wp('40%'), // 로딩 애니메이션 컨테이너 너비를 화면 너비의 30%로 설정
    height: wp('40%'), // 로딩 애니메이션 컨테이너 높이를 화면 너비의 30%로 설정 (비율 유지)
    justifyContent: 'center', // 애니메이션 컨테이너 중앙 정렬
    alignItems: 'center', // 애니메이션 컨테이너 중앙 정렬
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default LoadingScreen;
