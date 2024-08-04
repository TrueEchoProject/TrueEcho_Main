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
import axios from "axios";
import Api from "../../../Api";
import * as SecureStore from "expo-secure-store";
import { CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const OptionText = ({ label }) => {
  return <Text style={styles.CategoryText}>{label}</Text>;
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
      <View style={[styles.IconView, { backgroundColor }]}>
        <View style={styles.IconAlign}>
          <IconComponent name={icon} size={30} color="black" />
        </View>
        <Text style={styles.ListText}>{label}</Text>
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
        <View style={styles.NotificationModalContainer}>
          <View style={styles.NotificationModal}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <>
                <View style={styles.ModalTextContainer}>
                  <Text style={styles.ModalText}>알림 설정</Text>
                  <Text style={styles.ModalSmallText}>
                    알림의 on/off를 설정해주세요!
                  </Text>
                </View>
                <ScrollView
                  style={styles.ScrollViewContainer}
                  contentContainerStyle={styles.ScrollContent}
                >
                  <TouchableOpacity
                    style={styles.NotificationScrollButton}
                    onPress={() => toggleClickStatus("communityNotiSet")}
                  >
                    <Text style={styles.NotificationScrollButtonText}>
                      커뮤니티
                      <View style={{ paddingLeft: 5 }}>
                        <AntDesign
                          name="down"
                          size={15}
                          color="black"
                        />
                      </View>
                    </Text>
                  </TouchableOpacity>
                  {clickedStatus["communityNotiSet"] && (
                    <>
                      <View style={styles.NotificationScrollSubButton}>
                        <Text style={styles.NotificationScrollButtonText}>랭킹 달성</Text>
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
                      <View style={styles.NotificationScrollSubButton}>
                        <Text style={styles.NotificationScrollButtonText}>투표 마감</Text>
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
                      <View style={styles.NotificationScrollSubButton}>
                        <Text style={styles.NotificationScrollButtonText}>투표</Text>
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
                    style={styles.NotificationScrollButton}
                    onPress={() => toggleClickStatus("postNotiSet")}
                  >
                    <Text style={styles.NotificationScrollButtonText}>
                      게시물
                      <View style={{ paddingLeft: 5 }}>
                        <AntDesign
                          name="down"
                          size={15}
                          color="black"
                        />
                      </View>
                    </Text>
                  </TouchableOpacity>
                  {clickedStatus["postNotiSet"] && (
                    <>
                      <View style={styles.NotificationScrollSubButton}>
                        <Text style={styles.NotificationScrollButtonText}>좋아요</Text>
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
                      <View style={styles.NotificationScrollSubButton}>
                        <Text style={styles.NotificationScrollButtonText}>댓글 추가</Text>
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
                      <View style={styles.NotificationScrollSubButton}>
                        <Text style={styles.NotificationScrollButtonText}>답글</Text>
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
                  <View style={styles.NotificationScrollButton}>
                    <Text style={styles.NotificationScrollButtonText}>친구요청</Text>
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
                  <View style={styles.NotificationScrollButton}>
                    <Text style={styles.NotificationScrollButtonText}>서비스 알림</Text>
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
                  <View style={styles.NotificationScrollButton}>
                    <Text style={styles.NotificationScrollButtonText}>PhotoTime</Text>
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
          </View>
            <TouchableOpacity onPress={saveChanges} style={styles.ModalSave}>
              <LinearGradient
                colors={["#1BC5DA", "#263283"]}
                style={styles.ModalSave}
              >
                <Text style={styles.ModalButtonText}>
                  저장
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.ModalClose}>
              <Text style={[styles.ModalButtonText, {color: "black"}]}>
                닫기
              </Text>
            </TouchableOpacity>
          </View>
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
        <View style={styles.NotificationModalContainer}>
          <View style={styles.NotificationModal}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <View style={styles.ModalTextContainer}>
                  <Text style={styles.ModalText}>
                    차단된 친구
                  </Text>
                  <Text style={styles.ModalSmallText}>
                    차단된 친구들을 변경할 수 있어요!
                  </Text>
                </View>
                {blockedUsers.length === 0 ? (
                  <View style={styles.BlockNone}>
                    <Text style={styles.BlockNoneText}>차단한 친구가 없어요</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.BlockModalEditContainer}>
                      {!editButton ? (
                        <LinearGradient
                          colors={["#1BC5DA", "#263283"]}
                          style={styles.BlockModalEdit}
                        >
                          <TouchableOpacity
                            onPress={startEditing}
                          >
                            <Text style={styles.BlockModalEditText}>편집</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      ) : (
                        <TouchableOpacity
                          style={[styles.BlockModalEdit, { backgroundColor: "#1E1E1E" },]}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.BlockModalEditText}>편집 취소</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView
                      style={{width:"100%"}}
                      contentContainerStyle={styles.BlockScroll}
                    >
                      {blockedUsers.map((user) => (
                        <View
                          key={user.userId}
                          style={styles.BlockScrollButton}
                        >
                          <LinearGradient
                            colors={["#1BC5DA", "#263283"]}
                            style={styles.BlockScrollProfileGradient}
                          >
                            <View style={styles.BlockScrollProfileContainer}>
                              <Image
                                style={styles.BlockScrollProfile}
                                source={{
                                  uri: user.userProfileUrl
                                    ? user.userProfileUrl
                                    : defaultImage,
                                }}
                              />
                            </View>
                          </LinearGradient>
                          <View style={styles.ButtonTextContainer}>
                            <Text>{user.nickname}</Text>
                          </View>
                          {editButton && (
                            <TouchableOpacity
                              onPress={() => toggleBlockStatus(user.userId)}
                            >
                              {blockedStatus[user.userId] ? (
                                <LinearGradient
                                  colors={["#1BC5DA", "#263283"]}
                                  style={styles.BlockSelect}
                                >
                                  <View style={styles.BlockButtonCircle}/>
                                </LinearGradient>
                              ) : (
                                <View
                                  style={[styles.BlockSelect, {backgroundColor: "#232323"}]}
                                >
                                  <View style={styles.BlockButtonCircle}/>
                                </View>)}
                            </TouchableOpacity>)}
                        </View>))}
                    </ScrollView>
                  </>)}
              </>)}
          </View>
            <TouchableOpacity onPress={handleSave} style={styles.ModalSave}>
              <LinearGradient
                colors={["#1BC5DA", "#263283"]}
                style={styles.ModalSave}
              >
                <Text style={styles.ModalButtonText}>
                  저장
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.ModalClose}>
              <Text style={[styles.ModalButtonText, {color: "black"}]}>
                닫기
              </Text>
            </TouchableOpacity>
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
        <View style={styles.NotificationModalContainer}>
          <View style={[styles.NotificationModal, {height: windowHeight * 0.4}]}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <View style={styles.ModalTextContainer}>
                  <Text style={styles.ModalText}>Photo Time</Text>
                  <Text style={styles.ModalSmallText}>
                    사진을 찍을 시간을 정해주세요!
                  </Text>
                </View>
                <View style={styles.TimeOptionsContainer}>
                  {timeOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleTimeTypeChange(option.value)}
                      style={[
                        severTime_type.randomNotifyTime === option.value ?
                          styles.TimeSelectedBackground : styles.TimeOptionButton,
                        index % 2 === 0 && styles.TimeOptionButtonMargin,
                      ]}
                    >
                      {severTime_type.randomNotifyTime === option.value ? (
                        <LinearGradient
                          colors={["#1BC5DA", "#263283"]}
                          style={styles.TimeSelectedOptionButton}
                        >
                          <Text style={styles.ModalButtonText}>{option.label}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={[styles.ModalButtonText, {color: "black"}]}>{option.label}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
          <TouchableOpacity onPress={saveChanges} style={styles.ModalSave}>
            <LinearGradient
              colors={["#1BC5DA", "#263283"]}
              style={styles.ModalSave}
            >
              <Text style={styles.ModalButtonText}>
                저장
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.ModalClose}>
            <Text style={[styles.ModalButtonText, {color: "black"}]}>
              닫기
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
  const QnAModal = ({ isVisible, onClose }) => {
    const [QnA, setQnA] = useState([]);
    const [answerShowing, setAnswerShowing] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
      } finally {
        setIsLoading(false);
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
        <View style={styles.NotificationModalContainer}>
          <View style={styles.NotificationModal}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
              <View style={styles.ModalTextContainer}>
                <Text style={styles.ModalText}>
                  QnA
                </Text>
                <Text style={styles.ModalSmallText}>
                  자주 받는 질문들에 대해 답변해드려요
                </Text>
              </View>
              {QnA.length === 0 ? (
                <View style={styles.BlockNone}>
                  <Text style={styles.BlockNoneText}>업데이트 예정</Text>
                </View>
              ) : (
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
                </ScrollView>)}
              </>)}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.ModalClose}>
            <Text style={[styles.ModalButtonText, {color: "black"}]}>
              닫기
            </Text>
          </TouchableOpacity>
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
        <View style={styles.NotificationModalContainer}>
          <View style={[styles.NotificationModal, { height: windowHeight * 0.4 }]}>
            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : (
              <>
                <View style={styles.ModalTextContainer}>
                  <Text style={styles.ModalText}>계정 삭제</Text>
                  <Text style={styles.ModalSmallText}>
                    정말로 계정을 탈퇴하실 건가요?
                  </Text>
                </View>
                <View style={styles.DeleteTextContainer}>
                  <Text style={styles.DeleteSmallText}>
                    아래의 글자를 동일하게 작성해주세요
                  </Text>
                  <Text style={styles.DeleteText}>
                    탈퇴
                  </Text>
                </View>
                <TextInput
                  style={styles.DeleteInput}
                  placeholder=""
                  value={inputText}
                  onChangeText={setInputText}
                />
              </>
            )}
          </View>
          <TouchableOpacity
            style={inputText === "탈퇴" ? styles.deleteModalButton : styles.disabledModalButton}
            onPress={deleteAccount}
            disabled={inputText !== "탈퇴"}
          >
            <Text style={[styles.ModalButtonText, { color: "black" }]}>
              계정 삭제
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.ModalClose}>
            <Text style={[styles.ModalButtonText, {color: "black"}]}>
              닫기
            </Text>
          </TouchableOpacity>
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
    <View style={styles.ListContainer}>
      <ScrollView style={styles.ListScrollView}>
        <TouchableOpacity
          onPress={() => navigation.navigate("MyInfo", { user: user })}
          style={styles.MyInfoView}
        >
          <LinearGradient
            colors={["#1BC5DA", "#263283"]}
            style={styles.MyInfoProfileGradient}
          >
            <View style={styles.MyInfoProfileContainer}>
              <Image
                style={styles.MyInfoProfile}
                source={{ uri: user.profileUrl ? user.profileUrl : defaultImage }}
              />
            </View>
          </LinearGradient>
          <View style={{ marginHorizontal: 10, width: "60%",}}>
            <View style={{borderColor: "black", borderBottomWidth: 1}}>
              <Text style={styles.MyInfoText}>{user.username}</Text>
            </View>
            <Text style={styles.MyInfoSmallText}>{user.nickname}</Text>
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
  ListContainer: {
    flex: 1,
    backgroundColor: "black", // 변경: 배경 검정색
  },
  ListScrollView: {
    margin: 20,
  },
  IconView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    marginBottom: 10,
  },
  IconAlign: {
    width: 40,
    marginRight: 10,
    alignItems: "center",
  },
  ListText: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 5,
    color: "black", // 변경: 텍스트 검정색
  },
  CategoryText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    color: "#fff", // 변경: 텍스트 검정색
  },
  
  MyInfoView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    marginBottom: 10,
  },
  MyInfoProfileGradient: {
    height: 90,
    width: 90,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  MyInfoProfileContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  MyInfoProfile: {
    width: 85,
    height: 85,
    borderRadius: 100,
    borderColor: "white",
    borderWidth: 2,
  },
  MyInfoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black", // 변경: 텍스트 흰색
    margin: 3,
  },
  MyInfoSmallText: {
    fontSize: 15,
    color: "black", // 변경: 텍스트 흰색
    margin: 3,
  },
  
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black", // 변경: 배경 검정색
  },
  ModalTextContainer: {
    width: "90%",
    height: "20%",
    alignItems: "center",
    justifyContent: "center",
  },
  ModalText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  ModalSmallText: {
    color: "black",
    fontSize: 12,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 5,
  },
  ModalSave: {
    alignSelf: "center",
    justifyContent: "center",
    width: "90%",
    height: 50,
    marginTop: 10,
    borderRadius: 10,
  },
  ModalClose: {
    alignSelf: "center",
    justifyContent: "center",
    width: "81%",
    height: 50,
    marginTop: 10,
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 1,
    backgroundColor: "white",
  },
  ModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },
  
  ScrollContent: {
    alignItems: "center", // 컨텐츠를 가운데 정렬
  },
  ScrollViewContainer: {
    width: windowWidth * 0.7,
  },
  
  NotificationModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  NotificationModal: {
    alignItems: "center",
    justifyContent: "center",
    width: windowWidth * 0.8,
    height: windowHeight * 0.5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "white",
  },
  NotificationScrollButton: {
    flexDirection: "row",
    width: "100%",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    borderColor: "black",
    alignItems: "center",
    margin: "3%",
  },
  NotificationScrollSubButton: {
    flexDirection: "row",
    width: "80%",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff", // 변경: 버튼 배경 흰색
    borderColor: "black",
    alignItems: "center",
    margin: "3%",
  },
  NotificationScrollButtonText: {
    marginLeft: 10,
    marginRight: "auto",
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  
  BlockScroll: {
    alignItems: "center", // 컨텐츠를 가운데 정렬
    height: "100%",
  },
  BlockModalEditContainer: {
    width:"85%",
    height:"8%",
    marginBottom:"3%"
  },
  BlockModalEdit: {
    width: "25%",
    height: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
  },
  BlockModalButton: {
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
  BlockModalEditText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  BlockNone: {
    height: "75%",
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  BlockNoneText: {
    color: "black",
    fontSize: 15,
    fontWeight: "extra-bold",
    textAlign: "center",
  },
  BlockScrollButton: {
    flexDirection: "row",
    width: "85%",
    height: "22%",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "black",
    alignItems: "center",
    margin: "2%",
  },
  BlockScrollProfile: {
    height: 37,
    width: 37,
    borderRadius: 20,
    borderColor: "white",
    borderWidth: 1,
  },
  BlockScrollProfileGradient: {
    height: 42,
    width: 42,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  BlockScrollProfileContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ButtonTextContainer: {
    width: "55%",
  },
  BlockSelect: {
    width: 30,
    height: 30,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  BlockButtonCircle : {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: "white"
  },
  
  TimeOptionsContainer: {
    margin: 20,
    width: "85%",
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  TimeOptionButton: {
    width: '45%',
    padding: 15,
    marginVertical: 5,
    borderRadius: 15,
    borderColor: 'black',
    borderWidth: 1,
    alignItems: 'center',
  },
  TimeSelectedBackground: {
    width: '45%',
    alignItems: 'center',
  },
  TimeSelectedOptionButton: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  TimeOptionButtonMargin: {
    marginRight: '10%',
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
  
  DeleteTextContainer: {
    height: 55,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  DeleteText: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  DeleteSmallText: {
    color: "#6C6C6C",
    fontSize: 12,
    marginBottom: 5,
  },
  DeleteInput: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 10,
  },
  disabledModalButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "81%",
    height: 50,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#949494",
    borderColor: "black",
  },
  deleteModalButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "81%",
    height: 50,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#FF3232",
    borderColor: "black",
  },
});
export default MyOptions;
