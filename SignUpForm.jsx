import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  StyleSheet,
  Image,
  Button,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import DateTimePickerModal from "react-native-modal-datetime-picker"; // 날짜 모달 라이브러리.


const SignUpForm = () => {
  const [step, setStep] = useState(1); // 페이지 상태.
  const [userData, setUserData] = useState({ // 유저 정보 객체
    email: "",
    id: "",
    password: "",
    userName: "",
    userAge: "",
    userSex: "",
  });
  const [authCode, setAuthCode] = useState(""); // 인증 번호 확인 절차는 회원가입 과정중 진행되므로 따로 다루기 위해 따로 선언. 
  const [warning, setWarning] = useState(""); // 에러 메시지의 유형을 세분화 해야함. 아직 미구현.
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // 모달이 현재 디스플레이 보여지고 있는지의 여부. 
  //------------------------------------------------------------------------
  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
  };

  const continueClick = () => { // 페이지 동작 관련 함수.
    if (step < 6) {
      if (step === 1) {
        if (userData.email === "") {
          setWarning("empty"); // 이메일이 공란인 경우 경고노출.
        } else if (!isValidEmail(userData.email)) {
          setWarning("Invalid"); // 이메일이 유효하지 않은 경우 경고노출.
        } else {
          setWarning(false); // 이메일이 유효하면 경고 해제.
          setStep(step + 1);
        }
      } else if (step === 3 && (userData.id === "" || userData.password === "")) {
        setWarning(true);
      } else if (step === 4 && userData.userName === "") {
        setWarning(true);
      } else if (step === 5 && userData.userAge === "") {
        setWarning("empty");
      } else {
        setStep(step + 1);
        setWarning(false);
      }
    } else {
      console.log("회원 가입 완료:", userData);
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
    console.log(date); // UTC 기준으로 출력됨
    const koreanDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // 한국 시간으로 변환.
    const koreanDateString = koreanDate.toISOString().slice(0, 10); // ISO 형식의 한국 시간 문자열로 변환.
    setUserData({ ...userData, userAge: koreanDateString }); // 한국 시간을 사용하여 userData 업데이트.
    setWarning("choose");
    hideDatePicker();
  };
  //------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.logo} source={require('./assets/logo.png')} />
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
            />
            {warning && <Text style={styles.warningText}>인증번호를 확인해주세요.</Text>}

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
            {warning && <Text style={styles.warningText}>아이디 중복검사 버튼을 눌러주세요.</Text>}
            <TextInput
              placeholder="비밀번호를 입력해주세요."
              value={userData.password}
              onChangeText={(text) => handleChange("password", text)}
              style={styles.input}
              secureTextEntry
            />
            {warning && <Text style={styles.warningText}>비밀번호가 틀렸습니다.</Text>}

            <TextInput
              placeholder="비밀번호를 다시 입력해주세요."
              value={userData.confirmPassword}
              onChangeText={(text) => handleChange("confirmPassword", text)}
              style={styles.input}
              secureTextEntry
            />
            {warning && <Text style={styles.warningText}>비밀번호가 일치하지 않습니다.</Text>}
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
              onChangeText={(text) => handleChange("userAge", text)}
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
            {warning === "choose" && <Text style={{ fontSize: hp(6), fontWeight: "bold", }}>만 {userData.userAge}세</Text>}
            {warning === "choose" && <Text style={{ fontSize: hp(2.5), }}>친구들의 일상을 볼 수 있어요!</Text>}
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
          {warning === "choose" && <Text style={{ fontSize: hp(2.5),marginTop:hp(3),fontSize:hp(5), fontWeight: "bold"}}>{userData.userSex}</Text>}
        </View>
        )}
      </View>
      <KeyboardAvoidingView >
        <Pressable style={styles.continueBtn} onPress={continueClick}>
          <Text style={styles.btnText}>
            {step < 6 ? "Continue" : "Finish"}
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
  sexBtnWrap:{
    flexDirection: "row",
    justifyContent: "center",
    marginTop:hp(3),
  },
  sexBtn: {
    backgroundColor: '#3B4664',
    paddingVertical: wp(3),
    paddingHorizontal: wp(10),
    borderRadius: 15, 
    marginHorizontal: wp(3),
    marginTop:hp(3),
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
});

export default SignUpForm;
