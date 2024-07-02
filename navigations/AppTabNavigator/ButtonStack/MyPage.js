import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import PagerView from "react-native-pager-view";
import { Image as ExpoImage } from "expo-image"; // expo-image 패키지 import
import { Button3 } from "../../../components/Button";
import Api from "../../../Api";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MyPage = ({ navigation, route }) => {
  const [serverData, setServerData] = useState({}); // 서버로부터 받아온 데이터를 저장할 상태
  const [userData, setUserData] = useState({});
  const [pinData, setPinData] = useState([]);
  const [isFrontShowing, setIsFrontShowing] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
    if (pinData) {
      console.log("pinData updated:", pinData);
    }
    if (pinData.length > 0 && pagerRef.current) {
      pagerRef.current.setPageWithoutAnimation(0);
    }
  }, [pinData]);
  useEffect(() => {
    if (serverData) {
      console.log("serverData updated:", serverData);
    }
  }, [serverData]); // serverData 변화 감지
  useEffect(() => {
    fetchDataFromServer();
  }, []);

  const fetchDataFromServer = async () => {
    try {
      const response = await Api.get(`/setting/myPage`);
      setServerData(response.data.data); // Correctly update the state here
      const pinResponse = await Api.get(`/setting/pins`);
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

  const changeImage = (pinId) => {
    setIsFrontShowing((prev) => ({
      ...prev,
      [pinId]: !prev[pinId],
    }));
  };
  const profileImageModalVisible = () => {
    setIsModalVisible(!isModalVisible);
  };
  const handlePageChange = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const ProfileImageModal = ({ isVisible, imageUrl, onClose }) => {
    // 수정: 프로퍼티 이름 Image -> imageUrl 변경
    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <TouchableOpacity style={styles.modalContainer} onPress={onClose}>
          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri: imageUrl }} // 수정: imageUrl을 사용
              style={styles.modalImage}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
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
      <View style={styles.topContainer}>
        <View style={styles.userContainer}>
          <TouchableOpacity onPress={profileImageModalVisible}>
            <Image
              source={{
                uri: serverData.profileUrl
                  ? serverData.profileUrl
                  : defaultImage,
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          {isModalVisible && (
            <ProfileImageModal
              isVisible={isModalVisible}
              imageUrl={
                serverData.profileUrl ? serverData.profileUrl : defaultImage
              } // 수정: imageUrl 프로퍼티 전달
              onClose={() => setIsModalVisible(false)}
            />
          )}
          <View style={{ justifyContent: "flex-end" }}>
            <View style={styles.nameTextContainer}>
              <Text style={styles.name}>{serverData.username}</Text>
              <Button3 onPress={() => navigation.navigate("MyOp")} />
            </View>
            <View style={styles.desTextContainer}>
              <Text style={{ color: "#fff" }}>
                {serverData.mostVotedTitle
                  ? serverData.mostVotedTitle
                  : "투표를 진행해주세요!"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.pinsContainer}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.pinsTitle}>Pins</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <AntDesign name="pluscircle" size={24} color="#fff" style={{marginHorizontal: hp(1)}}/>
          </TouchableOpacity>
        </View>
        {pinData.length === 0 ? (
          <View style={styles.pinPlus}>
            <TouchableOpacity
              style={{ alignItems: "center", padding: 30 }}
              onPress={() => navigation.navigate("Calendar")}
            >
              <AntDesign
                name="plussquareo"
                size={40}
                style={{ margin: 20 }}
                color="#fff"
              />
              <Text style={[styles.pinsText, { textAlign: "center" }]}>
                핀을{"\n"}추가해보세요!
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <PagerView
              style={styles.pagerView}
              initialPage={0}
              onPageSelected={handlePageChange}
              ref={pagerRef}
            >
              {pinData.map((item) => (
                <View key={item.pinId} style={{ position: "relative" }}>
                  <TouchableOpacity onPress={() => changeImage(item.pinId)}>
                    <Image
                      source={{
                        uri: isFrontShowing[item.pinId]
                          ? item.postFrontUrl
                          : item.postBackUrl,
                      }}
                      style={styles.pageStyle}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </PagerView>
            <View style={styles.indicatorContainer}>
              {pinData.map((item, index) => (
                <Text
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentPage ? styles.activeIndicator : null,
                  ]}
                >
                  &#9679;
                </Text>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: 400,
    width: "100%",
    backgroundColor: "yellow",
  },
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    backgroundColor: "black",
    padding: hp(2),
  },
  userContainer: {
    flexDirection: "row",
    // height: hp(25),
    borderWidth: 1,
    // borderColor: "#fff",
    marginBottom: hp(1),
  },
  nameTextContainer: {
    width: wp(50),
    borderWidth: 2,
    // borderColor:"#fff",
    borderBottomColor: "#aaa",
    marginLeft: wp(4),
    paddingVertical: hp(1),
    flexDirection: "row",
    alignItems: "flex-end",
  },
  desTextContainer: {
    width: wp(50),
    borderWidth: 1,
    // borderColor:"#fff",
    marginLeft: wp(4),
    paddingVertical: hp(1),
  },
  pinsContainer: {
    height: hp(55),
    borderWidth: 1,
    // borderColor: "#fff",
    alignItems: "center",
  },
  pinsTitle: {
    fontSize: hp(3),
    fontWeight: "bold",
    color: "white",
  },
  pinsText: {
    fontSize: hp(3),
    fontWeight: "300",
    color: "white",
  },
  pagerView: {
    flex: 1,
  },
  pageStyle: {
    marginTop: 10,
    width: "100%",
    height: "97%",
    borderRadius: 10,
  },
  pinPlus: {
    marginTop: hp(1),
    // width: "100%",
    height: "90%",
    borderRadius: 25,
    backgroundColor: "rgba(128, 128, 128, 0.6)", // grey with 50% transparency
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  avatar: {
    width: wp(35),
    height: hp(20),
    borderRadius: 100,
    borderColor: "#1CC4D9",
    borderWidth: 5,
  },
  name: {
    fontSize: 30,
    fontWeight: "300",
    color: "#fff",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  indicator: {
    margin: 3,
    color: "grey",
  },
  activeIndicator: {
    color: "blue",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImageContainer: {
    width: wp(80),
    height: wp(80),
    borderRadius: wp(100),
    borderWidth: 5,
    borderColor: "#1DBED6",
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  buttonText: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
  },
  imageContainer: {
    width: windowWidth * 0.8,
    height: windowHeight * 0.6,
    borderRadius: 12,
    backgroundColor: "white",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default MyPage;
