import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const LoginForm = () => {
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (key, value) => {
    setLoginData({ ...loginData, [key]: value });
    setWarning(""); // 입력이 변경될 때 경고 메시지 초기화
  };

  useEffect(() => {
    checkLoginCredentials();
  }, []);

  const checkLoginCredentials = async () => {
    try {
      const storedEmail = await SecureStore.getItemAsync('userEmail');
      const storedPassword = await SecureStore.getItemAsync('userPassword');
      if (storedEmail !== null && storedPassword !== null) {
        submitLoginData(storedEmail, storedPassword);
      }
    } catch (error) {
      console.error("자격 증명을 불러오는 데 실패했습니다.", error);
    }
  };

  const validateEmail = (email) => {
    const re = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(String(email).toLowerCase());
  };

  const submitLoginData = async (email, password) => {
    if (email === "") {
      setWarning("emailEmpty");
      return;
    } else if (password === "") {
      setWarning("passwordEmpty");
      return;
    }
  
    if (!validateEmail(email)) {
      setWarning("invalidEmail");
      return;
    }
  
    if (password.length < 6) {
      setWarning("shortPassword");
      return;
    }
  
    setLoading(true);

    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', {
        email,
        password
      });

      console.log("백엔드로 전송", response.data);

      if (response.data && response.data.login === 'success') {
        const token = response.headers['auth-token']; // 토큰을 헤더에서 추출. 헤더 속성이름은 나중에 추후에 바꿈.
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userPassword', password);
        await SecureStore.setItemAsync('userToken', token); // 토큰 저장. 같은 키값으로 저장한다면, 덮어쓰기로 저장됨. 
        console.log("로그인 정보와 토큰이 성공적으로 저장되었습니다.");
        setWarning("");
        // 성공 시 추가 동작 수행 (예: 페이지 이동)
      } else {
        console.log("로그인 실패: 서버로부터 성공 메시지를 받지 못했습니다.");
        setWarning("loginFailed");
      }
    } catch (error) {
      console.error('데이터 전송 오류:', error);
      setWarning("networkError");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
        <View style={styles.inputBox}>
          <Text style={styles.text}>로그인</Text>
          <Text style={styles.description}>새로운 사진들이 기다리고 있어요!</Text>
          <TextInput
            placeholder="이메일을 입력해주세요."
            value={loginData.email}
            onChangeText={(text) => handleChange("email", text)}
            style={styles.input}
          />
          {warning === "emailEmpty" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
          {warning === "invalidEmail" && <Text style={styles.warningText}>유효한 이메일을 입력해주세요.</Text>}

          <TextInput
            placeholder="비밀번호를 입력해주세요."
            value={loginData.password}
            onChangeText={(text) => handleChange("password", text)}
            style={styles.input}
            secureTextEntry
          />
          {warning === "passwordEmpty" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}
          {warning === "shortPassword" && <Text style={styles.warningText}>비밀번호는 최소 6자 이상이어야 합니다.</Text>}
          {warning === "loginFailed" && <Text style={styles.warningText}>로그인 실패. 다시 시도해주세요.</Text>}
          {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
        </View>
      </View>

      <Pressable style={styles.continueBtn} onPress={() => submitLoginData(loginData.email, loginData.password)}>
        {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>Login</Text>}
      </Pressable>
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
    alignSelf: "center"
  },
  inputBox: {
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
