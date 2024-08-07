import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import * as SecureStore from 'expo-secure-store';
import Api from '../Api';
import { useNavigation } from '@react-navigation/native';
import LoadingScreen from './LoadingScreen';
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const LoginForm = () => {

  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 토글
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
  const handleLogin = () => {
    if (expoPushToken) {
      submitLoginData(loginData.email, loginData.password);
    } else {
      console.error('Expo push token is not available yet');
    }
  };

  const handleChange = (key, value) => {
    setLoginData({ ...loginData, [key]: value });
    setWarning("");
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../assets/logo.png')} />
      </View>
      <View style={styles.bodyContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputComposition}>
            <Text style={styles.inputText}>이메일 주소</Text>
            <TextInput
              placeholder="이메일을 입력해주세요."
              value={loginData.email}
              onChangeText={(text) => handleChange("email", text)}
              style={styles.input}
              placeholderTextColor="#ccc"
            />
            {warning === "emailEmpty" && <Text style={styles.warningText}>이메일을 입력해주세요.</Text>}
            {warning === "invalidEmail" && <Text style={styles.warningText}>유효한 이메일을 입력해주세요.</Text>}
          </View>
          <View style={styles.inputComposition}>
            <Text style={styles.inputText}>비밀번호</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="비밀번호를 입력해주세요."
                value={loginData.password}
                onChangeText={(text) => handleChange("password", text)}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                placeholderTextColor="#ccc"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="white" />
              </Pressable>
            </View>
            {warning === "passwordEmpty" && <Text style={styles.warningText}>비밀번호를 입력해주세요.</Text>}
            {warning === "shortPassword" && <Text style={styles.warningText}>비밀번호는 최소 6자 이상이어야 합니다.</Text>}
            {warning === "authFailed" && <Text style={styles.warningText}>비밀번호가 일치하지 않습니다. 다시 시도해주세요.</Text>}
            {warning === "loginFailed" && <Text style={styles.warningText}>로그인 실패. 다시 시도해주세요.</Text>}
            {warning === "networkError" && <Text style={styles.warningText}>네트워크 오류가 발생했습니다. 다시 시도해주세요.</Text>}
          </View>
        </View>
        <View style={styles.loginBtnContainer}>
          <Pressable onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <LinearGradient
                colors={['#1BC5DA', '#263283']}
                style={styles.loginBtn}
              >
                <Text style={styles.loginBtnText}>로그인</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>

        <View style={styles.lowButtonContainer}>
          <Pressable style={[styles.lowBtn, { borderLeftWidth: 0 }]}
            onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.lowBtnText}>회원 가입</Text>
          </Pressable>
          <Pressable style={styles.lowBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.lowBtnText}>비밀번호 찾기</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "black",
  },
  logoContainer: {
    height: windowHeight * 0.35,
    justifyContent: "center",
  },
  logo: {
    width: wp(60),
    height: hp(30),
    alignSelf: "center",
  },

  bodyContainer: {
    height: windowHeight * 0.65,
    justifyContent: "center",
  },
  inputContainer: {
    height: windowHeight * 0.28,
    alignItems: "center",
  },
  inputComposition: {
    width: windowWidth * 0.85,
    height: "50%",
  },
  inputText: {
    fontSize: windowHeight * 0.02,
    color: "#fff",
    fontWeight: "bold",
    paddingBottom: windowHeight * 0.02,
  },
  input: {
    width: "100%",
    paddingBottom: windowHeight * 0.005,
    borderBottomWidth: 1,
    borderColor: "#fff",
    fontSize: windowHeight * 0.02,
    color: "#fff",
  },
  passwordInput: {
    flex: 1,  // Flex 사용하여 TextInput 확장
    paddingBottom: windowHeight * 0.005,
    fontSize: windowHeight * 0.02,
    color: "#fff",
  },
  warningText: {
    color: "red",
    fontSize: hp(1.8),
    paddingTop: hp(1),
  },
  loginBtnContainer: {
    height: windowHeight * 0.075,
    justifyContent: "center",
    alignSelf: "center",
  },
  loginBtn: {
    width: windowWidth * 0.85,
    height: windowHeight * 0.075,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: windowHeight * 0.02,
    color: "#fff",
    fontWeight: "bold",
  },
  lowButtonContainer: {
    height: windowHeight * 0.3,
    width: windowWidth,
    flexDirection: "row",
  },
  lowBtnText: {
    color: "#fff",
    fontSize: hp(2),
    textAlign: "center",
  },
  lowBtn: {
    height: hp(3),
    width: wp(50),
    borderLeftWidth: 1,
    borderColor: "#fff",
    marginTop: hp(10),
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: "#fff",
  },
  toggleButton: {
    paddingHorizontal: 10,
    
  },
});

export default LoginForm;
