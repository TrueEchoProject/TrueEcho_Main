import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, PanResponder, Dimensions, Image, TouchableOpacity, ImageBackground, Pressable, StatusBar } from 'react-native';
import Api from '../../../Api'; // 경로를 필요에 따라 업데이트하십시오.
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';


const { width, height } = Dimensions.get('window');
const defaultImages = [
  require('../../../assets/logo.png'),
];
const backgroundImage = require('../../../assets/logoFont.png'); // 배경 이미지 경로를 필요에 따라 업데이트하십시오.

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
    <ImageBackground source={backgroundImage} style={styles.fullSizeBackground} resizeMode="cover">
      <View style={styles.container}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.startContainer, { transform: position.getTranslateTransform() }]}
        >
          <View style={{ height: hp(40) }}>
            <Text style={{ fontSize: hp(2.5), color: "#fff", textAlign: "center" }}>10개의 질문을 준비했어요!</Text>
            <Text style={styles.startText}>투표를 시작해볼까요?</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.goText}>슬라이드로</Text>
            <Text style={styles.goText}>투표 시작하기!</Text>

            <Animated.View style={[styles.goContainer, slideStyle]}>
              <AntDesign name="doubleright" size={56} color="#fff" style={styles.icon} />
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const Vote = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userData, setUserData] = useState([]);
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
      if (response.data.status === 202) {
        const uniqueUsers = response.data.data.userList.reduce((acc, user) => {
          if (!acc.some(u => u.id === user.id)) {
            acc.push(user);
          }
          return acc;
        }, []);
        setUserData(uniqueUsers.slice(0, 4)); // 중복 제거 후 4개의 유저만 설정
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
      if (response.data) {
        const FcmResponse = await Api.post(`/noti/sendToFCM`, {
          title: null,
          body: null,
          data: {
            userId: userId,
            notiType: 3,
            contentId: voteId
          }
        });
        console.log('FCM Response:', FcmResponse.data);
      }
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

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedImage(null);
    setSelectedUserId(null);
    setShowStartPage(true);
    fetchData(); // 데이터를 다시 불러옵니다.
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
        <Pressable style={styles.endButton} onPress={handleNavigateToRanking}>
          <Text style={styles.endButtonText}>랭킹 페이지로 이동</Text>
        </Pressable>
        <Pressable style={styles.endButton} onPress={handleRestart}>
          <Text style={styles.endButtonText}>더 많은 투표 하기</Text>
        </Pressable>
      </View>
    );
  }

  const currentItem = data[currentIndex];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black"}}>
      <ImageBackground source={backgroundImage} style={styles.fullSizeBackground} resizeMode="cover">
        <View style={styles.container}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[styles.itemContainer, { transform: position.getTranslateTransform() }]}
          >
            <View style={styles.scrollContainer}>
              <Text style={styles.title}>{currentItem.title}</Text>
              <View style={styles.imageContainer}>
                {!selectedImage && (
                  <View>
                    <Image source={defaultImage} style={styles.placeholderImage} resizeMode="contain" />
                  </View>
                )}
                {selectedImage && (selectedImage.front || selectedImage.back) && (
                  <TouchableOpacity onPress={toggleImage}>
                    <Image
                      source={{ uri: isFrontImage ? selectedImage.front : selectedImage.back }}
                      style={styles.selectedImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              </View>
              {userLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <View style={styles.bottomContainer}>
                  <View style={styles.userContainer}>
                    {userData && userData.slice(0, 4).map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        onPress={() => handleUserClick(user.id, user.photoFrontUrl, user.photoBackUrl)}
                      >
                        {selectedUserId === user.id ? (
                          <LinearGradient
                            colors={['#1BC5DA', '#263283']}
                            style={styles.selectedUserButton}
                          >
                            <Image source={{ uri: user.profileUrl }} style={styles.profileImage} resizeMode="contain" />
                            <Text style={styles.btnText}>{user.username}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.userButton}>
                            <Image source={{ uri: user.profileUrl }} style={styles.profileImage} resizeMode="contain" />
                            <Text>{user.username}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.refreshButtonContainer}>
                    <Pressable onPress={handleRefresh} style={styles.refreshButton}>
                      <AntDesign name="reload1" size={24} color="black" />
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: wp(100),
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'black',
  },
  itemContainer: {
    width: wp('100%'),
    padding: 10,
    backgroundColor: 'black',
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
    color: "#fff",
    alignItems: 'center',
    marginHorizontal: wp(4),
    marginVertical: hp(2),
  },
  imageContainer: {
    height: hp('45%'), // 크기를 키움
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  selectedImage: {
    width: wp('80%'), // 크기를 키움
    height: hp('45%'), // 크기를 키움
    aspectRatio: 1, // 이 속성을 추가하여 비율을 유지하면서 크기 조정
    resizeMode: 'contain',
    borderRadius: 20,
  },
  placeholderImage: {
    width: wp('80%'),
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: wp('4%'),
  },
  bottomContainer: {
    flexDirection: 'column', // 열 방향으로 정렬
    justifyContent: 'center', // 공간을 중앙에 배치
    alignItems: 'center',
    width: wp('100%'), // 전체 너비를 차지
    paddingHorizontal: wp('5%'), // 좌우에 여백 추가
    marginBottom: hp(2), // 아래 여백 추가
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userButton: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: 5,
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: wp('20%'),
    height: hp('15%'),
    justifyContent: 'center',
  },
  selectedUserButton: {
    flexDirection: 'column',
    alignItems: 'center',
    margin: 5,
    padding: 5,
    borderRadius: 5,
    width: wp('20%'),
    height: hp('15%'),
    justifyContent: 'center',
  },
  profileImage: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('7.5%'),
    marginBottom: 5,
  },
  btnText: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
  },
  refreshButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: hp('6%'),
    width: wp(13),
    borderRadius: 15,
    backgroundColor: "#fff",
    marginTop: hp(2),
  },
  endText: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    color: "#fff"
  },
  startContainer: {
    width: wp('100%'),
    height: hp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 20,
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
    color: '#fff',
  },
  goContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goText: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  icon: {
    transform: [{ translateX: 10 }],
    marginLeft: -30,
  },
  endButton: {
    width: wp(50),
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: hp(2),
    marginVertical: hp(2)
  },
  endButtonText: {
    fontWeight: "bold",
    textAlign: "center"
  },
  fullSizeBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});


export default Vote;
