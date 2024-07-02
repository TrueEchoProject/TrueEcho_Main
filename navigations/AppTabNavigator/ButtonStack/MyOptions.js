import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Switch,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  FontAwesome5,
  AntDesign,
  FontAwesome6,
  MaterialIcons,
  Entypo,
  Ionicons,
} from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image"; // expo-image 패키지 import
import axios from "axios";
import Api from "../../../Api";
import * as SecureStore from "expo-secure-store";
import { CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const OptionText = ({ label }) => {
  return <Text style={styles.smallText2}>{label}</Text>;
};
const OptionItem = ({
  onPress,
  icon,
  iconType,
  label,
  backgroundColor = "#fff",
}) => {
  const IconComponent = iconType;
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.View, { backgroundColor }]}>
        <View style={styles.iconWrapper}>
          <IconComponent name={icon} size={30} color="black" />
        </View>
        <Text style={styles.smallText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const MyOptions = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [isBlockModal, setIsBlockModal] = useState(false);
  const [isTimeModal, setIsTimeModal] = useState(false);
  const [isQnAModal, setIsQnAModal] = useState(false);
  const [isDeleteAccountModal, setIsDeleteAccountModal] = useState(false);
  const defaultImage =
    "https://i.ibb.co/drqjXPV/DALL-E-2024-05-05-22-55-53-A-realistic-and-vibrant-photograph-of-Shibuya-Crossing-in-Tokyo-Japan-dur.webp";
  const [isLogOut, setIsLogOut] = useState(false);

  const fetchDataFromServer = async () => {
    try {
      const response = await Api.get(`/setting/myInfo`);
      setUser(response.data.data); // Correctly update the state here
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };
  useEffect(() => {
    fetchDataFromServer();
  }, []);
  useEffect(() => {
    if (user) {
      console.log("profile_url:", user.profileUrl);
      console.log("username:", user.username);
      console.log("user_Id:", user.nickname);
      console.log("user", user);
    }
  }, [user]);
  const notificationModalVisible = () => {
    setIsNotificationModal(!isNotificationModal);
  };
  const blockModalVisible = () => {
    setIsBlockModal(!isBlockModal);
  };
  const timeModalVisible = () => {
    setIsTimeModal(!isTimeModal);
  };
  const qnAModalVisible = () => {
    setIsQnAModal(!isQnAModal);
  };
  const deleteAccountModalVisible = () => {
    setIsDeleteAccountModal(!isDeleteAccountModal);
  };
  const NotificationModal = ({ isVisible, onClose }) => {
    const [clickedStatus, setClickedStatus] = useState({});
    const [serverNotification, setServerNotification] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotification = async () => {
      try {
        const severResponse = await Api.get(`/setting/notificationSetting`);
        console.log(severResponse.data.data);
        setServerNotification(severResponse.data.data);
        if (severResponse.data) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching calendar data", error);
      }
    };

    useEffect(() => {
      fetchNotification();
    }, []);
    useEffect(() => {
      console.log("server is", serverNotification);
    }, [serverNotification]);

    const updateNotificationSetting = (key, subKey = null) => {
      setServerNotification((prev) => {
        if (subKey) {
          const newValue = !prev[key][subKey];
          return {
            ...prev,
            [key]: { ...prev[key], [subKey]: newValue },
          };
        } else {
          return {
            ...prev,
            [key]: !prev[key],
          };
        }
      });
    };
    const toggleClickStatus = (optionId) => {
      setClickedStatus((prev) => ({
        ...prev,
        [optionId]: !prev[optionId],
      }));
    };

    const saveChanges = async () => {
      if (isLoading) return;

      setIsLoading(true);
      console.log("Saved notificationSettings:", serverNotification);
      try {
        const response = await Api.patch(
          `/setting/notificationSetting`,
          serverNotification
        );
        alert("알림 설정이 성공적으로\n제출되었습니다.");
        if (response.data) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error posting notification", error);
        alert("알림 설정을 제출하는 중\n오류가 발생했습니다.");
      }
      onClose();
    };

    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={onClose}
        >
          <TouchableOpacity style={styles.imageContainer} activeOpacity={1}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <>
                <Text style={styles.modalText}>알림 설정</Text>
                <Text style={styles.modalSmallText}>
                  알림의 on/off를 설정해주세요!
                </Text>
                <ScrollView
                  style={{ width: windowWidth * 0.8 }}
                  contentContainerStyle={styles.scrollContent}
                >
                  <TouchableOpacity
                    style={styles.scrollModalButton}
                    onPress={() => toggleClickStatus("communityNotiSet")}
                  >
                    <Text style={styles.switchButtonText}>
                      커뮤니티
                      <AntDesign
                        name="down"
                        size={20}
                        color="black"
                        style={{ marginHorizontal: 10 }}
                      />
                    </Text>
                  </TouchableOpacity>
                  {clickedStatus["communityNotiSet"] && (
                    <>
                      <View style={styles.switchModalButton}>
                        <Text style={styles.switchButtonText}>랭킹 달성</Text>
                        <Switch
                          style={{ marginRight: 10 }}
                          trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                          thumbColor={
                            serverNotification.communityNotiSet?.inRank
                              ? "#263A88"
                              : "#616161"
                          }
                          ios_backgroundColor="#ABABAB"
                          onValueChange={() =>
                            updateNotificationSetting(
                              "communityNotiSet",
                              "inRank"
                            )
                          }
                          value={serverNotification.communityNotiSet?.inRank}
                        />
                      </View>
                      <View style={styles.switchModalButton}>
                        <Text style={styles.switchButtonText}>투표 마감</Text>
                        <Switch
                          style={{ marginRight: 10 }}
                          trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                          thumbColor={
                            serverNotification.communityNotiSet?.newRank
                              ? "#263A88"
                              : "#616161"
                          }
                          ios_backgroundColor="#ABABAB"
                          onValueChange={() =>
                            updateNotificationSetting(
                              "communityNotiSet",
                              "newRank"
                            )
                          }
                          value={serverNotification.communityNotiSet?.newRank}
                        />
                      </View>
                      <View style={styles.switchModalButton}>
                        <Text style={styles.switchButtonText}>투표</Text>
                        <Switch
                          style={{ marginRight: 10 }}
                          trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                          thumbColor={
                            serverNotification.communityNotiSet?.voteResult
                              ? "#263A88"
                              : "#616161"
                          }
                          ios_backgroundColor="#ABABAB"
                          onValueChange={() =>
                            updateNotificationSetting(
                              "communityNotiSet",
                              "voteResult"
                            )
                          }
                          value={
                            serverNotification.communityNotiSet?.voteResult
                          }
                        />
                      </View>
                    </>
                  )}
                  <TouchableOpacity
                    style={styles.scrollModalButton}
                    onPress={() => toggleClickStatus("postNotiSet")}
                  >
                    <Text style={styles.switchButtonText}>
                      게시물
                      <AntDesign
                        name="down"
                        size={22}
                        color="black"
                        style={{ marginHorizontal: 5, marginTop: 2 }}
                      />
                    </Text>
                  </TouchableOpacity>
                  {clickedStatus["postNotiSet"] && (
                    <>
                      <View style={styles.switchModalButton}>
                        <Text style={styles.switchButtonText}>좋아요</Text>
                        <Switch
                          style={{ marginRight: 10 }}
                          trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                          thumbColor={
                            serverNotification.postNotiSet?.postLike
                              ? "#263A88"
                              : "#616161"
                          }
                          ios_backgroundColor="#ABABAB"
                          onValueChange={() =>
                            updateNotificationSetting("postNotiSet", "postLike")
                          }
                          value={serverNotification.postNotiSet?.postLike}
                        />
                      </View>
                      <View style={styles.switchModalButton}>
                        <Text style={styles.switchButtonText}>댓글 추가</Text>
                        <Switch
                          style={{ marginRight: 10 }}
                          trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                          thumbColor={
                            serverNotification.postNotiSet?.newComment
                              ? "#263A88"
                              : "#616161"
                          }
                          ios_backgroundColor="#ABABAB"
                          onValueChange={() =>
                            updateNotificationSetting(
                              "postNotiSet",
                              "newComment"
                            )
                          }
                          value={serverNotification.postNotiSet?.newComment}
                        />
                      </View>
                      <View style={styles.switchModalButton}>
                        <Text style={styles.switchButtonText}>답글</Text>
                        <Switch
                          style={{ marginRight: 10 }}
                          trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                          thumbColor={
                            serverNotification.postNotiSet?.subComment
                              ? "#263A88"
                              : "#616161"
                          }
                          ios_backgroundColor="#ABABAB"
                          onValueChange={() =>
                            updateNotificationSetting(
                              "postNotiSet",
                              "subComment"
                            )
                          }
                          value={serverNotification.postNotiSet?.subComment}
                        />
                      </View>
                    </>
                  )}
                  <View style={styles.scrollModalButton}>
                    <Text style={styles.switchButtonText}>친구요청</Text>
                    <Switch
                      style={{ marginRight: 10 }}
                      trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                      thumbColor={
                        serverNotification.friendRequest ? "#263A88" : "#616161"
                      }
                      ios_backgroundColor="#ABABAB"
                      onValueChange={() =>
                        updateNotificationSetting("friendRequest")
                      }
                      value={serverNotification.friendRequest}
                    />
                  </View>
                  <View style={styles.scrollModalButton}>
                    <Text style={styles.switchButtonText}>서비스 알림</Text>
                    <Switch
                      style={{ marginRight: 10 }}
                      trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                      thumbColor={
                        serverNotification.service ? "#263A88" : "#616161"
                      }
                      ios_backgroundColor="#ABABAB"
                      onValueChange={() => updateNotificationSetting("service")}
                      value={serverNotification.service}
                    />
                  </View>
                  <View style={styles.scrollModalButton}>
                    <Text style={styles.switchButtonText}>PhotoTime</Text>
                    <Switch
                      style={{ marginRight: 10 }}
                      trackColor={{ false: "#ABABAB", true: "#1E9FC4" }}
                      thumbColor={
                        serverNotification.photoTime ? "#263A88" : "#616161"
                      }
                      ios_backgroundColor="#ABABAB"
                      onValueChange={() =>
                        updateNotificationSetting("photoTime")
                      }
                      value={serverNotification.photoTime}
                    />
                  </View>
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity onPress={saveChanges} style={styles.modalButton}>
          <LinearGradient
            colors={["#1BC5DA", "#263283"]}
            style={styles.modalButton}
          >
            <Text
              style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
            >
              저장
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Modal>
    );
  };

  const BlockModal = ({ isVisible, onClose }) => {
    const [editButton, setEditButton] = useState(false);
    const [blockedStatus, setBlockedStatus] = useState({});
    const [originalStatus, setOriginalStatus] = useState({});
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBlockedUsers = async () => {
      try {
        const serverResponse = await Api.get(`/blocks/read`);
        setBlockedUsers(serverResponse.data.data);
        if (serverResponse.data) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching calendar data", error);
      }
    };
    useEffect(() => {
      fetchBlockedUsers();
    }, []);
    useEffect(() => {
      console.log(blockedUsers);
    }, [blockedUsers]);
    // 각 사용자의 차단 상태를 초기화합니다.
    useEffect(() => {
      if (blockedUsers && blockedUsers.length > 0) {
        const initialStatus = blockedUsers.reduce((status, user) => {
          status[user.userId] = false;
          return status;
        }, {});
        setBlockedStatus(initialStatus);
      }
    }, [blockedUsers]);
    // 편집 상태를 시작할 때의 차단된 사용자 상태를 저장합니다.
    const startEditing = () => {
      setOriginalStatus({ ...blockedStatus });
      setEditButton(true);
    };
    // 편집 취소 함수
    const cancelEditing = () => {
      setBlockedStatus(originalStatus);
      setEditButton(false);
    };
    const toggleBlockStatus = (userId) => {
      setBlockedStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: !prevStatus[userId],
      }));
    };
    // 저장 버튼 클릭 시 호출되는 함수
    const handleSave = async () => {
      if (isLoading) return;

      // 변경된 사항이 있는지 확인합니다.
      const hasChanges = Object.keys(blockedStatus).some(
        (id) => blockedStatus[id] !== originalStatus[id]
      );
      if (hasChanges) {
        // blockedStatus에서 차단된 사용자의 ID를 추출합니다.
        const blockedIds = Object.keys(blockedStatus).filter(
          (id) => blockedStatus[id]
        );
        // 차단된 사용자 ID 배열을 만듭니다.
        const blockUserIds = blockedUsers
          .filter((user) => blockedIds.includes(String(user.userId)))
          .map((user) => user.userId);
        console.log("서버 보내기:", blockUserIds);
        try {
          // DELETE 요청 시 쿼리 파라미터로 blockUserIds를 포함하여 전송합니다.
          const response = await Api.delete(`/blocks/delete`, {
            params: {
              blockUserIds: blockUserIds.join(","),
            },
          });
          console.log("서버 응답:", response.data);
          if (response.data) {
            fetchBlockedUsers();
          }
        } catch (error) {
          console.error("Error updating blocked users:", error);
        }
      }
    };
    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.imageContainer2}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <Text style={[styles.modalText, { marginTop: "8%" }]}>
                  차단된 친구
                </Text>
                <Text style={[styles.modalSmallText, { marginBottom: "3%" }]}>
                  {" "}
                  차단된 친구들을 변경할 수 있어요!
                </Text>
                {blockedUsers.length === 0 ? (
                  <View style={styles.blockNone}>
                    <Text>차단한 친구가 없어요</Text>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      style={{ width: windowWidth * 0.8 }}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {blockedUsers.map((user) => (
                        <View
                          key={user.userId}
                          style={styles.scrollModalButton}
                        >
                          <Image
                            style={styles.profileImage}
                            source={{
                              uri: user.userProfileUrl
                                ? user.userProfileUrl
                                : defaultImage,
                            }}
                          />
                          <Text style={styles.buttonText}>{user.nickname}</Text>
                          {editButton && (
                            <TouchableOpacity
                              style={[styles.blockedButton]}
                              onPress={() => toggleBlockStatus(user.userId)}
                            >
                              {blockedStatus[user.userId] ? (
                                <AntDesign
                                  name="checksquare"
                                  size={30}
                                  color="black"
                                />
                              ) : (
                                <AntDesign
                                  name="checksquareo"
                                  size={30}
                                  color="black"
                                />
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                    <View style={styles.blockedModalButton}>
                      {!editButton ? (
                        <TouchableOpacity
                          style={[
                            styles.blockedModalSaveButton,
                            { backgroundColor: "#99A1F6" },
                          ]}
                          onPress={startEditing}
                        >
                          <Text style={styles.buttonText}>편집</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.blockedModalSaveButton,
                            { backgroundColor: "#3B4664" },
                          ]}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.buttonText}>편집 취소</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.blockedModalSaveButton}
                        onPress={handleSave}
                      >
                        <Text style={styles.buttonText}>저장</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.modalButton}
                >
                  <LinearGradient
                    colors={["#1BC5DA", "#263283"]}
                    style={styles.modalButton}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      저장
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  const TimeModal = ({ isVisible, onClose }) => {
    const [severTime_type, setSeverTime_type] = useState({});
    const timeOptions = [
      { label: "00 ~ 07", value: "DAWN", number: 0 },
      { label: "07 ~ 12", value: "MORNING", number: 1 },
      { label: "12 ~ 15", value: "EARLY_AFTERNOON", number: 2 },
      { label: "15 ~ 18", value: "LATE_AFTERNOON", number: 3 },
      { label: "18 ~ 21", value: "EARLY_NIGHT", number: 4 },
      { label: "21 ~ 24", value: "LATE_NIGHT", number: 5 },
    ];
    const [isLoading, setIsLoading] = useState(true);

    const extractScheduledTime = (message) => {
      const pattern = /\d{2}시 예정/;
      const match = message.match(pattern);
      return match ? match[0].replace("시 예정", "") : null;
    };
    const extractTimeChangeMessage = (message) => {
      if (!message) return "시간 변경 정보를 찾을 수 없습니다.";
      const pattern = /알림시간이 (.+?)에서 (.+?)으로 변경 예약되었습니다/;
      const match = message.match(pattern);
      if (match) {
        const [_, fromTime, toTime] = match;
        const fromTimeOption = timeOptions.find(
          (option) => option.value === fromTime
        );
        const toTimeOption = timeOptions.find(
          (option) => option.value === toTime
        );
        if (fromTimeOption && toTimeOption) {
          return `알림 시간이 ${fromTimeOption.label}시 에서 ${toTimeOption.label}시 로 변경되었습니다.`;
        }
      }
      return "시간 변경 정보를 찾을 수 없습니다.";
    };

    useEffect(() => {
      fetchTime_type();
    }, []);
    useEffect(() => {
      if (severTime_type) {
        console.log(severTime_type);
      }
    }, [severTime_type]);
    const fetchTime_type = async () => {
      try {
        const severResponse = await Api.get(`/setting/notifyTime`);
        const serverData = severResponse.data.data;
        setSeverTime_type(serverData);
        const msg = serverData.msg;
        if (msg) {
          const scheduledTime = extractScheduledTime(msg);
          if (scheduledTime) {
            const timeOption = timeOptions.find((option) =>
              option.label.includes(scheduledTime)
            );
            if (timeOption) {
              alert(`예약된 변경시간: ${timeOption.label}`);
            } else {
              alert("시간대 정보를 찾을 수 없습니다.");
            }
          } else {
            alert("메시지에서 시간을 추출할 수 없습니다.");
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching calendar data", error);
      }
    };
    const saveChanges = async () => {
      if (isLoading) return;

      setIsLoading(true);
      const selectedOption = timeOptions.find(
        (option) => option.value === severTime_type.randomNotifyTime
      );
      const editTime = selectedOption ? selectedOption.number : null;
      console.log("서버 응답:", editTime);
      if (editTime !== null) {
        try {
          const severResponse = await Api.patch(
            `/setting/notifyTime?editTime=${editTime}`,
            {}
          );
          const msg = severResponse.data.data;
          if (msg) {
            const alertMessage = extractTimeChangeMessage(msg);
            alert(alertMessage);
          } else {
            alert("시간 변경 정보를 찾을 수 없습니다.");
          }
          console.log("서버 응답:", severResponse.data.data);
          if (severResponse.data) {
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error posting data:", error);
          alert("데이터를 제출하는 중 오류가 발생했습니다.");
        } finally {
          console.log("Saved Time_type:", editTime);
        }
      } else {
        alert("올바른 시간을 선택해주세요.");
      }
      onClose();
    };
    const handleTimeTypeChange = (randomNotifyTime) => {
      setSeverTime_type((prevState) => ({
        ...prevState,
        randomNotifyTime: randomNotifyTime,
      }));
    };

    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.imageContainer}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <Text style={styles.modalText}>Photo Time</Text>
                <Text style={styles.modalSmallText}>
                  사진을 찍을 시간을 정해주세요!
                </Text>
                <ScrollView
                  style={{ width: windowWidth * 0.8 }}
                  contentContainerStyle={styles.scrollContent}
                >
                  {timeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleTimeTypeChange(option.value)}
                      style={
                        severTime_type.randomNotifyTime === option.value
                          ? styles.selectedModalButton
                          : styles.modalButton
                      }
                    >
                      <Text style={styles.buttonText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#4CAF50" }]}
                  onPress={saveChanges}
                >
                  <Text style={styles.buttonText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      marginBottom: "3%",
                      margin: "1%",
                      backgroundColor: "grey",
                    },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  const QnAModal = ({ isVisible, onClose }) => {
    const [QnA, setQnA] = useState([]);
    const [answerShowing, setAnswerShowing] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnswer = async () => {
      try {
        const response = await axios.get(`http://192.168.0.27:3000/QnA`);
        setQnA(response.data);
        console.log(response.data);
        if (response.data) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching calendar data", error);
      }
    };
    useEffect(() => {
      fetchAnswer();
    }, []);

    const toggleAnswerVisible = (id) => {
      setAnswerShowing((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.imageContainer}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <Text style={styles.modalText}>QnA</Text>
                <Text style={styles.modalSmallText}>
                  자주 받는 질문들에 대해 답변해드려요
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  추후에 업데이트할 예정.
                </Text>
                <ScrollView
                  style={{ width: windowWidth * 0.8 }}
                  contentContainerStyle={styles.scrollContent}
                >
                  {QnA.map((item) => (
                    <View
                      key={item.id}
                      style={{ width: "80%", alignItems: "center" }}
                    >
                      <TouchableOpacity
                        onPress={() => toggleAnswerVisible(item.id)}
                        style={styles.QContainer}
                      >
                        <Text style={styles.QnAText}>Q.{item.id}</Text>
                        <Text style={styles.QnASubText}>{item.Q}</Text>
                      </TouchableOpacity>
                      {answerShowing[item.id] && (
                        <View style={styles.AContainer}>
                          <Text style={styles.QnAText}>A.{item.id}</Text>
                          <Text style={styles.QnASubText}>{item.A}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "grey", margin: 15 },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  const DeleteAccountModal = ({ isVisible, onClose }) => {
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (!isVisible) {
        setInputText(""); // Modal이 닫힐 때 입력 필드를 초기화합니다.
      }
    }, [isVisible]);

    const deleteAccount = async () => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const response = await Api.delete(`/accounts/deleteUser`);
        if (response.data) {
          setIsDeleteAccountModal(false);
          await Promise.all([
            SecureStore.deleteItemAsync("accessToken"),
            SecureStore.deleteItemAsync("refreshToken"),
            SecureStore.deleteItemAsync("userEmail"),
            SecureStore.deleteItemAsync("userPassword"),
          ]);
          await setIsLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          );
        }
        console.log(response.data.message); // Correctly update the state here
      } catch (error) {
        console.error("Error logOut", error);
      }
    };

    return (
      <Modal
        animationType="fade"
        visible={isVisible}
        onRequestClose={onClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.imageContainer, { height: windowHeight * 0.5 }]}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <View style={{ height: "20%" }}>
                  <Text style={styles.modalText}>계정 탈퇴</Text>
                  <Text style={styles.modalSmallText}>
                    정말로 계정을 탈퇴하실 건가요?
                  </Text>
                </View>
                <View
                  style={{
                    height: "20%",
                    width: "100%",
                    alignItems: "center",
                    marginBottom: 50,
                  }}
                >
                  <Text
                    style={{
                      color: "black",
                      fontSize: 12,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginTop: 3,
                      marginBottom: 5,
                    }}
                  >
                    아래의 글자를 동일하게 작성해주세요
                  </Text>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      marginTop: 3,
                      marginBottom: 5,
                    }}
                  >
                    계정 삭제
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={inputText}
                    onChangeText={setInputText}
                  />
                </View>
                <TouchableOpacity
                  style={
                    inputText === "계정 삭제"
                      ? styles.deleteModalButton
                      : styles.disabledModalButton
                  }
                  onPress={deleteAccount}
                  disabled={inputText !== "계정 삭제"}
                >
                  <Text style={[styles.buttonText, { color: "white" }]}>
                    계정 탈퇴
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "grey", margin: 15 },
                  ]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>닫기</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };
  const logOut = async () => {
    try {
      if (isLogOut) return;

      setIsLogOut(true);
      const response = await Api.delete(`/accounts/logout`);
      console.log(response.data.message);
      if (response.data) {
        setIsLogOut(false);
        await Promise.all([
          SecureStore.deleteItemAsync("accessToken"),
          SecureStore.deleteItemAsync("refreshToken"),
          SecureStore.deleteItemAsync("userEmail"),
          SecureStore.deleteItemAsync("userPassword"),
        ]);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Login" }],
          })
        );
      }
    } catch (error) {
      console.error("Error logOut", error);
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
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity
          onPress={() => navigation.navigate("MyInfo", { user: user })}
          style={styles.userView}
        >
          <Image
            source={{ uri: user.profileUrl ? user.profileUrl : defaultImage }}
            style={styles.Image}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.Text}>{user.username}</Text>
            <Text style={styles.Text}>{user.nickname}</Text>
          </View>
        </TouchableOpacity>
        <View>
          <OptionText label="기능" />
          <OptionItem
            iconType={FontAwesome5}
            icon="calendar-alt"
            label="캘린더"
            onPress={() => navigation.navigate("Calendar")}
          />
        </View>
        <View>
          <OptionText label="설정" />
          <OptionItem
            iconType={AntDesign}
            icon="bells"
            label="알림"
            onPress={notificationModalVisible}
          />
          {isNotificationModal && (
            <NotificationModal
              isVisible={isNotificationModal}
              onClose={() => setIsNotificationModal(false)}
            />
          )}
          <OptionItem
            iconType={FontAwesome6}
            icon="user-shield"
            label="차단 유저 관리"
            onPress={blockModalVisible}
          />
          {isBlockModal && (
            <BlockModal
              isVisible={isBlockModal}
              onClose={() => setIsBlockModal(false)}
            />
          )}
          <OptionItem
            iconType={MaterialIcons}
            icon="phonelink-ring"
            label="Photo Time"
            onPress={timeModalVisible}
          />
          {isTimeModal && (
            <TimeModal
              isVisible={isTimeModal}
              onClose={() => setIsTimeModal(false)}
            />
          )}
        </View>
        <View>
          <OptionText label="더보기" />
          <OptionItem
            iconType={Entypo}
            icon="chat"
            label="도움받기"
            onPress={qnAModalVisible}
          />
          {isQnAModal && (
            <QnAModal
              isVisible={isQnAModal}
              onClose={() => setIsQnAModal(false)}
            />
          )}
        </View>
        <View style={{ marginTop: 30 }}>
          <OptionItem
            iconType={Entypo}
            icon="log-out"
            label="로그아웃"
            onPress={logOut}
          />
          <OptionItem
            iconType={Ionicons}
            icon="alert-circle"
            label="계정 삭제"
            onPress={deleteAccountModalVisible}
          />
          {isDeleteAccountModal && (
            <DeleteAccountModal
              isVisible={isDeleteAccountModal}
              onClose={() => setIsDeleteAccountModal(false)}
            />
          )}
        </View>
      </ScrollView>
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
    backgroundColor: "black", // 변경: 배경 검정색
  },
  scrollView: {
    margin: 20,
  },
  View: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    marginBottom: 10,
  },
  userView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    marginBottom: 10,
  },
  Image: {
    width: 85,
    height: 85,
    borderRadius: 100,
    backgroundColor: "white",
    borderWidth: 5,
    borderColor: "#1BC5DA",
  },
  Text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black", // 변경: 텍스트 흰색
  },
  smallText: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 5,
    color: "black", // 변경: 텍스트 검정색
  },
  smallText2: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#fff", // 변경: 텍스트 검정색
  },
  iconWrapper: {
    // marginRight: 15,
    // borderRadius: 30, // 동그라미 테두리
    // borderWidth: 1,
    // borderColor: 'black',
    // padding: 5,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth * 0.8,
    height: windowHeight * 0.55,
    borderRadius: 20,
    backgroundColor: "white",
  },
  imageContainer2: {
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth * 0.8,
    height: windowHeight * 0.6,
    borderRadius: 20,
    backgroundColor: "white",
  },
  imageContainer3: {
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth * 0.8,
    height: windowHeight * 0.7,
    borderRadius: 20,
    backgroundColor: "white",
  },
  scrollContainer: {
    width: windowWidth * 0.65,
    borderRadius: 10,
    borderColor: "black",
    backgroundColor: "#81b0ff",
  },
  profileImage: {
    height: 30,
    width: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "grey",
    marginHorizontal: 10,
  },
  scrollContent: {
    alignItems: "center", // 컨텐츠를 가운데 정렬
    // paddingHorizontal:3
  },
  switchButtonText: {
    marginLeft: 10,
    marginRight: "auto",
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  modalSmallText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 5,
  },
  switchModalButton: {
    flexDirection: "row",
    width: "60%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    borderColor: "black",
    alignItems: "center",
    margin: 10,
  },
  scrollModalButton: {
    flexDirection: "row",
    width: "85%",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    borderColor: "black",
    alignItems: "center",
    margin: "3%",
  },
  blockedModalSaveButton: {
    width: "45%",
    // margin: "5%",
    height: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
  },
  blockedModalButton: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: "3%",
    flexDirection: "row",
    borderColor: "white",
    backgroundColor: "white",
  },
  modalButton: {
    width: "100%",
    height: 50,
    borderRadius: 10,
    borderColor: "black",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  gradientButton: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
  },
  fullGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
  },
  disabledModalButton: {
    width: "80%",
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "grey",
    opacity: 0.5,
  },
  deleteModalButton: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "red",
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedModalButton: {
    width: "80%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#3B4664",
    borderColor: "black",
    alignItems: "center",
    justifyContent: "center",
    margin: "3%",
  },
  blockedButton: {
    marginLeft: "auto",
    marginRight: 10,
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: "white",
  },
  blockNone: {
    height: "70%",
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "10%",
    marginRight: "10%",
    backgroundColor: "#fff",
    padding: 10,
    borderColor: "black",
  },
  QnAText: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
  },
  QnASubText: {
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 10,
  },
  QContainer: {
    marginTop: 10,
    width: "100%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  AContainer: {
    padding: 5, // 텍스트 주위에 공간을 추가합니다.
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 5,
  },
});
export default MyOptions;
