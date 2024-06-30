import React, { useState, useEffect, useRef } from "react";
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
  Modal,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Notification from "./Notification";
import GetLocation from './GetLocation';
import CustomDatePicker from "./CustomDatePicker";
import Api from '../Api';
import * as SecureStore from 'expo-secure-store';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native'; // useNavigation 훅을 임포트
import { LinearGradient } from 'expo-linear-gradient';

const SignUpForm = () => {
  const navigation = useNavigation(); // navigation 초기화
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    nickname: "",
    dob: "",
    gender: "",
    notificationTime: "",
    y: "",
    x: "",
    name: "",
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
  const [selectedNotificationTime, setSelectedNotificationTime] = useState(null);
  // const [isNicknameValid, setIsNicknameValid] = useState(false); // 닉네임 중복검사 통과 여부.
  const [isAuthValid, setIsAuthValid] = useState(false); // 인증 여부 상태 변수 추가
  const [isSendingEmail, setIsSendingEmail] = useState(false); // 이메인 인증 로딩 인디케이터.
  const emailInputRef = useRef(null);


  const BackButton = () => (
    <Pressable style={styles.loginBtn} onPress={() => navigation.goBack()}>
      <Text style={styles.loginBtnText}>로그인</Text>
    </Pressable>
  );

  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
    if (key === "email" || key === "nickname") {
      setIsCodeSent(false);
      setAuthCode("");
      setTimer(300);
      setCanResend(false);
      setResendTimer(60);
      setCheckAuth(false);
      setIsAuthValid(false);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (userData.nickname === "") return "닉네임 미입력";
        if (userData.email === "") return "이메일 공란";
        if (!isCodeSent) return "인증번호 미전송";
        if (isCodeSent && authCode === "") return "인증코드 미입력";
        if (!isAuthValid) return "인증코드 미확인"; // 인증 통과 여부 추가 확인
        return "";
      case 2:
        if (!userData.password) return "비밀번호 공란";
        if (!/^.{8,16}$/.test(userData.password)) return "비밀번호 자릿수 오류";
        if (!confirmPassword) return "비밀번호 재확인 공란";
        if (userData.password !== confirmPassword) return "비밀번호 확인 불일치";
        return "";
      case 3:
        if (userData.name === "") return "이름 공란";
        if (!/^[가-힣a-zA-Z]+$/.test(userData.name)) return "이름 형식 오류";
        return "";
      case 4:
        if (userData.dob === "") return "생년월일 미입력";
        return "";
      case 5:
        if (userData.gender === "") return "성별 미입력"
        return "";
      case 7:
        if (userData.y === "" || userData.x === "") return "위치 정보 미수집";
        return "";
      default:
        return "";
    }
  };

  const continueClick = async () => {
    const validationWarning = validateStep();
    if (validationWarning) {
      setWarning(validationWarning);
      return;
    }
    setWarning("");
    if (step < 9) {
      setStep(step + 1);
    } else {
      if (!loading) { // 로딩 중이 아닐 때만 실행
        setLoading(true);
        await sendDataToServer(userData);
        setLoading(false);
      }
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isValidEmail = (email) => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);


  const handleConfirm = (date) => {
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC 시간을 한국 시간으로 변환
    const koreanDateString = koreanDate.toISOString().split('T')[0];
    setUserData({ ...userData, dob: koreanDateString });

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

  const updateNotificationTime = (newNotificationTime) => {
    setUserData({ ...userData, notificationTime: newNotificationTime });
    setSelectedNotificationTime(newNotificationTime);
  };


  const handleConfirmPasswordChange = (value) => setConfirmPassword(value);

  const sendDataToServer = async (userData) => {
    try {
      const response = await Api.post('/accounts/register', userData);
      console.log("백엔드로 전송", response.data);
      if (response.data.code === "U001") {
        // 성공적으로 서버에 데이터 전송 후, 로컬 스토리지에 저장
        await SecureStore.setItemAsync('userEmail', userData.email);
        await SecureStore.setItemAsync('userPassword', userData.password);
        await SecureStore.setItemAsync('y', String(userData.y)); // 유저 위치를 캐싱.
        await SecureStore.setItemAsync('x', String(userData.x)); // 유저 위치를 캐싱.
        console.log("로컬 스토리지에 저장 완료");

        // 로컬에 저장된 값 확인
        const storedEmail = await SecureStore.getItemAsync('userEmail');
        const storedPassword = await SecureStore.getItemAsync('userPassword');
        const storedy = await SecureStore.getItemAsync('y');
        const storedx = await SecureStore.getItemAsync('x');

        console.log("Stored Email:", storedEmail);
        console.log("Stored Password:", storedPassword);
        console.log("Stored y:", storedy);
        console.log("Stored x:", storedx);

        console.log("서버로 보낸 데이터:", userData); // 보낸 데이터 확인.

        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });

      } else {
        console.error('회원가입 실패.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };



  const sendEmailToServer = async (email) => {
    if (!isValidEmail(email)) {
      setWarning("이메일 정규식 오류");
      return;
    }
    setIsSendingEmail(true);  // 로딩 시작
    try {
      const response = await Api.get(`/accounts/email/duplication?nickname=${userData.nickname}&email=${email}`, {});

      if (response.data.code === "U001") {
        setWarning("이메일 중복"); // "중복된 계정입니다." 메시지 설정
      } else {
        console.log("이메일 전송 성공:", response.data);
        setIsCodeSent(true);
        setWarning("");
        sendEmailAuth();
      }
    } catch (error) {
      console.error('이메일 전송 실패:', error.response ? error.response.data : error.message);
    } finally {
      setIsSendingEmail(false);  // 로딩 종료
    }
  };

  const handleEmailButtonPress = async () => {
    if (isSendingEmail) return; // 이미 요청 중이라면 아무 작업도 하지 않음
  
    if (!isCodeSent) {
      setIsSendingEmail(true);  // 요청 시작 시 버튼 비활성화
      await sendEmailToServer(userData.email);
      emailInputRef.current.blur();
      startCountdowns();  // 이메일 인증 버튼을 눌렀을 때 카운트다운 시작
      setIsSendingEmail(false);  // 요청 완료 시 버튼 활성화
    } else if (canResend) {
      resendAuthCode();
    }
  };
  
  const verifyCode = async () => {
    console.log("인증 코드 확인 시도"); // 디버깅용 로그 추가
    try {
      const response = await Api.get(`/accounts/checkcode`, {
        params: {
          email: userData.email,
          checkCode: authCode
        }
      });
      console.log("인증 코드 확인 결과:", response.data);
      if (response.data.message === "이메일 인증에 성공했습니다.") { // 서버에서 반환하는 상태 코드 확인
        setCheckAuth(true);
        setIsAuthValid(true); // 인증 통과 여부 설정
        setWarning("인증번호 인증 성공");
      } else {
        setWarning("인증코드 불일치");
        setIsAuthValid(false); // 인증 실패 시 설정
      }
    } catch (error) {
      console.error('인증 코드 확인 실패:', error);
      setIsAuthValid(false); // 인증 실패 시 설정
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
    setUserData({ ...userData, y: latitude, x: longitude });
    setLoadingLocation(false);
  };
  const handleGetLocation = () => {
    setLoadingLocation(true);
  };

  return (
    <View style={styles.container}>
      <BackButton />
      {step !== 7 && <Image style={styles.logo} source={require('../assets/logo.png')} />}
      <View style={styles.inputBox}>
        {step === 1 && (
          <>
            <Text style={styles.text}>닉네임</Text>
            <TextInput
              placeholder="닉네임을 입력해주세요."
              value={userData.nickname}
              onChangeText={(text) => {
                handleChange("nickname", text);
                // setIsNicknameValid(false); // 닉네임 변경 시 유효성 초기화
              }}
              style={styles.input}
              placeholderTextColor="#ccc"
            />
            {warning === "닉네임 미입력" && <Text style={styles.warningText}>닉네임를 입력해주세요.</Text>}
            {warning === "닉네임 중복검사 미통과" && <Text style={styles.warningText}>닉네임 중복검사를 통과해주세요.</Text>}
            <Text style={styles.text}>이메일</Text>
            <TextInput
              placeholder="Email을 입력해주세요."
              value={userData.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
              keyboardType="email-address"
              ref={emailInputRef}
              placeholderTextColor="#ccc"
            />
            {warning === "이메일 공란" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
            {warning === "이메일 정규식 오류" && <Text style={styles.warningText}>올바른 이메일을 입력해주세요.</Text>}
            {warning === "인증번호 미전송" && <Text style={styles.warningText}>이메일 인증 버튼을 눌러주세요.</Text>}
            {warning === "이메일 중복" && <Text style={styles.warningText}>이미 생성된 계정이 있습니다.</Text>}
            <Pressable
              onPress={handleEmailButtonPress}
              style={({ pressed }) => [
                styles.authBtn, // 스타일 클래스 사용
                (isCodeSent && !canResend || userData.nickname === "") && styles.disabledBtn,
                pressed && styles.pressedBtn // 버튼을 눌렀을 때의 스타일
              ]}
              disabled={isCodeSent && !canResend || userData.nickname === ""}
            >
              <Text style={styles.btnText2}>{!isCodeSent ? "인증" : (canResend ? "인증번호 재전송" : `재전송 ${resendTimer}초`)}</Text>
            </Pressable>
            {isCodeSent && (
              <>
                <TextInput
                  placeholder="인증번호를 입력해주세요."
                  value={authCode}
                  onChangeText={setAuthCode}
                  style={styles.input}
                  editable={timer !== 0}
                  keyboardType="default"
                  placeholderTextColor="#ccc"
                />
                {warning === "인증코드 미입력" && <Text style={styles.warningText}>인증번호를 입력해주세요.</Text>}
                {warning === "인증코드 불일치" && <Text style={styles.warningText}>인증번호를 확인해주세요.</Text>}
                {warning === "인증번호 인증 성공" && <Text style={styles.successText}>인증 성공! 다음으로 넘어가주세요.</Text>}
                {timer === 0 && <Text style={styles.warningText}>인증 시간이 초과되었습니다. 다시 인증해주세요.</Text>}
                <View style={styles.rowContainer}>
                  <Text style={styles.description}>남은 시간: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</Text>
                  <Pressable
                    onPress={verifyCode}
                    style={[
                      styles.authBtn, // 스타일 클래스 사용
                      !authCode && styles.disabledBtn, // 인풋이 빈칸일 때
                      { alignSelf: 'flex-end' } // 인증번호 확인 버튼도 오른쪽 정렬
                    ]}
                    disabled={!authCode || isAuthValid} // 인증이 성공했을 때 비활성화
                  >
                    <Text style={styles.btnText2}>인증 번호 확인</Text>
                  </Pressable>
                </View>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.text}>비밀번호</Text>
            <TextInput
              placeholder="비밀번호를 입력해주세요."
              value={userData.password}
              onChangeText={(text) => handleChange("password", text)}
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#ccc"
            />
            {warning === "비밀번호 공란" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}
            {warning === "비밀번호 자릿수 오류" && <Text style={styles.warningText}>비밀번호는 8~16자리로 구성해주세요.</Text>}
            <Text style={styles.text}>비밀번호확인</Text>
            <TextInput
              placeholder="비밀번호를 다시 입력해주세요."
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#ccc"
            />
            {warning === "비밀번호 재확인 공란" && <Text style={styles.warningText}>비밀번호 확인을 입력해주세요.</Text>}
            {warning === "비밀번호 확인 불일치" && <Text style={styles.warningText}>비밀번호가 일치하지 않습니다.</Text>}
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.text}>이름</Text>
            <TextInput
              placeholder="이름을 입력해주세요."
              value={userData.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
              placeholderTextColor="#ccc"
            />
            {warning === "이름 공란" && <Text style={styles.warningText}>이름을 입력해주세요.</Text>}
            {warning === "이름 형식 오류" && <Text style={styles.warningText}>이름엔 특수문자가 올 수 없습니다.</Text>}
          </>
        )}
        {step === 4 && (
          <>
            <Text style={styles.text}>연령대</Text>
            <Text style={styles.description}>같은 연령대의 친구들을 추천해드려요!</Text>
            {warning === "생년월일 미입력" && <Text style={styles.warningText}>생년월일을 입력해주세요.</Text>}
            <View style={styles.datePickerContainer}>
              <CustomDatePicker
                onConfirm={handleConfirm}
              />
            </View>
            {displayAge !== "" && (
              <>
                <Text style={{ fontSize: hp(4), fontWeight: "bold", color: "#fff" }}>만 {`${displayAge}세`}</Text>
              </>
            )}
          </>
        )}

        {step === 5 && (
          <>
            <Text style={styles.text}>성별</Text>
            <View style={styles.sexBtnWrap}>
              <Pressable
                onPress={() => {
                  setUserData({ ...userData, gender: 0 });
                  setWarning("남성 선택");
                }}
                style={styles.sexBtnContainer}
              >
                <LinearGradient
                  colors={userData.gender === 0 ? ['#1BC5DA', '#263283'] : ['#FFFFFF', '#FFFFFF']}
                  style={styles.sexBtn}
                >
                  <Text style={[styles.sexBtnText, userData.gender === 0 && styles.selectedSexBtnText]}>남성</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={() => {
                  setUserData({ ...userData, gender: 1 });
                  setWarning("여성 선택");
                }}
                style={styles.sexBtnContainer}
              >
                <LinearGradient
                  colors={userData.gender === 1 ? ['#1BC5DA', '#263283'] : ['#FFFFFF', '#FFFFFF']}
                  style={styles.sexBtn}
                >
                  <Text style={[styles.sexBtnText, userData.gender === 1 && styles.selectedSexBtnText]}>여성</Text>
                </LinearGradient>
              </Pressable>
            </View>
            {warning === "성별 미입력" && <Text style={styles.warningText}>성별을 선택해주세요.</Text>}
            {warning === "남성 선택" && <Text style={styles.selectedText}>남성</Text>}
            {warning === "여성 선택" && <Text style={styles.selectedText}>여성</Text>}
          </>
        )}
        {step === 6 && (
          <>
            <Text style={styles.text}>알림을 활성화 해주세요.</Text>
            <Text style={styles.description}>게시물을 공유하거나, 투표를 받으면 알림으로 바로 알려드려요!</Text>
            <Notification />
          </>
        )}
        {step === 7 && (
          <>
            {userData.y && userData.x && (
              <>
                <View style={styles.mapContainer}>
                  <MapView
                    provider={PROVIDER_GOOGLE} // Google Maps를 사용하도록 설정
                    style={styles.map}
                    initialRegion={{
                      latitude: parseFloat(userData.y),
                      longitude: parseFloat(userData.x),
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: parseFloat(userData.y),
                        longitude: parseFloat(userData.x),
                      }}
                    />
                  </MapView>
                </View>
              </>
            )}
            {loadingLocation ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? '#d1d1d1' : '#fff',
                    padding: 10,
                    borderRadius: 10,
                    marginVertical: 10,
                    alignItems: 'center',
                  },
                  styles.button, // 버튼 스타일 추가
                ]}
                onPress={handleGetLocation}
              >
                <Text style={styles.TimeButtonText}>
                  {userData.y && userData.x ? "새고고침" : "위치 불러오기"}
                </Text>
              </Pressable>
            )}
            <GetLocation onLocationReceived={handleLocationReceived} refresh={loadingLocation} />
            <Text style={styles.text}>위치정보</Text>
            <Text style={styles.description}>현재 위치를 기반으로 게시물을 보여드려요!</Text>
            {warning === "위치 정보 미수집" && <Text style={styles.warningText}>위치 정보를 활성화해주세요.</Text>}
          </>
        )}

        {step === 8 && (
          <>
            <Text style={styles.text}>알림시간</Text>
            <Text style={styles.description}>알림을 받고 게시물을 공유할 시간을 알려주세요!</Text>
            <View style={styles.buttonContainer}>
              {['00 ~ 07', '07 ~ 12', '12 ~ 15', '15 ~ 18', '18 ~ 21', '21 ~ 24'].map((time, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => updateNotificationTime(index)}
                >
                  {selectedNotificationTime === index ? (
                    <LinearGradient
                      colors={['#1BC5DA', '#263283']}
                      style={styles.timeButton}
                    >
                      <Text style={styles.selectedButtonText}>{time}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.timeButton, styles.unselectedButton]}>
                      <Text style={styles.btnText2}>{time}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 9 && (
          <>
            <Text style={styles.text}>TrueEcho를 위한 준비가 끝났어요!</Text>
            <Text style={styles.description}>사람들을 만날 준비가 되었나요?{'\n'}바로 시작할게요!</Text>
          </>
        )}
      </View>
      <KeyboardAvoidingView style={styles.buttonContainer}>
        {step > 1 && (
          <Pressable style={styles.backBtn} onPress={goBack} disabled={loading}>
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        )}
        {step < 9 ? (
          <Pressable style={styles.continueBtn} onPress={continueClick} disabled={loading}>
            <Text style={styles.btnText}>{step < 9 ? "Continue" : "지금 만나러 가기!"}</Text>
          </Pressable>
        ) : (
          <LinearGradient
            colors={['#1BC5DA', '#263283']}
            style={styles.continueBtn}
          >
            <Pressable style={styles.gradientButtonContent} onPress={continueClick} disabled={loading}>
              <Text style={styles.finBtnText}>{step < 9 ? "Continue" : "지금 만나러 가기!"}</Text>
            </Pressable>
          </LinearGradient>
        )}
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
    backgroundColor: "black"
    // backgroundColor: "#fff"
  },
  logo: {
    width: wp(50),
    height: hp(20),
    alignSelf: "center",
    // marginBottom: hp(2),
  },
  inputBox: {
    width: '100%',
    flex: 1,
  },
  text: {
    fontWeight: "bold",
    fontSize: hp(2.5),
    color: "#fff",
    marginTop: hp(4),
  },
  description: {
    fontSize: hp(2),
    marginVertical: hp(2),
    color: "#fff"
  },
  input: {
    width: wp(85),
    borderBottomWidth: 1,
    borderColor: "#fff",
    paddingVertical: hp(2),
    // marginTop: hp(2),
    fontSize: hp(2),
    color: "#fff"
  },
  continueBtn: {
    backgroundColor: "#fff",
    width: wp(90),
    padding: wp(5),
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
    backgroundColor: '#fff',
    paddingVertical: wp(5),
    paddingHorizontal: wp(15),
    borderRadius: 15,
    marginHorizontal: wp(3),
    marginTop: hp(3),
  },
  sexBtnText: {
    color: "black",
    fontWeight: "bold",
    fontSize: hp(2.5),
  },
  selectedSexBtnText: {
    color: '#fff', // 선택된 버튼의 폰트 색상을 흰색으로 변경
  },
  selectedButtonText: {
    color: '#fff', // 선택된 버튼의 텍스트 색상을 흰색으로 변경
    fontWeight: 'bold',
    fontSize: hp(2),
  },
  btnText: {
    fontSize: hp(2.5),
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  finBtnText: {
    fontSize: hp(2.5),
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  btnText2: {
    fontSize: hp(2),
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  warningText: {
    color: "red",
    fontSize: hp(2),
    marginTop: hp(1),
  },
  successText: {
    color: "green",
    fontSize: hp(2),
    marginTop: hp(1),
  },
  backBtn: {
    // backgroundColor: "#fff",
    // width: wp(90),
    padding: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: 15,
    marginBottom: hp(1.5),

  },
  selectedText: {
    fontSize: hp(5),
    fontWeight: "bold",
    marginTop: hp(3),
    color: "#fff"
  },
  locationText: {
    fontSize: hp(2.5),
    marginTop: hp(1),
  },
  mapContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    height: 250,
    marginBottom: hp(2),
  },
  mapContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    height: 250,
    marginBottom: hp(2),
    marginTop: hp(5),
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: hp(2),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timeButton: {
    backgroundColor: '#fff',
    paddingVertical: wp(5),
    paddingHorizontal: wp(10),
    borderRadius: 15,
    margin: wp(2),
    marginTop: hp(1),
    minWidth: wp(28),
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#f194ff',
  },
  TimeButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: hp(2),
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: hp(2),
  },

  loginBtn: {
    position: 'absolute',
    top: hp(4),
    left: wp(5),
    backgroundColor: 'transparent'
  },
  loginBtnText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: 'bold',
  },

  authBtn: {
    alignSelf: 'flex-end', // 오른쪽 정렬
    backgroundColor: '#fff',
    padding: wp(3), // 버튼 패딩 설정
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#aaa', // 비활성화된 버튼 색상
  },
  pressedBtn: {
    backgroundColor: '#fff', // 버튼을 눌렀을 때의 색상
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', // 필요한 경우 너비를 조정합니다.
    marginTop: 10, // 위에 간격 조정
  },
  backBtnText: {
    color: '#fff',
    fontSize: hp(2),
    textAlign: "center"
  },
  datePickerContainer: {
    marginBottom: hp(3),
  },

});

export default SignUpForm;