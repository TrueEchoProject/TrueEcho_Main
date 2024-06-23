import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator
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
  
  
  
  // 인증 코드를 검증하는 함수
  const handleVerifyCode = async () => {
    if (code === "") {
      setWarning("codeEmpty");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await Api.get(`/accounts/checkcode`, {
        params: {
          email: email,
          checkCode: code
        }
      });
      
      if (response.data && response.data.status === 200 && response.data.code === "U002") {
        setStep(3); // 다음 단계로 이동
        setWarning("");
      } else {
        setWarning("verifyCodeFailed");
      }
    } catch (error) {
      console.error('코드 인증 오류:', error);
      setWarning("networkError");
    } finally {
      setLoading(false);
    }
  };
  
  
  // 비밀번호를 재설정하는 함수
  const handleResetPassword = async () => {
    if (newPassword === "") {
      setWarning("passwordEmpty");
      return;
    } else if (newPassword.length < 6) {
      setWarning("shortPassword");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await Api.patch('/accounts/password', { email, newPassword });
      
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
      {step === 1 && ( // 1단계: 이메일 입력
        <>
          <Text style={styles.text}>비밀번호 찾기</Text>
          <TextInput
            placeholder="이메일을 입력해주세요."
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          {warning === "emailEmpty" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
          {warning === "sendCodeFailed" && <Text style={styles.warningText}>코드 전송에 실패했습니다. 다시 시도해주세요.</Text>}
          {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
          <Pressable style={styles.continueBtn} onPress={handleSendCode}>
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>인증 코드 보내기</Text>}
          </Pressable>
        </>
      )}
      {step === 2 && ( // 2단계: 인증 코드 입력
        <>
          <Text style={styles.text}>인증 코드 입력</Text>
          <TextInput
            placeholder="인증 코드를 입력해주세요."
            value={code}
            onChangeText={setCode}
            style={styles.input}
          />
          {warning === "codeEmpty" && <Text style={styles.warningText}>인증 코드를 입력해주세요.</Text>}
          {warning === "verifyCodeFailed" && <Text style={styles.warningText}>코드 인증에 실패했습니다. 다시 시도해주세요.</Text>}
          {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
          <Pressable style={styles.continueBtn} onPress={handleVerifyCode}>
            {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>코드 인증</Text>}
          </Pressable>
        </>
      )}
      {step === 3 && ( // 3단계: 새 비밀번호 입력
        <>
          <Text style={styles.text}>새 비밀번호 입력</Text>
          <TextInput
            placeholder="새 비밀번호를 입력해주세요."
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            secureTextEntry
          />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(10),
  },
  text: {
    fontWeight: 'bold',
    fontSize: hp(4),
    marginBottom: hp(2),
  },
  input: {
    width: wp(85),
    borderBottomWidth: 2,
    borderColor: '#3B4664',
    borderRadius: 5,
    paddingVertical: hp(1),
    marginTop: hp(2),
    fontSize: hp(3),
  },
  continueBtn: {
    backgroundColor: '#3B4664',
    width: wp(90),
    padding: wp(2),
    paddingHorizontal: wp(4),
    borderRadius: 15,
    marginTop: hp(2),
  },
  btnText: {
    fontSize: hp(3),
    color: '#fff',
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
