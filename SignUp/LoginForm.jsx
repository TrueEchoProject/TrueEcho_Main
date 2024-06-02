import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import Api from '../Api';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from './LoadingScreen';
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const LoginForm = () => {
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('Notification channel set for Android');
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log('Existing notification permission status:', existingStatus);
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('Requested notification permission status:', status);
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      console.log('Notification permission not granted');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log('Project ID:', projectId);
      if (!projectId) {
        throw new Error('No projectId configured');
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Error fetching Expo push token:', error);
      return null;
    }
  }
  
  const handleChange = (key, value) => {
    setLoginData({ ...loginData, [key]: value });
    setWarning("");
  };
  
  useEffect(() => {
    const getPushToken = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        console.log('Expo push token:', token);
      } else {
        console.log('Failed to get expo push token');
      }
    };
    getPushToken();
  }, []);
  
  useEffect(() => {
    if (expoPushToken) {
      console.log('Expo push token state updated:', expoPushToken);
    }
  }, [expoPushToken]);
  
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
      const response = await Api.post('/accounts/login', {
        email,
        password
      });
      
      console.log("백엔드로 전송", response.data);
      
      if (response.data && response.data.status === 200) {
        const { accessToken, refreshToken } = response.data.data;
        
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userPassword', password);
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        
        console.log("로그인 정보와 토큰이 성공적으로 저장되었습니다.");
        setWarning("");
        
        if (expoPushToken) {
          const formData = new FormData();
          formData.append('token', expoPushToken);
          
          console.log('FCM token being sent:', expoPushToken);
          
          const fcmResponse = await Api.post(`/fcm/save`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          console.log('서버 응답:', fcmResponse.data);
        } else {
          console.error('Token was not obtained');
        }
          setLoading(false);
          navigation.navigate('TabNavigation');
      } else if (response.data.status === 401 && response.data.code === 'T001') {
        console.log("로그인 실패: 사용자 인증에 실패했습니다.");
        setLoading(false);
        setWarning("authFailed");
      } else {
        console.log("로그인 실패: 서버로부터 성공 메시지를 받지 못했습니다.");
        setLoading(false);
        setWarning("loginFailed");
      }
    } catch (error) {
      if (error.response && error.response.status === 401 && error.response.data.code === 'T001') {
        console.log("로그인 실패: 사용자 인증에 실패했습니다.");
        setWarning("authFailed");
      } else {
        console.error('네트워크 오류:', error);
        setWarning("networkError");
      }
      setLoading(false);
    }
  };
  
  const handleLogin = () => {
    if (expoPushToken) {
      submitLoginData(loginData.email, loginData.password);
    } else {
      console.error('Expo push token is not available yet');
    }
  };
  
  useEffect(() => {
    if (expoPushToken) {
      checkLoginCredentials();
    }
  }, [expoPushToken]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
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
          {warning === "authFailed" && <Text style={styles.warningText}>비밀번호가 일치하지 않습니다. 다시 시도해주세요.</Text>}
          {warning === "loginFailed" && <Text style={styles.warningText}>로그인 실패. 다시 시도해주세요.</Text>}
          {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
          
          <Pressable style={styles.forgotPasswordBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPasswordText}>비밀번호 찾기</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable style={styles.continueBtn} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.btnText}>Sign Up</Text>
        </Pressable>
        
        <Pressable style={styles.continueBtn} onPress={handleLogin}>
          {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnText}>Login</Text>}
        </Pressable>
      </View>
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
  forgotPasswordBtn: {
    marginTop: hp(3),
  },
  forgotPasswordText:{
    color: "green",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
  },
});

export default LoginForm;
