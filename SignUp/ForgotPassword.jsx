import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image, StatusBar, Platform,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import Api from '../Api';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState(""); // 이메일 상태 관리
  const [code, setCode] = useState(""); // 인증 코드 상태 관리
  const [newPassword, setNewPassword] = useState(""); // 새 비밀번호 상태 관리
  const [step, setStep] = useState(1); // 현재 단계 상태 관리
  const [loading, setLoading] = useState(false); // 로딩 상태 관리
  const [warning, setWarning] = useState(""); // 경고 메시지 상태 관리

  // 인증 코드를 이메일로 전송하는 함수
  const handleSendCode = async () => {
    if (email === "") {
      setWarning("emailEmpty");
      return;
    }

    setLoading(true);

    try {
      const response = await Api.get(`/accounts/email`, {
        params: {
          email: email
        }
      });

      console.log('서버 응답 (인증 코드 전송):', response.data); // 서버 응답 데이터 출력

      if (response.data && response.data.status === 200 && response.data.code === "U004") {
        setStep(2); // 다음 단계로 이동
        setWarning("");
      } else {
        setWarning("sendCodeFailed");
      }
    } catch (error) {
      console.error('코드 전송 오류:', error);
      setWarning("networkError");
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호를 재설정하는 함수
  const handleResetPassword = async () => {
    if (code === "") {
      setWarning("codeEmpty");
      return;
    } else if (newPassword === "") {
      setWarning("passwordEmpty");
      return;
    } else if (newPassword.length < 6) {
      setWarning("shortPassword");
      return;
    }

    setLoading(true);

    try {
      const data = {
        email: email,
        newPassword: newPassword,
        verificationCode: code
      };
      console.log('전송 데이터:', data); // 콘솔에 데이터 출력

      const response = await Api.patch('/accounts/password', data);
      console.log('서버 응답:', response.data); // 서버 응답 데이터 출력

      if (response.data && response.data.status === 200 && response.data.code === "U0015") {
        await SecureStore.deleteItemAsync('userEmail');
        await SecureStore.deleteItemAsync('userPassword');
        navigation.navigate('Login'); // 로그인 폼으로 이동
      } else {
        setWarning("resetPasswordFailed");
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      setWarning("networkError");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
      </View>
      <View style={styles.inputcontainer}>
        {step === 1 && ( // 1단계: 이메일 입력
          <>
            <Text style={styles.text}>비밀번호 찾기</Text>
            <TextInput
              placeholder="이메일을 입력해주세요."
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#FFFFFF"
            />
            {warning === "emailEmpty" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
            {warning === "sendCodeFailed" && <Text style={styles.warningText}>코드 전송에 실패했습니다. 다시 시도해주세요.</Text>}
            {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
            <Pressable style={styles.continueBtn} onPress={handleSendCode}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>인증</Text>}
            </Pressable>
          </>
        )}
        {step === 2 && ( // 2단계: 인증 코드와 새 비밀번호 입력
          <>
            <Text style={styles.text}>인증 코드</Text>
            <TextInput
              placeholder="인증 코드를 입력해주세요."
              value={code}
              onChangeText={setCode}
              style={styles.input}
              placeholderTextColor="#FFFFFF"
            />
            <Text style={styles.text}>새 비밀번호</Text>
            <TextInput
              placeholder="새 비밀번호를 입력해주세요."
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              secureTextEntry
              placeholderTextColor="#FFFFFF"
            />
            {warning === "codeEmpty" && <Text style={styles.warningText}>인증 코드를 입력해주세요.</Text>}
            {warning === "passwordEmpty" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}
            {warning === "shortPassword" && <Text style={styles.warningText}>비밀번호는 최소 6자 이상이어야 합니다.</Text>}
            {warning === "resetPasswordFailed" && <Text style={styles.warningText}>비밀번호 재설정에 실패했습니다. 다시 시도해주세요.</Text>}
            {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
            <Pressable style={styles.continueBtn} onPress={handleResetPassword}>
              {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>비밀번호 재설정</Text>}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black"
  },
  logo: { 
    width: wp(80),
    height: hp(40),
    alignSelf: "center"
  },
  inputcontainer: {
    width: wp(80),
  },
  text: {
    fontWeight: 'bold',
    color: "#fff",
    fontSize: hp(2.5),
    marginVertical: hp(2),
  },
  input: {
    width: wp(80),
    borderBottomWidth: 1,
    borderColor: "#fff",
    fontSize: hp(2),
    paddingBottom: hp(1),
    color: "#fff"
  },
  continueBtn: {
    backgroundColor: '#fff',
    padding: wp(3),
    paddingHorizontal: wp(4),
    borderRadius: 15,
    marginTop: hp(2),
    alignSelf: 'flex-end', // 오른쪽 정렬 추가
  },
  btnText: {
    fontSize: hp(2),
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warningText: {
    color: 'red',
    fontSize: hp(2),
    marginTop: hp(1),
  },
});

export default ForgotPassword;
