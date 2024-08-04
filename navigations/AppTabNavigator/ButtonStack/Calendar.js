import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Modal,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import Api from "../../../Api";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";

const days = ["일", "월", "화", "수", "목", "금", "토"];
const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const Calendar = ({ navigation }) => {
  const [selectedPins, setSelectedPins] = useState([]); // 선택된 핀들의 정보를 저장할 상태
  const [serverSelectedPins, setServerSelectedPins] = useState([]); // 서버로부터 받아온 선택된 핀들의 정보를 저장할 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmit, setIsSubmit] = useState(false);
  const [specificDates, setSpecificDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [currentImageUrls, setCurrentImageUrls] = useState({
    front: null,
    back: null,
  });
  const defaultImage =
    "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";

  useEffect(() => {
    fetchCalendarAndPins();
  }, []);
  useEffect(() => {
    if (selectedPins) {
      console.log(selectedPins);
    }
  }, [selectedPins]); // userData 변화 감지
  useEffect(() => {
    console.log("specificDates is", specificDates);
  }, [specificDates]);
  useEffect(() => {
    console.log("serverSelectedPins is", serverSelectedPins);
  }, [serverSelectedPins]);

  const fetchCalendarAndPins = async () => {
    try {
      // Fetch monthly posts
      const calendarResponse = await Api.get(`/setting/monthlyPosts`);
      const calendarData = calendarResponse.data.data.monthlyPostList || [];
      // Process calendar data to keep the latest post for each date
      const latestPostsByDate = {};
      calendarData.forEach((item) => {
        const date = item.createdAt.split("T")[0];
        if (
          !latestPostsByDate[date] ||
          new Date(item.createdAt) > new Date(latestPostsByDate[date].createdAt)
        ) {
          latestPostsByDate[date] = item;
        }
      });
      const newSpecificDates = {};
      Object.keys(latestPostsByDate).forEach((date) => {
        const item = latestPostsByDate[date];
        newSpecificDates[date] = {
          front: item.postFrontUrl,
          back: item.postBackUrl,
          postId: item.postId,
        };
      });
      setSpecificDates(newSpecificDates);
      // Fetch selected pins
      const pinsResponse = await Api.get(`/setting/pins`);
      const selectedPinsData = pinsResponse.data?.data?.pinList || [];
      const newSelectedPins = selectedPinsData.map((pin) => ({
        pinId: pin.pinId,
        postId: pin.postId,
        date: pin.createdAt.split("T")[0], // 'T' 이후를 잘라서 저장
        frontUrl: pin.postFrontUrl ? pin.postFrontUrl : defaultImage,
        backUrl: pin.postBackUrl ? pin.postBackUrl : defaultImage,
        isFrontShowing: false, // 기본적으로 전면 이미지를 보여줌
      }));
      setSelectedPins(newSelectedPins);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching calendar data or selected pins", error);
    }
  };
  const postPins = async () => {
    if (isSubmit) return;
    setIsSubmit(true);

    if (selectedPins.length === 0) {
      alert("선택된 핀이 없습니다.");
      return;
    }
    const updatedPostIdList = selectedPins.map((pin) => pin.postId);
    const postData = { updatedPostIdList };
    console.log(postData);

    const pinData = {
      pins: selectedPins.map((pin, index) => ({
        pinId: index + 1,
        createdAt: pin.date,
        postFrontUrl: pin.frontUrl,
        postBackUrl: pin.backUrl,
      })),
    };
    try {
      const response = await Api.put(`/setting/pins`, postData);
      alert("핀 업데이트가 성공적으로 제출되었습니다.");
      if (response) {
        console.log(pinData);
        navigation.navigate("MyP", { pinRes: pinData }); // SendPost 페이지로 이동하면서 pinData를 전달
      }
    } catch (error) {
      console.error("Error posting pins", error);
      alert("핀을 제출하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmit(false);
    }
  };
  
  const generateMatrix = () => {
    let matrix = [days.map((day) => ({ day, isDayHeader: true }))]; // 요일 행에 isDayHeader 추가
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const maxDays = new Date(year, month + 1, 0).getDate();
    let counter = 1 - firstDay;
    
    for (let row = 1; row < 7; row++) {
      matrix[row] = [];
      for (let col = 0; col < 7; col++, counter++) {
        const day = counter > 0 && counter <= maxDays ? counter : "";
        const dateKey = `${year}-${month + 1 < 10 ? `0${month + 1}` : month + 1}-${day < 10 ? `0${day}` : day}`;
        matrix[row][col] = {
          day,
          isInCurrentMonth: day !== "",
          imageUrl: specificDates[dateKey]?.front,
          imageBackUrl: specificDates[dateKey]?.back,
          date: dateKey,
          pinId: specificDates[dateKey]?.pinId,
          postId: specificDates[dateKey]?.postId,
        };
      }
    }
    return matrix;
  };
  const renderCalendar = () => {
    const matrix = generateMatrix();
    return (
      <View style={styles.calendarContainer}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
          style={styles.gradientTop}
        />
        <View style={styles.calendar}>
          {matrix.map((row, rowIndex) => (
            <View style={styles.row} key={rowIndex}>
              {row.map((item, colIndex) =>
                item.imageUrl && rowIndex !== 0 ? (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.cell}
                    onPress={() =>
                      toggleImageVisibility(
                        item.imageUrl,
                        item.imageBackUrl,
                        item.date,
                        item.postId
                      )
                    }
                  >
                    <ImageBackground
                      source={{ uri: item.imageBackUrl }}
                      style={styles.backgroundImage}
                    >
                      <Text style={styles.dateImageText}>{item.day}</Text>
                    </ImageBackground>
                  </TouchableOpacity>
                ) : (
                  <View key={colIndex} style={styles.cell}>
                    <Text style={item.isDayHeader ? styles.dayHeaderText : styles.dateText}>{item.day}</Text>
                  </View>
                )
              )}
            </View>
          ))}
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.gradientBottom}
        />
      </View>
    );
  };

  
  const ImageModal = ({
    isVisible,
    postFront,
    postBack,
    onClose,
    onSelectPin,
  }) => {
    const [isFrontShowing, setIsFrontShowing] = useState(true);
    const changeImage = () => {
      setIsFrontShowing(!isFrontShowing);
    };

    return (
      <Modal
        animationType="slide"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#1BC5DA", "#263283"]}
            style={styles.imageContainer}
          >
            <View style={{position: "relative"}}>
              <TouchableOpacity onPress={changeImage} style={styles.frontImage}>
                <Image
                  source={{ uri: isFrontShowing ? postFront : postBack }}
                  style={styles.smallImage}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={changeImage} style={styles.backImage}>
                <Image
                  source={{ uri: isFrontShowing ? postBack : postFront }}
                  style={styles.fullImage}
                />
              </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <View style={styles.closeIcon} />
                </TouchableOpacity>
            </View>
          </LinearGradient>
          <TouchableOpacity onPress={onSelectPin}>
            <LinearGradient
              colors={["#1BC5DA", "#263283"]}
              style={styles.selectButton}
            >
              <Text style={styles.buttonText}>Pin 지정</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
  const toggleImageVisibility = (
    imageUrl,
    imageBackUrl,
    date,
    postId,
    pinId
  ) => {
    setCurrentImageUrls({
      front: imageUrl,
      back: imageBackUrl,
      date: date,
      pinId: pinId,
      postId: postId,
    });
    setIsImageVisible(!isImageVisible);
  };
  const handleSelectPin = () => {
    // 중복된 날짜의 핀이 있는지 확인
    if (selectedPins.some((pin) => pin.date === currentImageUrls.date)) {
      alert("이 날짜에 이미 핀이 지정되어 있습니다.");
      setIsImageVisible(false); // 모달 닫기
      return;
    }
    // 이미 3개의 핀이 선택되었는지 확인
    if (selectedPins.length >= 3) {
      alert("최대 3개의 핀을 선택할 수 있습니다.");
      setIsImageVisible(false); // 모달 닫기
      return;
    }
    // 새로운 핀 추가
    const newPin = {
      pinId: currentImageUrls.pinId,
      postId: currentImageUrls.postId,
      frontUrl: currentImageUrls.front,
      backUrl: currentImageUrls.back,
      date: currentImageUrls.date,
      isFrontShowing: false, // 초기 전면 이미지 상태 설정
    };
    setSelectedPins((prevPins) =>
      [...prevPins, newPin].sort((a, b) => new Date(a.date) - new Date(b.date))
    );
    setIsImageVisible(false);
  };
  const togglePinImage = (index) => {
    const updatedPins = [...selectedPins];
    updatedPins[index].isFrontShowing = !updatedPins[index].isFrontShowing;
    setSelectedPins(updatedPins);
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();
    return `${month}-${day}`;
  };

  const SelectedPinsList = () => {
    const maxSlots = 3;
    const emptySlots = maxSlots - selectedPins.length;
    const allSlots = [...selectedPins];
    // 빈 칸을 채워넣기
    for (let i = 0; i < emptySlots; i++) {
      allSlots.push({ empty: true });
    }

    return (
      <View style={styles.selectedPinsContainer}>
        {allSlots.map((pin, index) =>
          pin.empty ? (
            <View key={index} style={styles.selectedPinContainer}>
              <Text style={styles.emptyText}>핀을</Text>
              <Text style={styles.emptyText}>추가해주세요</Text>
            </View>
          ) : (
            <View key={index} style={styles.selectedPinContainer}>
              <View style={styles.selectedImageContainer}>
                <TouchableOpacity onPress={() => togglePinImage(index)}>
                  <Image
                    source={{
                      uri: pin.isFrontShowing ? pin.frontUrl : pin.backUrl,
                    }}
                    style={styles.selectedImage}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.pinInfoContainer}>
                <Text style={styles.pinDateText}>{formatDate(pin.date)}</Text>
                <TouchableOpacity
                  onPress={() => removePin(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        )}
      </View>
    );
  };
  const removePin = (index) => {
    setSelectedPins((prevPins) => prevPins.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthLabel}>
          {currentMonth.getFullYear()}년 {months[currentMonth.getMonth()]}월
        </Text>
      </View>
      <View style={styles.calendarContainer}>
        {renderCalendar()}
      </View>
      {isImageVisible && (
        <ImageModal
          isVisible={isImageVisible}
          postFront={currentImageUrls.front}
          postBack={currentImageUrls.back}
          onClose={() => setIsImageVisible(false)}
          onSelectPin={handleSelectPin}
        />
      )}
      <SelectedPinsList />
      <TouchableOpacity
        style={styles.submitButtonContainer}
        onPress={postPins}
      >
        <LinearGradient
          colors={["#1BC5DA", "#263283"]}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>수정 제출</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:"black"
  },

  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    height: hp("7%"),
    paddingLeft: wp("4%"),
    justifyContent: "center",
  },
    monthLabel: {
    fontSize: hp("3%"),
    fontWeight: "bold",
    color: "#fff", // 변경: 월 표시 흰색
  },
  
  calendarContainer: {
    height: hp("40%"),
    width: wp("100%"),
    alignItems: "center",
    position: "relative", // 추가: 자식 요소의 절대 위치를 위한 상대 위치
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 70, // 그라디언트 높이 조절
    zIndex: 1,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, // 그라디언트 높이 조절
    zIndex: 1,
  },
  calendar: {
    height: "100%",
    width: "85%",
    justifyContent: "center",
    zIndex: 0,
  },
    row: {
      flexDirection: "row",
    },
    cell: {
      flex: 1,
      height: hp("5.2%"),
      justifyContent: "center",
      alignItems: "center",
      borderColor: "black", // 변경: 셀 경계 흰색
      borderWidth: 0.5,
      backgroundColor: "#fff",
    },
    backgroundImage: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    dayHeaderText: {
      color: "#292929",
      fontWeight: "bold", // 두껍게 설정
    },
    dateText: {
      color: "#292929",
    },
    dateImageText: {
      color: "white",
      fontWeight: "bold",
    },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
    imageContainer: {
      width: wp("83%"),
      height: hp("62%"),
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
      fullImage: {
        width: wp("80%"),
        height: hp("60%"),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "white",
      },
      backImage: {
        zIndex: 1,
        position: "relative",
      },
      smallImage: {
        width: wp("30%"),
        height: hp("20%"),
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "white",
      },
      frontImage: {
        zIndex: 2,
        position: "absolute",
        top: 10,
        left: 10,
      },
      closeButton: {
        zIndex: 2,
        position: "absolute",
        top: 15,
        right: 15,
        width: 40,
        height: 40,
        borderRadius: 50,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
      },
      closeIcon: {
        width: 20,
        height: 5,
        backgroundColor: "black",
      },

    selectButton: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      borderRadius: 10,
      
      marginTop: hp("1.5%"),
      width: wp("83%"),
      height: hp("5%"),
    },
    buttonText: {
      color: "black",
      fontSize: hp("2%"),
      fontWeight: "bold",
    },
  
  selectedPinsContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // 핀을 가로로 정렬
    marginHorizontal: wp("3%"), // 핀 슬롯을 좌우로 이동
    marginVertical: hp("1.75%"), // 핀 슬롯을 위로 올리기 위해 마진 조정
  },
    selectedPinContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white", // 배경색 변경
      borderRadius: 10, // 모서리 둥글게
      width: wp("28%"), // 각 핀의 너비 설정
      height: hp("21%"), // 핀 슬롯 높이 조정
    },
    selectedImageContainer: {
      width: "90%",
      height: "75%",
      paddingBottom: hp("0.5%"),
    },
      selectedImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10, // 이미지 모서리 둥글게
      },
    pinInfoContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      width: "90%",
    },
      pinDateText: {
        fontSize: hp("1.5%"),
        color: "#333",
        fontWeight: "bold",
        marginRight: wp("2%"),
      },
      removeButton: {
        backgroundColor: "black",
        padding: hp("1%"),
        borderRadius: 5,
      },
      removeButtonText: {
        color: "white",
        fontSize: hp("1.5%"),
        textAlign: "center",
      },
  emptyText: {
    fontSize: hp(1.5),
    color: "black",
    fontWeight: "bold",
  },
  
  submitButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: hp('2%'),
  },
    submitButton: {
      padding: hp("2%"),
      borderRadius: 10,
      width: wp("90%"), // 버튼을 가로로 길게
      alignItems: "center",
      marginTop: hp(0.5),
      alignSelf: "center",
    },
    submitButtonText: {
      color: "white",
      fontSize: hp("2%"),
      textAlign: "center",
      fontWeight: "900",
    },
});

export default Calendar;
