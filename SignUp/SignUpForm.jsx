import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Notification from "./Notification";
import SettingTime from "./SettingTime";
import GetLocation from './GetLocation';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    userName: "",
    userAge: "",
    gender: "",
    timeRange: [10, 20],
    latitude: "",
    longitude: "",
  });
  const [authCode, setAuthCode] = useState("");
  const [warning, setWarning] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [displayAge, setDisplayAge] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [checkAuth, setCheckAuth] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (userData.userName === "") return "이름 공란";
        if (!/^[가-힣a-zA-Z]+$/.test(userData.userName)) return "이름 형식 오류";
        if (userData.email === "") return "이메일 공란";
        if (!isCodeSent) return "인증번호 미전송";
        if (isCodeSent && authCode === "") return "인증코드 미입력";
        return "";
      case 2:
        if (!userData.password) return "비밀번호 공란";
        if (!/^.{8,16}$/.test(userData.password)) return "비밀번호 자릿수 오류";
        if (!confirmPassword) return "비밀번호 재확인 공란";
        if (userData.password !== confirmPassword) return "비밀번호 확인 불일치";
        return "";
      case 4:
          if(userData.gender === "") return "성별 미입력"
      case 3:
        if (userData.userAge === "") return "생년월일 미입력";
        return "";
      case 6:
        if (userData.latitude === "" || userData.longitude === "") return "위치 정보 미수집";
        return "";
      default:
        return "";
    }
  };

  const continueClick = () => {
    const validationWarning = validateStep();
    if (validationWarning) {
      setWarning(validationWarning);
      return;
    }
    setWarning("");
    if (step < 8) {
      setStep(step + 1);
    } else {
      sendDataToServer(userData);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isValidEmail = (email) => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const koreanDateString = koreanDate.toISOString().split('T')[0];
    setUserData({ ...userData, userAge: koreanDateString });

    const age = calculateAge(koreanDate);
    setDisplayAge(age);
    hideDatePicker();
  };

  useEffect(() => { // 인증 관련 상태 초기화
    if (step === 1) {
      setIsCodeSent(false);
      setAuthCode("");
      setTimer(300);
      setCanResend(false);
      setResendTimer(60);
      setCheckAuth(false);
    }
  }, [step]);

  const calculateAge = (birthdate) => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return age;
  };

  const updateTimeRange = (newTimeRange) => setUserData({ ...userData, timeRange: newTimeRange });

  const handleConfirmPasswordChange = (value) => setConfirmPassword(value);

  const sendDataToServer = async (userData) => {
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', userData);
      console.log("백엔드로 전송", response.data);
  
      // 응답 헤더에서 토큰 추출
      const token = response.headers['Authorization'];
  
      if (token) {
        // 성공적으로 서버에 데이터 전송 후, 로컬 스토리지에 저장
        await SecureStore.setItemAsync('userEmail', userData.email);
        await SecureStore.setItemAsync('userPassword', userData.password);
        await SecureStore.setItemAsync('userToken', token);
        console.log("로컬 스토리지에 저장 완료");
      } else {
        console.error('토큰이 응답 헤더에 포함되어 있지 않습니다.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const sendEmailToServer = async (email, userName) => {
    if (!isValidEmail(userData.email)) {
      setWarning("이메일 정규식 오류");
      return;
    }
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', { email, userName });
      console.log("이메일 전송 성공:", response.data);
      setIsCodeSent(true);
      setWarning("");
      sendEmailAuth();
    } catch (error) {
      console.error('이메일 전송 실패:', error);
    }
  };

  const handleEmailButtonPress = () => {
    if (!isCodeSent) {
      sendEmailToServer(userData.email, userData.userName);
      startCountdowns();  // 이메일 인증 버튼을 눌렀을 때 카운트다운 시작
    } else if (canResend) {
      resendAuthCode();
    }
  };

  const verifyCode = async () => { // 인증 코드 유효성 검사.
    try {
      const response = await axios.get(`http://172.30.1.76:3000/codes?email=${encodeURIComponent(userData.email)}&checkCode=${encodeURIComponent(authCode)}`);
      console.log("인증 코드 확인 결과:", response.data);
      if (response.data.valid) {
        setCheckAuth(true);
        setWarning("");
        console.log("인증 성공!");
      } else {
        setWarning("인증코드 불일치");
      }
    } catch (error) {
      console.error('인증 코드 확인 실패:', error);
    }
  };  

  const sendEmailAuth = () => {
    setIsCodeSent(true);
    setTimer(300);
  };

  const resendAuthCode = () => {
    if (!canResend) return;
    sendEmailAuth();
    setCanResend(false);
    setResendTimer(60);
  };

  const startCountdowns = () => {
    setTimer(300);
    setResendTimer(60);
    setCanResend(false);
  };

  useEffect(() => {
    let interval = null;
    if (isCodeSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsCodeSent(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCodeSent, timer]);
  
  useEffect(() => {
    let interval = null;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [canResend, resendTimer]);

  const handleLocationReceived = (latitude, longitude) => {
    setUserData({ ...userData, latitude, longitude });
    setLoadingLocation(false);
  };

  const handleGetLocation = () => setLoadingLocation(true);

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/logo.png')} />
      <View style={styles.inputBox}>
        {step === 1 && (
          <>
            <Text style={styles.text}>이름 & 이메일</Text>
            <TextInput
              placeholder="이름을 입력해주세요."
              value={userData.userName}
              onChangeText={(text) => handleChange("userName", text)}
              style={styles.input}
            />
            {warning === "이름 공란" && <Text style={styles.warningText}>이름을 입력해주세요.</Text>}
            {warning === "이름 형식 오류" && <Text style={styles.warningText}>이름엔 특수문자가 올 수 없습니다.</Text>}
            <TextInput
              placeholder="Email을 입력해주세요."
              value={userData.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
              keyboardType="email-address"
            />
            {warning === "이메일 공란" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
            {warning === "이메일 정규식 오류" && <Text style={styles.warningText}>올바른 이메일을 입력해주세요.</Text>}
            {warning === "인증번호 미전송" && <Text style={styles.warningText}>이메일 인증 버튼을 눌러주세요.</Text>}
            <Button
              title={!isCodeSent ? "이메일 인증" : (canResend ? "인증번호 재전송" : `재전송 가능까지 ${resendTimer}초`)}
              onPress={handleEmailButtonPress}
              color="#f194ff"
              disabled={isCodeSent && !canResend || userData.userName === ""}
            />
            {isCodeSent && (
              <>
                <TextInput
                  placeholder="인증번호를 입력해주세요."
                  value={authCode}
                  onChangeText={setAuthCode}
                  style={styles.input}
                  editable={timer !== 0}
                  keyboardType="default"
                />
                {warning === "인증코드 미입력" && <Text style={styles.warningText}>인증번호를 입력해주세요.</Text>}
                {warning === "인증코드 불일치" && <Text style={styles.warningText}>인증번호를 확인해주세요.</Text>}
                {timer === 0 && <Text style={styles.warningText}>인증 시간이 초과되었습니다. 다시 인증해주세요.</Text>}
                <Text style={styles.description}>남은 시간: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</Text>
                <Button title="인증 번호 확인" onPress={verifyCode} />
              </>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.text}>PASSWORD</Text>
            <Text style={styles.description}>비밀번호를 등록해주세요!</Text>
            <TextInput
              placeholder="비밀번호를 입력해주세요."
              value={userData.password}
              onChangeText={(text) => handleChange("password", text)}
              style={styles.input}
              secureTextEntry
            />
            {warning === "비밀번호 공란" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}
            {warning === "비밀번호 자릿수 오류" && <Text style={styles.warningText}>비밀번호는 8~16자리로 구성해주세요.</Text>}
            <TextInput
              placeholder="비밀번호를 다시 입력해주세요."
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              style={styles.input}
              secureTextEntry
            />
            {warning === "비밀번호 재확인 공란" && <Text style={styles.warningText}>비밀번호 확인을 입력해주세요.</Text>}
            {warning === "비밀번호 확인 불일치" && <Text style={styles.warningText}>비밀번호가 일치하지 않습니다.</Text>}
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.text}>생년월일</Text>
            <Text style={styles.description}>같은 연령대의 친구들을 추천해드려요!</Text>
            <TextInput
              placeholder="Year / Month / Day"
              value={userData.userAge}
              style={styles.input}
              editable={false}
            />
            {warning === "생년월일 미입력" && <Text style={styles.warningText}>생년월일을 입력해주세요.</Text>}
            <Button title="Show Date Picker" onPress={showDatePicker} />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              locale="ko"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
            {displayAge !== "" && (
              <>
                <Text style={{ fontSize: hp(6), fontWeight: "bold" }}>만 {`${displayAge}세`}</Text>
                <Text style={{ fontSize: hp(2.5) }}>친구들의 일상을 볼 수 있어요!</Text>
              </>
            )}
          </>
        )}
        {step === 4 && (
          <>
            <Text style={styles.text}>성별</Text>
            <Text style={styles.description}>성별을 선택해주세요!</Text>
            <View style={styles.sexBtnWrap}>
              <Pressable
                onPress={() => {
                  setUserData({ ...userData, gender: 0 });
                  setWarning("남성 선택");
                }}
                style={styles.sexBtn}
              >
                <Text style={styles.sexBtnText}>남성</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setUserData({ ...userData, gender: 1 });
                  setWarning("여성 선택");
                }}
                style={styles.sexBtn}
              >
                <Text style={styles.sexBtnText}>여성</Text>
              </Pressable>
            </View>
            {warning === "성별 미입력" && <Text style={styles.warningText}>성별을 선택해주세요.</Text>}
            {warning === "남성 선택" && <Text style={styles.selectedText}>남성</Text>}
            {warning === "여성 선택" && <Text style={styles.selectedText}>여성</Text>}
          </>
        )}
        {step === 5 && (
          <>
            <Text style={styles.text}>알림을 활성화 해주세요.</Text>
            <Text style={styles.description}>게시물을 공유하거나, 투표를 받으면 알림으로 바로 알려드려요!</Text>
            <Notification />
          </>
        )}
        {step === 6 && (
          <>
            <Text style={styles.text}>위치 정보를 활성화 해주세요.</Text>
            <Text style={styles.description}>주변 친구들에게 노출될 수 있어요!</Text>
            {loadingLocation ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button title="Get Location" onPress={handleGetLocation} />
            )}
            <GetLocation onLocationReceived={handleLocationReceived} />
            {userData.latitude && userData.longitude && (
              <Text style={styles.locationText}>
                Latitude: {userData.latitude}, Longitude: {userData.longitude}
              </Text>
            )}
            {warning === "위치 정보 미수집" && <Text style={styles.warningText}>위치 정보를 활성화해주세요.</Text>}
          </>
        )}
        {step === 7 && (
          <>
            <Text style={styles.text}>언제 게시물을 작성할까요?</Text>
            <Text style={styles.description}>알림을 받고 게시물을 공유할 시간을 알려주세요!</Text>
            <SettingTime timeRange={userData.timeRange} setTimeRange={updateTimeRange} />
          </>
        )}
        {step === 8 && (
          <>
            <Text style={styles.text}>TrueEcho를 위한 준비가 끝났어요!</Text>
            <Text style={styles.description}>사람들을 만날 준비가 되었나요?{'\n'}바로 시작할게요!</Text>
          </>
        )}
      </View>
      <KeyboardAvoidingView style={styles.buttonContainer}>
        {step > 1 && (
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Text style={styles.btnText}>Back</Text>
          </Pressable>
        )}
        <Pressable style={styles.continueBtn} onPress={continueClick}>
          <Text style={styles.btnText}>{step < 8 ? "Continue" : "Finish"}</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: wp(10),
    paddingBottom: wp(0),
  },
  logo: {
    width: wp(50),
    height: hp(15),
    alignSelf: "center",
    marginBottom: hp(2), // 추가된 부분: 이미지 아래에 여백 추가
  },
  inputBox: {
    width: '100%', // 추가된 부분: inputBox가 가득 채우도록 설정
    flex: 1,
  },
  text: {
    fontWeight: "bold",
    fontSize: hp(4),
  },
  description: {
    fontSize: hp(2.5),
    marginTop: hp(1),
  },
  input: {
    width: wp(85),
    borderBottomWidth: 2,
    borderColor: "#3B4664",
    borderRadius: 5,
    paddingVertical: hp(1),
    marginTop: hp(2),
    fontSize: hp(3),
  },
  continueBtn: {
    backgroundColor: "#3B4664",
    width: wp(90),
    padding: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: 15,
    marginBottom: hp(1),
  },
  sexBtnWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(3),
  },
  sexBtn: {
    backgroundColor: '#3B4664',
    paddingVertical: wp(3),
    paddingHorizontal: wp(10),
    borderRadius: 15,
    marginHorizontal: wp(3),
    marginTop: hp(3),
  },
  sexBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(4),
  },
  btnText: {
    fontSize: hp(4),
    color: "#fff",
    fontWeight: "bold",
    textAlign: "left",
  },
  warningText: {
    color: "red",
    fontSize: hp(2),
    marginTop: hp(1),
  },
  backBtn: {
    backgroundColor: "#AAA",
    width: wp(90),
    padding: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: 15,
    marginBottom: hp(1),
  },
  selectedText: {
    fontSize: hp(5),
    fontWeight: "bold",
    marginTop: hp(3),
  },
  locationText: {
    fontSize: hp(2.5),
    marginTop: hp(1),
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: hp(2),
  },
});

export default SignUpForm;
