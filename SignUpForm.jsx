import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  StyleSheet,
  Image
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    email: "",
    id: "",
    password: "",
    userName: "",
    userAge: "",
    userSex: "",
  });
  const [authCode, setAuthCode] = useState("");
  const [warning, setWarning] = useState(false);

  const handleChange = (key, value) => {
    setUserData({ ...userData, [key]: value });
  };

  const continueClick = () => {
    if (step < 6) {
      if (step === 1 && userData.email === "") {
        setWarning(true); 
      } else if (step === 3 && (userData.id === "" || userData.password === "")) {
        setWarning(true); 
      } else if (step === 4 && userData.userName === "") {
        setWarning(true); 
      } else if (step === 5 && userData.userAge === "") {
        setWarning(true); 
      } else {
        setStep(step + 1);
        setWarning(false); // 경고 텍스트 off
      }
    } else {
      console.log("회원 가입 완료:", userData);
    }
  };

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
            {warning && <Text style={styles.warningText}>올바른 이메일을 입력해주세요.</Text>}
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
          </View>
        )}
        {step === 5 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>생년월일</Text>
            <Text style={styles.description}>같은 연령대의 친구들을 추천해드려요!</Text>
            <TextInput
              placeholder="생년월일을 입력해주세요."
              value={userData.userAge}
              onChangeText={(text) => handleChange("userAge", text)}
              style={styles.input}
            />
            {warning && <Text style={styles.warningText}>생년월일을 입력해주세요.</Text>}
          </View>
        )}
        {step === 6 && (
          <View style={styles.inputBox}>
            <Text style={styles.text}>성별</Text>
            <Text style={styles.description}>성별을 선택해주세요!</Text>
            <TextInput
              placeholder="성별을 입력해주세요."
              value={userData.userSex}
              onChangeText={(text) => handleChange("userSex", text)}
              style={styles.input}
            />
            {warning && <Text style={styles.warningText}>성별을 선택해주세요.</Text>}
          </View>
        )}
      </View>
      <KeyboardAvoidingView behavior="padding">
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
    alignSelf:"center"
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
