import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { Button3 } from "../../../components/Button";
import Api from "../../../Api";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from 'react-native-reanimated-carousel';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

const ITEM_WIDTH = wp(100);
const ITEM_HEIGHT = hp(57);

const MyPage = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [serverData, setServerData] = useState({}); // 서버로부터 받아온 데이터를 저장할 상태
  const [pinData, setPinData] = useState([]);
  const [isFrontShowing, setIsFrontShowing] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pagerRef = useRef(null);
  const defaultImage =
    "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
  
  useEffect(() => {
    if (route.params?.Update) {
      fetchDataFromServer();
    }
  }, [route.params?.Update]);
  useEffect(() => {
    if (route.params?.pinRes) {
      console.log("Received pinRes response:", route.params.pinRes);
      const pins = route.params.pinRes.pins;
      setPinData(pins);
      // 각 핀에 대한 isFrontShowing 상태 초기화
      const showingStates = {};
      pins.forEach((pin) => {
        showingStates[pin.pin_id] = true; // 기본적으로 모든 핀은 앞면을 보여줍니다.
      });
      setIsFrontShowing(showingStates);
    }
  }, [route.params?.pinRes]);
  useEffect(() => {
    if (pinData.length > 0 && pagerRef.current) {
      pagerRef.current.setPageWithoutAnimation(0);
    }
  }, [pinData]);
  useEffect(() => {
    fetchDataFromServer();
  }, []);
  
  const fetchDataFromServer = async () => {
    try {
      const response = await Api.get("/setting/myPage"); // 문자열로 수정
      setServerData(response.data.data); // Correctly update the state here
      const pinResponse = await Api.get("/setting/pins"); // 문자열로 수정
      if (pinResponse.data.message === "핀 조회를 실패했습니다.") {
        setPinData([]); // 핀 데이터가 없을 경우 빈 배열로 초기화
        setIsLoading(false);
        return;
      }
      setPinData(pinResponse.data.data.pinList); // Correctly update the state here
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  
  const profileImageModalVisible = () => {
    setIsModalVisible(!isModalVisible);
  };
  const ProfileImageModal = ({ isVisible, imageUrl, onClose }) => {
    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <TouchableOpacity style={styles.profileModalContainer} onPress={onClose}>
          <LinearGradient
            colors={["#1BC5DA", "#263283"]}
            style={styles.profileModalImageContainer}
          >
            <Image
              source={{ uri: imageUrl }} // 수정: imageUrl을 사용
              style={styles.profileModalImage}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Modal>
    );
  };
  
  const renderItem = ({ item, animationValue }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animationValue.value,
        [-1, 0, 1],
        [0.8, 1, 0.8]
      );
      
      return {
        transform: [{ scale }],
      };
    });
    
    return (
      <Animated.View style={[styles.pinSlide, animatedStyle]}>
        <TouchableOpacity
          style={styles.pinContainer}
          onPress={() => changeImage(item.pinId)}
        >
          <Image
            source={{
              uri: isFrontShowing[item.pinId]
                ? item.postFrontUrl
                : item.postBackUrl,
            }}
            style={styles.pinImage}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  const changeImage = (pinId) => {
    setIsFrontShowing((prev) => ({
      ...prev,
      [pinId]: !prev[pinId],
    }));
  };
  
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View>
        <View style={styles.userContainer}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={profileImageModalVisible}>
              <LinearGradient
                colors={["#1BC5DA", "#263283"]}
                style={styles.avatarGradient}
              >
                <Image
                  source={{
                    uri: serverData.profileUrl
                      ? serverData.profileUrl
                      : defaultImage,
                  }}
                  style={styles.avatar}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {isModalVisible && (
            <ProfileImageModal
              isVisible={isModalVisible}
              imageUrl={serverData.profileUrl ? serverData.profileUrl : defaultImage}
              onClose={() => setIsModalVisible(false)}
            />
          )}
          <View style={styles.userTextContainer}>
            <View style={styles.nameAndOptionsContainer}>
              <View style={styles.nameTextContainer}>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">{serverData.username}</Text>
              </View>
              <Button3 onPress={() => navigation.navigate("MyOp")}/>
            </View>
            <View style={styles.desTextContainer}>
              <Text style={styles.desText}>
                {serverData.mostVotedTitle
                  ? serverData.mostVotedTitle
                  : "투표를 진행해주세요!"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.pinsContainer}>
        <View style={styles.pinsTitleContainer}>
          <Text style={styles.pinsTitle}>Pins</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <LinearGradient
              colors={["#1BC5DA", "#263283"]}
              style={styles.pinsPlusContainer}
            >
              <View style={styles.pinsPlusHorizontal}/>
              <View style={styles.pinsPlusVertical}/>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.pinsCardContainer}>
          {pinData.length === 0 ? (
            <View style={styles.pinsNoneContainer}>
              <TouchableOpacity
                style={{alignItems: "center", padding: 30 }}
                onPress={() => navigation.navigate("Calendar")}
              >
                <LinearGradient
                  colors={["#1BC5DA", "#263283"]}
                  style={styles.pinsNonePlusContainer}
                >
                  <View style={styles.pinsNonePlusHorizontal}/>
                  <View style={styles.pinsNonePlusVertical}/>
                </LinearGradient>
                <Text style={[styles.pinsNoneText, { textAlign: "center" }]}>
                  핀을{"\n"}추가해보세요!
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Carousel
              width={ITEM_WIDTH}
              height={ITEM_HEIGHT}
              data={pinData}
              renderItem={renderItem}
              mode="parallax"
              style={{ alignSelf: 'center' }} // 캐러셀 자체를 가운데 정렬
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOpacity: 0.6,
                parallaxAdjacentItemScale: 1,
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  
  userContainer: {
    height: hp(22),
    width: wp(90),
    marginHorizontal: wp(5),
    
    flexDirection: "row",
    alignItems: "flex-end",
  },
  avatarContainer: {
    width: wp(40),
    height: hp(20),
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGradient: {
    width: hp(18.5),
    height: hp(18.5),
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: hp(17),
    height: hp(17),
    borderRadius: 100,
    borderColor: "white",
    borderWidth: 3,
  },
  userTextContainer: {
    width: wp(47),
    height: hp(12),
    marginLeft: wp(3),
    marginBottom: hp(2),
  },
  nameAndOptionsContainer: {
    height: hp(5),
    marginHorizontal: wp(2),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "white",
  },
  nameTextContainer: {
    width: wp(36.5),
    justifyContent: "center",
  },
  desTextContainer: {
    width: wp(43),
    marginHorizontal: wp(2),
    paddingVertical: hp(1),
  },
  nameText: {
    fontSize: wp(5.7),
    fontWeight: "900",
    color: "#fff",
  },
  desText: {
    fontSize: wp(3.2),
    color: "#fff",
  },
  
  profileModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileModalImageContainer: {
    width: wp(87),
    height: wp(87),
    borderRadius: wp(100),
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  profileModalImage: {
    width: "95%",
    height: "95%",
    borderRadius: wp(100),
    borderWidth: 4,
    borderColor: "white",
  },
  
  pinsContainer: {
    height: hp(75),
    alignItems: "center",
  },
  pinsTitleContainer: {
    height: hp(3.4),
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    
  },
  pinsTitle: {
    fontSize: hp(2.9),
    fontWeight: "bold",
    color: "white",
  },
  pinsPlusContainer: {
    position: "relative",
    height: hp(3),
    width: hp(3),
    borderRadius: hp(3),
    marginLeft: hp(1),
    alignItems: "center",
    justifyContent: "center",
  },
  pinsPlusHorizontal: {
    position: "absolute",
    height: hp(1.5),
    width: hp(0.3),
    backgroundColor: "black",
  },
  pinsPlusVertical: {
    position: "absolute",
    width: hp(1.5),
    height: hp(0.3),
    backgroundColor: "black",
  },
  
  pinsCardContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pinSlide: {
    width: "100%",
    height: "95%",
    alignItems: "center",
    justifyContent: "center",

  },
  pinContainer: {
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center",
    
  },
  pinImage: {
    width: '70%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  
  pinsNoneContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    backgroundColor: "rgba(128, 128, 128, 0.6)", // grey with 50% transparency
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  pinsNonePlusContainer: {
    position: "relative",
    height: 50,
    width: 50,
    borderRadius: 25,
    marginBottom: "5%",
    alignItems: "center",
    justifyContent: "center",
  },
  pinsNonePlusHorizontal: {
    position: "absolute",
    width: 25,
    height: 5,
    backgroundColor: "black",
  },
  pinsNonePlusVertical: {
    position: "absolute",
    width: 5,
    height: 25,
    backgroundColor: "black",
  },
  pinsNoneText: {
    fontSize: 30,
    fontWeight: "900",
    color: "black",
  },
});
export default MyPage;

