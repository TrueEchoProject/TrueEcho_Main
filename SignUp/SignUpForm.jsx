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
import GetLocation from './GetLocation';
import Api from '../Api';
import * as SecureStore from 'expo-secure-store';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native'; // useNavigation 훅을 임포트


const SignUpForm = () => {
  const navigation = useNavigation(); // navigation 초기화
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    nickname: "",
    dob: "",
    gender: "",
    notificationTime: "",
    latitude: "",
    longitude: "",
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
        if (userData.latitude === "" || userData.longitude === "") return "위치 정보 미수집";
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
  
  // const handleNickNameButtonPress = async () => {
  //   try {
  //     const nickname = encodeURIComponent(userData.nickname); // 닉네임 인코딩(닉네임이 한글이면 오류가 생길 수 있음?)
  //     const response = await Api.get(`/accounts/nickname/duplication?nickname=${nickname}`); // 확인 해야 함.
  //     console.log("닉네임 중복 검사 성공:", response.data);
  
  //     if (response.data.isDuplicate) {
  //       setIsNicknameValid(false); // 닉네임 중복 검사 실패
  //       setWarning("닉네임이 이미 사용 중입니다.");
  //     } else {
  //       setIsNicknameValid(true); // 닉네임 중복 검사 통과
  //       setWarning("");
  //     }
  //   } catch (error) {
  //     console.error('닉네임 중복 검사 실패:', error);
  //     setIsNicknameValid(false); // 닉네임 중복 검사 실패
  //     setWarning("닉네임 중복 검사 중 오류가 발생했습니다.");
  //   }
  // };
  
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
      
      // 응답 헤더에서 토큰 추출
      // const accessToken = response.headers['authorization'];
      // const refreshToken = response.headers['refresh-token']; // [수정필요] 어떻게 담겨서 올지 모름. 바꿔야 함.
      
      if (response.data.status === 200) {
        // 성공적으로 서버에 데이터 전송 후, 로컬 스토리지에 저장
        await SecureStore.setItemAsync('userEmail', userData.email);
        await SecureStore.setItemAsync('userPassword', userData.password);
        await SecureStore.setItemAsync('latitude', userData.latitude); // 유저 위치를 캐싱.
        await SecureStore.setItemAsync('longitude', userData.longitude); // 유저 위치를 캐싱.
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        console.log("로컬 스토리지에 저장 완료");
        
        // 로컬에 저장된 값 확인
        const storedEmail = await SecureStore.getItemAsync('userEmail');
        const storedPassword = await SecureStore.getItemAsync('userPassword');
        const storedLatitude = await SecureStore.getItemAsync('latitude');
        const storedLongitude = await SecureStore.getItemAsync('longitude');
        const storedAccessToken = await SecureStore.getItemAsync('accessToken');
        const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
        
        console.log("Stored Email:", storedEmail);
        console.log("Stored Password:", storedPassword);
        console.log("Stored Latitude:", storedLatitude);
        console.log("Stored Longitude:", storedLongitude);
        console.log("Stored AccessToken:", storedAccessToken);
        console.log("Stored RefreshToken:", storedRefreshToken);
        
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
    try {
      const response = await Api.get(`/accounts/email/duplication?nickname=${userData.nickname}&email=${email}`, {
      
      });
      console.log("이메일 전송 성공:", response.data);
      setIsCodeSent(true);
      setWarning("");
      sendEmailAuth();
    } catch (error) {
      console.error('이메일 전송 실패:', error.response ? error.response.data : error.message);
    }
  };
  
  
  const handleEmailButtonPress = () => {
    if (!isCodeSent) {
      sendEmailToServer(userData.email);
      startCountdowns();  // 이메일 인증 버튼을 눌렀을 때 카운트다운 시작
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
    setUserData({ ...userData, latitude, longitude });
    setLoadingLocation(false);
  };
  
  const handleGetLocation = () => {
    setLoadingLocation(true);
  };
  
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/logo.png')} />
      <View style={styles.inputBox}>
        {step === 1 && (
          <>
            <Text style={styles.text}>닉네임 & 이메일</Text>
            <TextInput
              placeholder="닉네임을 입력해주세요."
              value={userData.nickname}
              onChangeText={(text) => {
                handleChange("nickname", text);
                // setIsNicknameValid(false); // 닉네임 변경 시 유효성 초기화
              }}
              style={styles.input}
            />
            {warning === "닉네임 미입력" && <Text style={styles.warningText}>닉네임를 입력해주세요.</Text>}
            {warning === "닉네임 중복검사 미통과" && <Text style={styles.warningText}>닉네임 중복검사를 통과해주세요.</Text>}
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
              disabled={isCodeSent && !canResend || userData.nickname === ""}
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
                {warning === "인증번호 인증 성공" && <Text style={styles.successText}>인증 성공! 다음으로 넘어가주세요.</Text>}
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
            <Text style={styles.text}>이름</Text>
            <Text style={styles.description}>본명을 알려주세요! 친구 찾는 데 도움이 돼요.</Text>
            <TextInput
              placeholder="이름을 입력해주세요."
              value={userData.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
            />
            {warning === "이름 공란" && <Text style={styles.warningText}>이름을 입력해주세요.</Text>}
            {warning === "이름 형식 오류" && <Text style={styles.warningText}>이름엔 특수문자가 올 수 없습니다.</Text>}
          </>
        )}
        {step === 4 && (
          <>
            <Text style={styles.text}>생년월일</Text>
            <Text style={styles.description}>같은 연령대의 친구들을 추천해드려요!</Text>
            <TextInput
              placeholder="Year / Month / Day"
              value={userData.dob}
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
        {step === 5 && (
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
        {step === 6 && (
          <>
            <Text style={styles.text}>알림을 활성화 해주세요.</Text>
            <Text style={styles.description}>게시물을 공유하거나, 투표를 받으면 알림으로 바로 알려드려요!</Text>
            <Notification />
          </>
        )}
        {step === 7 && (
          <>
            <Text style={styles.text}>위치 정보를 활성화 해주세요.</Text>
            {loadingLocation ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <Button
                title={userData.latitude && userData.longitude ? "Refresh Location" : "Get Location"}
                onPress={handleGetLocation}
              />
            )}
            <GetLocation onLocationReceived={handleLocationReceived} refresh={loadingLocation} />
            {userData.latitude && userData.longitude && (
              <>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: parseFloat(userData.latitude),
                    longitude: parseFloat(userData.longitude),
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: parseFloat(userData.latitude),
                      longitude: parseFloat(userData.longitude),
                    }}
                  />
                </MapView>
              </>
            )}
            {warning === "위치 정보 미수집" && <Text style={styles.warningText}>위치 정보를 활성화해주세요.</Text>}
          </>
        )}
        
        
        {step === 8 && (
          <>
            <Text style={styles.text}>알림을 받고 게시물을 공유할 시간을 알려주세요!</Text>
            <View style={styles.buttonContainer}>
              {['00 ~ 07', '07 ~ 12', '12 ~ 15', '15 ~ 18', '18 ~ 21', '21 ~ 24'].map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeButton,
                    selectedNotificationTime === index && styles.selectedButton,
                  ]}
                  onPress={() => updateNotificationTime(index)}
                >
                  <Text style={styles.buttonText}>{time}</Text>
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
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Text style={styles.btnText}>Back</Text>
          </Pressable>
        )}
        <Pressable style={styles.continueBtn} onPress={continueClick}>
          <Text style={styles.btnText}>{step < 9 ? "Continue" : "Finish"}</Text>
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
    marginBottom: hp(2),
  },
  inputBox: {
    width: '100%',
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
  successText: {
    color: "green",
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
  map: {
    width: '100%',
    borderRadius: 30,
    height: 250,
  },
  
  timeButton: {
    backgroundColor: '#3B4664',
    paddingVertical: wp(3),
    paddingHorizontal: wp(10),
    borderRadius: 15,
    marginHorizontal: wp(3),
    marginTop: hp(1),
  },
  selectedButton: {
    backgroundColor: '#f194ff',
  },
  
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: hp(2),
  },
});

export default SignUpForm;