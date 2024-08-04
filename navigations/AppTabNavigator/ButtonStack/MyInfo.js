import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import Api from "../../../Api";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import GetLocation from "../../../SignUp/GetLocation";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const MyInfo = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [serverUserLocation, setServerUserLocation] = useState("");
  const [username, setUsername] = useState("");
  const [editableUserId, setEditableUserId] = useState("");
  const [initialUserId, setInitialUserId] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [warning, setWarning] = useState("");
  const [isLocVisible, setIsLocVisible] = useState(false);
  const [showDuplicateButton, setShowDuplicateButton] = useState(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [tempLatitude, setTempLatitude] = useState(null); // 임시 위도
  const [tempLongitude, setTempLongitude] = useState(null); // 임시 경도
  const [loading, setLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isRequestPending, setIsRequestPending] = useState(false); // 요청 상태 관리

  const defaultImage =
    "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
  
  useEffect(() => {
    fetchServerData();
  }, []);
  
  const fetchServerData = async () => {
    try {
      const response = await Api.get(`/setting/myInfo`);
      const data = response.data.data;
      setUsername(data.username);
      setInitialUserId(data.nickname);
      setEditableUserId(data.nickname);
      setImageUri(data.profileUrl ? data.profileUrl : defaultImage);
      setServerUserLocation(data.yourLocation);
      setLatitude(data.y);
      setLongitude(data.x);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  
  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }
    }
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });
      if (!result.canceled) {
        // 변경된 부분: result.cancelled -> result.canceled
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri, // 변경된 부분: result.uri -> result.assets[0].uri
          [{ resize: { width: 800 } }], // 이미지 크기 조정
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        setImageUri(manipResult.uri);
      }
    } catch (error) {
      console.error("ImagePicker Error: ", error);
    }
  };
  const PofileInitialization = () => {
    setImageUri(defaultImage);
  };
  
  const handleUserIdChange = (text) => {
    setEditableUserId(text);
  };
  useEffect(() => {
    setShowDuplicateButton(editableUserId !== initialUserId);
    setIsDuplicateChecked(editableUserId === initialUserId);
  }, [editableUserId, initialUserId]);
  const duplicateCheck = async () => {
    if (isRequestPending) return; // 요청 중일 때 함수 실행 막기
    setIsRequestPending(true); // 요청 상태 시작
    
    if (editableUserId === "") {
      Alert.alert("알림", "이름을 입력해주세요!");
      setEditableUserId(initialUserId);
      setIsRequestPending(false); // 요청 상태 종료
      return;
    }
    console.log("Checking user ID:", editableUserId);
    try {
      const response = await Api.get(
        `/accounts/nickname/duplication?nickname=${editableUserId}`
      );
      console.log("Response data:", response.data);
      if (response.data.message === "중복된 계정입니다.") {
        alert("이미 사용 중인 아이디입니다.");
        setWarning("이미 사용 중인 아이디입니다.");
      } else {
        alert("사용 가능한 아이디입니다.");
        setWarning("사용 가능한 아이디입니다.");
      }
      setIsDuplicateChecked(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsRequestPending(false); // 요청 상태 종료
    }
  };
  
  const handleLocationReceived = (lat, lon) => {
    console.log("Received new location:", { lat, lon });
    setTempLatitude(lat); // 임시 위도 업데이트
    setTempLongitude(lon); // 임시 경도 업데이트
    setLoading(false);
  };
  const LocationModal = ({ isVisible, onClose }) => {
    const handleConfirm = () => {
      setLatitude(tempLatitude); // 최종 위도 업데이트
      setLongitude(tempLongitude); // 최종 경도 업데이트
      onClose();
    };
    
    const handleRefresh = () => {
      setLoading(true);
      setRefresh((prev) => !prev);
    };
    
    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.locModalWrapper}>
            <View style={styles.locModalContent}>
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                tempLatitude !== null &&
                tempLongitude !== null && (
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={{
                      latitude: tempLatitude,
                      longitude: tempLongitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                  >
                    <Marker coordinate={{ latitude: tempLatitude, longitude: tempLongitude }} />
                  </MapView>
                )
              )}
              <GetLocation
                onLocationReceived={handleLocationReceived}
                refresh={refresh}
              />
              <View style={styles.refreshButtonContainer}>
                <Pressable
                  onPress={handleRefresh}
                  style={styles.pressableButton}
                >
                  <Ionicons name="refresh" size={24} color="black" />
                </Pressable>
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <LinearGradient
                colors={["#1BC5DA", "#263283"]}
                style={styles.pressableButton}
              >
                <Pressable
                  onPress={handleConfirm}
                  disabled={isRequestPending}
                  style={styles.pressableContent}
                >
                  <Text style={styles.pressableButtonText}>확인</Text>
                </Pressable>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  const handleSave = async () => {
    if (isRequestPending) return; // 요청 중일 때 함수 실행 막기
    setIsRequestPending(true); // 요청 상태 시작
    
    if (editableUserId === "") {
      Alert.alert("알림", "이름을 입력해주세요!");
      setIsRequestPending(false); // 요청 상태 종료
      return;
    }
    if (editableUserId !== initialUserId && !isDuplicateChecked) {
      Alert.alert("알림", "이름 중복 확인을 해주세요!");
      setIsRequestPending(false); // 요청 상태 종료
      return;
    }
    
    const formData = new FormData();
    if (imageUri) {
      formData.append("profileImage", {
        uri: imageUri,
        name: "profile.jpg",
        type: "image/jpeg",
      });
    }
    formData.append("username", username);
    formData.append("location", serverUserLocation);
    formData.append("nickname", editableUserId);
    formData.append("x", longitude.toString());
    formData.append("y", latitude.toString());
    
    try {
      const response = await Api.patch(`/setting/myInfo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      const responseData = response.data;
      console.log("User updated:", responseData);
      if (responseData.data.message === "개인정보 수정를 성공했습니다.") {
        Alert.alert("알림", "개인정보 수정를 성공했습니다.");
      } else {
        navigation.navigate("MyP", { Update: responseData.data });
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsRequestPending(false); // 요청 상태 종료
    }
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
      <View style={styles.profileSection}>
        <View style={styles.imageSection}>
          <LinearGradient
            colors={["#1BC5DA", "#263283"]} // Define your gradient colors here
            style={styles.imageGradient}
          >
            <TouchableOpacity disabled={isRequestPending}>
              <Image source={{ uri: imageUri }} style={styles.image} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
        <View style={styles.profileTextSection}>
          <View style={styles.profileSmallTextSection}>
            <Text style={styles.profileSmallText}>프로필 사진 변경</Text>
          </View>
          <View style={styles.profileBigTextSection}>
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.buttonText}>앨범에서 고르기</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={PofileInitialization}>
              <Text style={styles.buttonText}>기본 이미지로 변경</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.infoBodySection}>
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>이름</Text>
          <View style={[styles.inputDiv, {width: wp(90)}]}>
            <Text style={styles.text}>{username}</Text>
          </View>
        </View>
        <View style={[
          styles.infoSection,
          !showDuplicateButton && !isDuplicateChecked
            ? ({marginBottom: hp(1.5)})
            : ({marginBottom: hp(0)})
        ]}>
          <Text style={styles.infoText}>사용자 이름</Text>
          <View style={styles.inputDiv}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={handleUserIdChange}
                value={editableUserId}
                editable={!isRequestPending}
                returnKeyType="done"
              />
            </View>
            {showDuplicateButton && (
              <TouchableOpacity
                onPress={duplicateCheck}
                disabled={isRequestPending}
              >
                <LinearGradient
                  colors={["#1BC5DA", "#263283"]} // Define your gradient colors here
                  style={styles.duplicateConfirm}
                >
                  <Text style={styles.duplicateText}>중복확인</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {showDuplicateButton &&
          (!isDuplicateChecked ? (
            <Text style={styles.warningText}>중복 조회를 부탁해요!</Text>
          ) : (
            <View style={styles.warningSection}>
              <Text
                style={[
                  styles.warningText,
                  warning === "이미 사용 중인 아이디입니다."
                    ? styles.warningTextRed
                    : styles.warningTextGreen,
                ]}
              >
                {warning}
              </Text>
            </View>
          ))}
        <View style={[styles.infoSection, {marginTop: hp(1.5) }]}>
          <TouchableOpacity
            onPress={() => setIsLocVisible(!isLocVisible)}
            disabled={isRequestPending}
          >
            <Text style={styles.infoText}>위치</Text>
            <View style={[styles.inputDiv, {justifyContent: "space-between"}]}>
              <Text style={styles.text}>{serverUserLocation}</Text>
              <LinearGradient
                colors={["#1BC5DA", "#263283"]} // Define your gradient colors here
                style={styles.duplicateConfirm}
              >
                <Text style={styles.duplicateText}>위치 변경</Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {isLocVisible && (
        <LocationModal
          isVisible={isLocVisible}
          onClose={() => setIsLocVisible(false)}
        />
      )}
      <LocationModal
        isVisible={isLocVisible}
        onClose={() => setIsLocVisible(false)}
      />
      <View style={styles.submitInfoSection}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={
            (editableUserId !== initialUserId && !isDuplicateChecked) ||
            isRequestPending
          }
        >
          <LinearGradient
            colors={["#1BC5DA", "#263283"]} // Define your gradient colors here
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>수정 제출</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
  },
  
  profileSection: {
    width: wp(100),
    height: hp(18),
    padding: wp(3),
    flexDirection: "row",
    alignItems: "center",
    
  },
    imageSection: {
      width: wp(30),
      height: wp(30),
      justifyContent: "center",
      alignItems: "center",
      marginRight: wp("5%"),

    },
      imageGradient: {
        width: wp("25.5%"),
        height: wp("25.5%"),
        borderRadius: wp("100%"),
        alignItems: "center",
        justifyContent: "center",
      },
      image: {
        width: wp("23%"),
        height: wp("23%"),
        borderRadius: wp("100%"),
        borderWidth: 2,
        borderColor: "white",
      },
    profileTextSection: {
      width: wp(55),
      height: wp(25),
      justifyContent: "flex-end",
      
    },
      profileSmallTextSection: {
        width: wp(55),
        height: wp(5),
        justifyContent: "center",
        
      },
        profileSmallText: {
          fontSize: hp(1.75),
          fontWeight: "bold",
          color: "#fff",
        },
      profileBigTextSection: {
        width: wp(55),
        height: wp(18),
        justifyContent: "center",
        
      },
        buttonText: {
          fontSize: hp(2.5),
          fontWeight: "bold",
          color: "#fff",
          marginVertical: hp(0.2),
        },
  
  infoBodySection: {
    flex: 1,
  },
    infoSection: {
      width: "90%",
      height: hp(12),
      marginBottom: hp(1.5),
    },
      infoText: {
        fontSize: hp(2.5),
        fontWeight: "bold",
        marginBottom: hp(1),
        color: "#fff",
      },
        inputDiv: {
          width: "100%",
          backgroundColor: "white",
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: hp(1.5), // 왼쪽 패딩만 남겨둠
          paddingRight: hp(0.6), // 왼쪽 패딩만 남겨둠
          height: hp(6.5), // 고정된 높이
        },
      text: {
        borderRadius: 10,
        fontSize: hp("2%"),
        fontWeight: "400",
        color: "black",
      },
      inputContainer: {
      flex: 1,
    },
        input: {
          width: "100%",
          borderRadius: 10,
          fontSize: hp("2%"),
          fontWeight: "400",
          color: "black",
        },
    duplicateConfirm: {
      padding: hp(1.5),
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
      duplicateText: {
        fontSize: hp("1.75%"),
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
      },
    
    warningSection: {
      width: "90%",
      justifyContent: "center",
    },
      warningText: {
        fontSize: hp("1.75%"),
        fontWeight: "bold",
        color: "white",
        
        marginBottom: hp(1),
      },
      warningTextRed: {
        color: "red",
      },
      warningTextGreen: {
        color: "green",
      },
  
  submitInfoSection: {
    width: "100%",
    alignItems: "center",
  },
    saveButton: {
      flexDirection: "column",
      width: "90%",
      borderRadius: 15,
      padding: wp("5%"), // 버튼 내부에 여백 추가
      alignItems: "center", // 텍스트를 가운데 정렬
      justifyContent: "center", // 텍스트를 가운데 정렬
      marginBottom: hp("2%"),
    },
    saveText: {
      borderRadius: 10,
      fontSize: hp(2.3),
      fontWeight: "bold",
      color: "white",
      minWidth: "100%",
      textAlign: "center",
    },
  
  
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
    pressableButton: {
      borderRadius: 5,
      marginHorizontal: 5,
    },
    pressableContent: {
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    pressableButtonText: {
      color: "black",
      fontSize: 16,
      fontWeight: "bold",
    },
    locModalWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    refreshButtonContainer: {
      alignItems: 'flex-end',
      marginTop: 10,
    },
    LocModalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    locModalContent: {
      width: wp("90%"),
      backgroundColor: "white",
      padding: hp("2%"),
      borderRadius: 10,
    },
    title: {
      fontSize: hp("2.5%"),
    },
    map: {
      width: wp("90%"),
      height: hp("60%"),
    },
    buttonContainer: {
      marginTop: 10,
      width: wp('80%'),
      alignItems: 'center',
    },
});

export default MyInfo;
