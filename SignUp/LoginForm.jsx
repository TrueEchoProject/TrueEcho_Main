// 제출시 ID값이 "11"로 고정되어 제출되는 이슈 있음. 
// 이게 11이 제출되는건지, 제출은 제대로 되는데 11로 변환되어 로그에 남는건지 모르겠음.
// 찾아보니 모의 api를 사용해서 테스트하는 경우 발생할 수 있는 에러라고 하는거 같음.
// 실제 백엔드 url을 받고 테스트할 예정. 




import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import axios from 'axios'; // HTTP 통신 라이브러리. 

const LoginForm = () => {
  const [warning, setWarning] = useState("");
  const [loginData, setLoginData] = useState({ // 로그인 정보 객체
    id: "",
    password: "",
  });

  const handleChange = (key, value) => {
    console.log(`Updating ${key} with value: ${value}`);
    setLoginData({ ...loginData, [key]: value });
  };

  const submitLoginData = async () => { // 가상 서버로 로그인 데이터 전송.
    try {
      if (loginData.id === "") {
        setWarning("idEmpty");
        return; // 유효성 검사 실패 시 함수 종료.
      }
      if (loginData.password === "") {
        setWarning("passwordEmpty");
        return; // 유효성 검사 실패 시 함수 종료.
      }

      const response = await axios.post('https://jsonplaceholder.typicode.com/users', {
        id: loginData.id,
        password: loginData.password
      });
      console.log("백엔드로 전송", response.data);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };


  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.logo} source={require('./assets/logo.png')} />
        <View style={styles.inputBox}>
          <Text style={styles.text}>로그인</Text>
          <Text style={styles.description}>새로운 사진들이 기다리고 있었어요!</Text>
          <TextInput
            placeholder="ID를 입력해주세요."
            value={loginData.id}
            onChangeText={(text) => handleChange("id", text)}
            style={styles.input}
          />
          {warning === "idEmpty" && <Text style={styles.warningText}>아이디를 입력해주세요.</Text>}

          <TextInput
            placeholder="비밀번호를 입력해주세요."
            value={loginData.password}
            onChangeText={(text) => handleChange("password", text)}
            style={styles.input}
            secureTextEntry
          />
          {warning === "passwordEmpty" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}
        </View>
      </View>

      <Pressable style={styles.continueBtn} onPress={submitLoginData}>
        <Text style={styles.btnText}>
          Login
        </Text>
      </Pressable>
    </View>
  )
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

export default LoginForm;
