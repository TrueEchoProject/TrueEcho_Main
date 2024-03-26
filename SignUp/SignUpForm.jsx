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
  TouchableOpacity, //터치 가능한 투명한 영역을 만드는데 사용.
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePickerModal from "react-native-modal-datetime-picker"; // 날짜 모달 라이브러리.
import Notification from "./Notification";
import SettingTime from "./SettingTime";
import axios from 'axios'; // HTTP 통신 라이브러리. 
// import { auth } from '../FirebaseConfig'; // 파이어베이스 sdk 불러오는 코드. [백엔드랑 논의 필요함.]
// import { sendSignInLinkToEmail } from "firebase/auth"; // 파이어베이스의 이메일 인증 기능을 사용하기 위한 코드. [백엔드랑 논의 필요함.]


const SignUpForm = () => {
  const [step, setStep] = useState(1); // 페이지 상태.
  const [userData, setUserData] = useState({ // 유저 정보 객체
    email: "",
    id: "",
    password: "",
    userName: "",
    userAge: "",
    userSex: "",
    timeRange: [10, 20], // 멀티 슬라이드 초기 값. 
  });
  const [authCode, setAuthCode] = useState(""); // 인증 번호 확인 절차는 회원가입 과정중 진행되므로 따로 다루기 위해 따로 선언. 
  const [warning, setWarning] = useState(""); // 에러 메시지의 유형을 세분화 해야함. 
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // 모달이 현재 디스플레이 보여지고 있는지의 여부. 
  const [displayAge, setDisplayAge] = useState(""); // 모달이 현재 디스플레이 보여지고 있는지의 여부. 
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 전송했는지 여부.
  const [timer, setTimer] = useState(300); // 인증번호 입력 제한시간. 300초 = 5분
  const [canResend, setCanResend] = useState(false); // 재전송 가능 여부.
  const [resendTimer, setResendTimer] = useState(60); // 재전송 타이머 (60초)
  const [checkAuth,setCheckAuth] = useState(false); // 인증코드 통과 여부.
  //------------------------------------------------------------------------
  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
  };

  const continueClick = () => { // 페이지 동작 관련 함수.
    switch (step) {
      case 1:
        if (userData.email === "") {
          setWarning("empty"); // 이메일이 공란인 경우 경고노출.
        } else if (!isValidEmail(userData.email)) {
          setWarning("Invalid"); // 이메일이 유효하지 않은 경우 경고노출.
        } else {
          setWarning(false); // 이메일이 유효하면 경고 해제.
          setStep(step + 1);
          sendEmailToServer(userData.email); // 이메일 인증코드 제한시간 타이머 시작.
        }
        break;
      case 2:
        if (authCode === "") {
          setWarning("AuthEmpty");
        } else {
          // verifyCode(authCode);
          // if (checkAuth) {
          //   setStep(step + 1);
          //   setWarning(false);
          // }
          setStep(step + 1);
          setWarning(false);
        }
        break;
      case 3:
        if (!userData.id) {
          setWarning("idEmpty");
        } else if (!userData.password) {
          setWarning("passwordEmpty");
        } else if (userData.password && !userData.confirmPassword) {
          setWarning("confirmPasswordEmpty");
        } else if (userData.password !== userData.confirmPassword) {
          setWarning("passwordMismatch");
        } else {
          setStep(step + 1);
          setWarning("");
        }
        break;
      case 4:
        if (userData.userName === "") {
          setWarning(true);
        } else {
          setStep(step + 1);
          setWarning(false);
        }
        break;
      case 5:
        if (userData.userAge === "") {
          setWarning("empty");
        } else {
          setStep(step + 1);
          setWarning(false);
        }
        break;
      case 6:
      case 7:
      case 8:
        // 성별 선택 후 다음 단계로 넘어가는 로직
        setStep(step + 1);
        setWarning(false);
        break;
      default:
        if (step < 9) {
          setStep(step + 1);
          setWarning(false);
        } else {
          // console.log("회원 가입 완료:", userData);
          sendDataToServer(userData);
        }
        break;
    }
  };

  const goBack = () => { // 뒤로가기 버튼 클릭시 호출. 
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isValidEmail = (email) => { // 이메일 정규식.
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return emailRegex.test(email); // test는 정규식을 보고 불리언 값을 반환함. 
  };

  const showDatePicker = () => { // 날짜 모달 열기.
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => { // 날짜 모달 닫기.
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.log("A date has been picked: ", date);
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // 한국 시간으로 변환
    const koreanDateString = koreanDate.toISOString().split('T')[0]; // 'yyyy-mm-dd' 형식으로 변환
    setUserData({ ...userData, userAge: koreanDateString }); // userData 업데이트

    const age = calculateAge(koreanDate); // 현재 나이 계산 함수 호출
    setDisplayAge(age);
    hideDatePicker();
  };

  const calculateAge = (birthdate) => { // 유저 현재 나이 계산 함수. 
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    return age;
  };

  const updateTimeRange = (newTimeRange) => {
    setUserData({ ...userData, timeRange: newTimeRange });
  };

  const sendDataToServer = async (userData) => { // 가상 서버로 회원가입 과정에서 수집한 유저 데이터 (userData) 전송. 
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', userData);
      console.log("백엔드로 전송", response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const checkUserId = () => { // 아이디 중복 테스트. db.json에 있는 아이디와 비교함. 
    console.log('Checking user ID:', userData.id);
    axios.get(`http://172.30.1.76:3000/users?userId=${userData.id}`) // get으로 목록을 조회.
      .then(response => {
        console.log('Response data:', response.data); // 응답 데이터 로깅
        if (response.data.length > 0) { //get을 통해 무언가 반환이 되면, 중복이므로 중복 알림 표시.
          alert('이미 사용 중인 아이디입니다.');
          setWarning('이미 사용 중인 아이디입니다.');
        } else { // 빈배열이 반환되면 중복이 아니므로 사용가능 알림 표시. 
          alert('사용 가능한 아이디입니다.');
          setWarning('');
        }
      })
      .catch(error => { // 에러처리.
        console.error('Error:', error);
      });
  };

  const sendEmailToServer = async (email) => {
    try {
      // 백엔드로 이메일만 전송합니다. 이 예시에서는 POST 메서드를 사용하고 있습니다.
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        email: email,
      });
      console.log("이메일 전송 성공:", response.data);
      sendEmailAuth(); // 인증코드 타이머 시작.
    } catch (error) {
      console.error('이메일 전송 실패:', error);
    }
  };

  const verifyCode = async (code) => {
    try {
      const response = await axios.get(`http://172.30.1.76:3000/codes?code=${code}`);
      console.log("인증 코드 확인 결과:", response.data);

      if (response.data.valid) {
        setCheckAuth(true); // 인증코드 통과
        console.log("인증 성공!");
        // 인증 성공에 따른 처리를 여기에 추가
      } else {
        console.log("인증 실패: 유효하지 않은 코드입니다.");
      }
    } catch (error) {
      console.error('인증 코드 확인 실패:', error);
    }
  };


  const sendEmailAuth = () => { // 인증코드가 담긴 이메일이 전송되면 이 함수를 실행. 
    setIsCodeSent(true); // 인증코드를 보냈다고 상태 변경.
    setTimer(300); // 타이머를 5분으로 재설정합니다.
  };

  const resendAuthCode = () => { // 인증코드 재전송 함수.
    if (!canResend) return; // 재전송이 불가능하면 함수 종료

    sendEmailAuth(); // 인증번호 전송 함수 호출.
    setCanResend(false); // 재전송 가능 상태를 false로 설정.
    setResendTimer(60); // 재전송 타이머를 60초로 재설정.
  };
  //------------------------------------------------------------------------
  useEffect(() => { // 인증코드 입력에 대한 제한시간 타이머. 
    let interval = null;

    if (isCodeSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1); //Timer의 값을 -1씩 감소시킴. 
      }, 1000); // 1000 = 1초. 1초마다.
    } else if (timer === 0) { // Timer의 값이 0이 되면 타이머 종료.  
      setIsCodeSent(false);
      clearInterval(interval);
    }

    return () => clearInterval(interval); // 컴포넌트가 언마운트 되었을때도 타이머 종료. 
  }, [isCodeSent, timer]); // 둘중 하나라도 변경이 있을 경우 타이머 실행 if 확인. 

  useEffect(() => { // 인증코드의 무분별한 재전송을 방지하는 타이머. 
    let interval = null;

    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true); // 타이머가 0에 도달하면 재전송 가능 상태로 설정
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [canResend, resendTimer]);
  //------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
        {step === 1 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>Email 입력</Text>
            <Text style={styles.description}>가입하기 위해서 Email이 필요해요!</Text>
            <TextInput
              placeholder=" Email을 입력해주세요."
              value={userData.email}
              onChangeText={(text) => handleChange("email", text)}
              style={styles.input}
            />
            {warning === "empty" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
            {warning === "Invalid" && <Text style={styles.warningText}>올바른 이메일을 입력해주세요.</Text>}
          </View>
        )}
        {step === 2 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>인증번호 입력</Text>
            <Text style={styles.description}>인증번호를 입력해주세요!</Text>
            <TextInput
              placeholder="인증번호를 입력해주세요."
              value={authCode}
              onChangeText={setAuthCode}
              style={styles.input}
              editable={timer !== 0}
            />
            {warning && <Text style={styles.warningText}>인증번호를 확인해주세요.</Text>}
            {timer === 0 && <Text style={styles.warningText}>인증 시간이 초과되었습니다. 다시 인증해주세요.</Text>}
            <Text style={styles.description}>인증번호를 입력해주세요! 남은 시간: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</Text>
            <Button
              title={canResend ? "인증번호 재전송" : `재전송 가능까지 ${resendTimer}초`}
              onPress={resendAuthCode}
              color="#f194ff"
              disabled={!canResend}
            />
            <Text style={styles.description}>Email</Text>
            <TextInput
              placeholder={userData.email}
              style={styles.input}
              editable={false}
            />
          </View>
        )}
        {step === 3 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>ID & PW</Text>
            <Text style={styles.description}>아이디와 비밀번호를 등록해주세요!</Text>
            <TextInput
              placeholder="ID를 입력해주세요."
              value={userData.id}
              onChangeText={(text) => handleChange("id", text)}
              style={styles.input}
            />
            <Button title="중복 확인" onPress={checkUserId} />
            {warning === "idEmpty" && <Text style={styles.warningText}>아이디를 입력해주세요.</Text>}

            <TextInput
              placeholder="비밀번호를 입력해주세요."
              value={userData.password}
              onChangeText={(text) => handleChange("password", text)}
              style={styles.input}
              secureTextEntry
            />
            {warning === "passwordEmpty" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}

            <TextInput
              placeholder="비밀번호를 다시 입력해주세요."
              value={userData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              style={styles.input}
              secureTextEntry
            />
            {warning === "confirmPasswordEmpty" && <Text style={styles.warningText}>비밀번호 확인을 입력해주세요.</Text>}
            {warning === "passwordMismatch" && <Text style={styles.warningText}>비밀번호가 일치하지 않습니다.</Text>}
          </View>
        )}
        {step === 4 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>이름</Text>
            <Text style={styles.description}>친구들이 부를 이름을 정해주세요!</Text>
            <TextInput
              placeholder="이름을 입력해주세요."
              value={userData.userName}
              onChangeText={(text) => handleChange("userName", text)}
              style={styles.input}
            />
            {warning && <Text style={styles.warningText}>이름을 입력해주세요.</Text>}
            <Text style={{ marginTop: hp(1), color: "#aaa" }}>나중에 바꿀 수 있어요!</Text>
          </View>
        )}
        {step === 5 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>생년월일</Text>
            <Text style={styles.description}>같은 연령대의 친구들을 추천해드려요!</Text>

            <TextInput
              placeholder="Year / Month / Day"
              value={userData.userAge}
              // onChangeText={(text) => handleChange("userAge", text)}
              style={styles.input}
              editable={false}
            />

            {warning === "empty" && <Text style={styles.warningText}>생년월일을 입력해주세요.</Text>}
            <View>
              <Button title="Show Date Picker" onPress={showDatePicker} />
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View>

            {displayAge && <Text style={{ fontSize: hp(6), fontWeight: "bold", }}>만 {displayAge}세</Text>}
            {displayAge && <Text style={{ fontSize: hp(2.5), }}>친구들의 일상을 볼 수 있어요!</Text>}
          </View>
        )}
        {step === 6 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>성별</Text>
            <Text style={styles.description}>성별을 선택해주세요!</Text>
            <View style={styles.sexBtnWrap}>
              <Pressable
                onPress={() => {
                  setUserData({ ...userData, userSex: "남성" });
                  setWarning("choose");
                }}
                style={styles.sexBtn}
              >
                <Text style={styles.sexBtnText}>남성</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setUserData({ ...userData, userSex: "여성" });
                  setWarning("choose");
                }}
                style={styles.sexBtn}
              >
                <Text style={styles.sexBtnText}>여성</Text>
              </Pressable>
            </View>
            {warning === "choose" && <Text style={{ fontSize: hp(2.5), marginTop: hp(3), fontSize: hp(5), fontWeight: "bold" }}>{userData.userSex}</Text>}
          </View>
        )}
        {step === 7 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>알림을 활성화 해주세요.</Text>
            <Text style={styles.description}>게시물을 공유하거나, 투표를 받으면 알림으로 바로 알려드려요!</Text>
            <Notification />
          </View>
        )}
        {step === 8 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>언제 게시물을 작성할까요?</Text>
            <Text style={styles.description}>알림을 받고 게시물을 공유할 시간을 알려주세요!</Text>
            <SettingTime timeRange={userData.timeRange} setTimeRange={updateTimeRange} />
          </View>
        )}
        {step === 9 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>TrueEcho를 위한 준비가 끝났어요!</Text>
            <Text style={styles.description}>사람들을 만날 준비가 되었나요?{'\n'}바로 시작할게요!</Text>
          </View>
        )}
      </View>
      <KeyboardAvoidingView >
        {step > 1 && ( // Step 1에서는 뒤로 가기 버튼이 보이지 않음.
          <Pressable style={styles.backBtn} onPress={goBack}>
            <Text style={styles.btnText}>Back</Text>
          </Pressable>
        )}
        <Pressable style={styles.continueBtn} onPress={continueClick}>
          <Text style={styles.btnText}>
            {step < 9 ? "Continue" : "Finish"}
          </Text>
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
  logo: { // 로고 이미지.
    width: wp(50),
    height: hp(15),
    alignSelf: "center"
  },
  inputBox: { // 인풋 박스
    marginTop: hp(2),
  },
  text: {
    fontWeight: "bold",
    fontSize: hp(4),
  },
  description: {
    fontSize: hp(2.5),
    marginTop: hp(1),
  },
  input: { // 인풋
    width: wp(85),
    // height: hp(7),
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
});

export default SignUpForm;
