import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, PanResponder, Dimensions, Image, TouchableOpacity, Button, ImageBackground } from 'react-native';
import Api from '../../../Api'; // 경로를 필요에 따라 업데이트하십시오.
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';


const { width, height } = Dimensions.get('window');
const defaultImages = [
  require('../../../assets/emoji.png'),
  require('../../../assets/fire.png'),
  require('../../../assets/amazing.png'),
  require('../../../assets/funny.png'),
  require('../../../assets/vr.png'),
  require('../../../assets/heart.png'),
  // 필요한 만큼 이미지를 추가하세요
];
const backgroundImage = require('../../../assets/splash.png'); // 배경 이미지 경로를 필요에 따라 업데이트하십시오.

const getRandomDefaultImage = () => {
  const randomIndex = Math.floor(Math.random() * defaultImages.length);
  return defaultImages[randomIndex];
};

const StartPage = ({ onStart }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20], // 이동 범위를 설정
  });

  const slideStyle = {
    transform: [
      {
        translateX: slideInterpolate,
      },
    ],
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: position.x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, { dx }) => {
      if (dx < -50) {
        onStart();
      } else {
        resetPosition();
      }
    },
  });

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.startContainer, { transform: position.getTranslateTransform() }]}
        >
          <Text style={styles.startText}>슬라이드하여 투표를 시작하세요!</Text>
          <Animated.View style={[styles.goContainer, slideStyle]}>
            <Text style={styles.goText}>GO</Text>
            <AntDesign name="doubleright" size={56} color="#333" style={styles.icon} />
          </Animated.View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const Vote = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFrontImage, setIsFrontImage] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showStartPage, setShowStartPage] = useState(true);
  const position = useRef(new Animated.ValueXY()).current;
  const navigation = useNavigation();
  const [defaultImage, setDefaultImage] = useState();


  useEffect(() => {
    if (!showStartPage) {
      fetchData();
    }
  }, [showStartPage]);

  useEffect(() => {
    if (data.length > 0) {
      fetchUserData();
    }
  }, [data, currentIndex]);

  useEffect(() => {
    setDefaultImage(getRandomDefaultImage());
  }, [currentIndex]); // 페이지가 바뀔 때마다 랜덤 이미지 설정

  const fetchData = async () => {
    try {
      const response = await Api.get('/vote/read/content');
      if (response.data.status === 202) {
        setData(response.data.data.contentList);
      } else {
        console.error('Failed to fetch data: ', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    setUserLoading(true);
    try {
      const response = await Api.get('/vote/read/users?userCount=4');
      console.log('Full response:', response.data); // 전체 응답 로그 추가
      if (response.data.status === 202) {
        console.log('Fetched user data:', response.data.data.userList); // 콘솔 로그 추가
        setUserData(response.data.data.userList);
      } else {
        console.error('Failed to fetch user data: ', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching user data: ', error);
    } finally {
      setUserLoading(false);
    }
  };
  

  const sendVoteResult = async (userId, voteId) => {
    try {
      const response = await Api.post('/vote/result', {
        userId: userId,
        voteId: voteId
      });
      console.log('Vote result sent successfully:', { userId, voteId });
    } catch (error) {
      console.error('Error sending vote result: ', error);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: position.x }], { useNativeDriver: false }),
    onPanResponderRelease: (_, { dx }) => {
      if (dx < -50 && selectedUserId !== null) {
        sendVoteResult(selectedUserId, data[currentIndex].id); // 투표 결과 전송
        handleNext();
      } else {
        resetPosition();
      }
    },
  });

  const handleNext = () => {
    if (currentIndex < data.length) {
      Animated.spring(position, {
        toValue: { x: -wp('100%'), y: 0 },
        useNativeDriver: false,
      }).start(() => {
        position.setValue({ x: wp('100%'), y: 0 });
        setSelectedImage(null); // 선택한 이미지를 초기화
        setSelectedUserId(null); // 선택한 사용자 초기화
        setCurrentIndex((prevIndex) => prevIndex + 1);
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      });
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const handleUserClick = (userId, frontImageUrl, backImageUrl) => {
    setSelectedUserId(userId);
    setSelectedImage({ front: frontImageUrl, back: backImageUrl });
    setIsFrontImage(true);
  };

  const toggleImage = () => {
    if (selectedImage?.front && selectedImage?.back) {
      setIsFrontImage((prev) => !prev);
    }
  };

  const handleRefresh = () => {
    setSelectedImage(null); // 선택된 이미지를 초기화
    setSelectedUserId(null); // 선택된 사용자 초기화
    fetchUserData();
  };

  const handleNavigateToRanking = () => {
    navigation.navigate('Result');
  };

  const handleStart = () => {
    setShowStartPage(false);
  };

  if (showStartPage) {
    return <StartPage onStart={handleStart} />;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (currentIndex >= data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.endText}>투표가 끝났습니다. 감사합니다!</Text>
        <Button title="랭킹 페이지로 이동" onPress={handleNavigateToRanking} />
      </View>
    );
  }

  const currentItem = data[currentIndex];

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.itemContainer, { transform: position.getTranslateTransform() }]}
        >
          <View style={styles.scrollContainer}>
            <Text style={styles.title}>{currentItem.title}</Text>
            <View style={styles.imageContainer}>
              {!selectedImage && (
                <View style={styles.placeholderImage}>
                  <Image source={defaultImage} style={styles.selectedImage} />
                </View>
              )}
              {selectedImage && (selectedImage.front || selectedImage.back) && (
                <TouchableOpacity onPress={toggleImage}>
                  <Image
                    source={{ uri: isFrontImage ? selectedImage.front : selectedImage.back }}
                    style={styles.selectedImage}
                  />
                </TouchableOpacity>
              )}
            </View>
            {userLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <View style={styles.userContainer}>
                {userData && userData.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.userButton,
                      selectedUserId === user.id && styles.selectedUserButton
                    ]}
                    onPress={() => handleUserClick(user.id, user.photoFrontUrl, user.photoBackUrl)}
                  >
                    <Image source={{ uri: user.profileUrl }} style={styles.profileImage} />
                    <Text>{user.username}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.refreshButtonContainer}>
            <Button title="유저 새로고침" onPress={handleRefresh} />
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );

};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  itemContainer: {
    width: wp('90%'),
    padding: 10,
    borderWidth: 4,
    borderColor: '#525E7D',
    backgroundColor: '#fff',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    height: hp('8%'),
    // marginBottom: 5,
    alignItems: 'center',
  },
  imageContainer: {
    height: hp('38%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedImage: {
    width: wp('80%'),
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderImage: {
    width: wp('80%'),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ddd',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: wp('4%'),
  },
  userContainer: {
    height: hp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  userButton: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: 5,
    padding: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
    width: wp('35%'), // 2*2 그리드를 위해 버튼 너비 조정
    height: wp('20%'),
    justifyContent: 'center',
  },
  selectedUserButton: {
    backgroundColor: '#7C86A0',
  },
  profileImage: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('7.5%'),

  },
  refreshButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('6.5%'),
  },
  endText: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  startContainer: {
    width: wp('90%'),
    height: hp('50%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000', // 그림자 추가
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  startText: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  goContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goText: {
    fontSize: wp('12%'),
    fontWeight: 'bold',
    color: '#333',
  },
  icon: {
    transform: [{ translateX: 10 }],
  },
});

export default Vote;
