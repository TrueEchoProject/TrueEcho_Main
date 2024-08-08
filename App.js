import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  AppState,
  StatusBar, Image,
} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { NavigationContainer } from "@react-navigation/native";
import Api from "./Api"; // API 파일 경로에 맞게 수정
import AppNavigation from "./AppNavigation"; // AppNavigation 파일 경로에 맞게 수정
import { createNavigationUrl } from "./navigationUtils";
import LoadingScreen from "./SignUp/LoadingScreen"; // 추가된 부분

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const linking = {
  prefixes: [Linking.createURL("/"), "trueecho://", "https://trueecho.app"],
  config: {
    screens: {
      LoginCheck: "logincheck",
      Login: "login",
      SignUp: "signup",
      ForgotPassword: "forgot-password",
      TabNavigation: {
        path: "main",
        screens: {
          MainPost: {
            path: "mainpost",
            screens: {
              FeedTab: {
                path: "feed-tab",
                screens: {
                  FriendFeed: "friend-feed",
                  OtherFeed: "other-feed",
                },
              },
              MyP: "mypage",
              Fri: "friends",
              MyOp: "options",
              Calendar: "calendar",
              MyInfo: "myinfo",
              Alarm: "alarm",
              FeedAlarm: "feed-alarm/:post_id?",
              UserAlarm: "user-alarm/:userId?",
              IsAlarm: "is-alarm",
              MyFeed: "myfeed",
            },
          },
          Camera: {
            path: "camera",
            screens: {
              CameraOption: "camera-option",
              SendPosts: "send-posts",
              FeedPostPage: "feed-post-page",
            },
          },
          CommunityTab: {
            path: "community",
            screens: {
              Community: {
                path: "community",
                screens: {
                  Vote: "vote",
                  Result: "result",
                },
              },
              Fri: "friends",
              MyP: "mypage",
            },
          },
        },
      },
    },
  },
};

const App = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialRoute, setInitialRoute] = useState(null);
  const [initialUrl, setInitialUrl] = useState(null); // 추가된 부분

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const token = await getPushToken();
      const loginSuccess = await prepare(token);
      if (loginSuccess) {
        setInitialRoute("TabNavigation");
      } else {
        setInitialRoute("Login");
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification clicked:", response);
        handleNotification(response.notification);
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    console.log("App state changed to:", nextAppState);
  };

  const handleNotification = async (notification) => {
    console.log("Notification received:", notification);
    const data = notification.request.content.data;
    const type = data.notiType;

    if (!type || !data) {
      console.error("Notification data is missing");
      setInitialRoute("TabNavigation");
      return;
    }

    const url = createNavigationUrl(type, data);
    console.log("[app.js] Initial URL:", url);
    if (url) {
      const appState = AppState.currentState;
      const accessToken = await SecureStore.getItemAsync("accessToken");

      if ((appState === "active" || appState === "background") && accessToken) {
        console.log("푸쉬 알림을 통한 접속 - 포그라운드 또는 백그라운드 상태");
        Linking.openURL(url);
      } else if ((appState === "active" || appState === "background") && !accessToken) {
        console.log("푸쉬 알림을 통한 접속 - 포그라운드 또는 백그라운드 상태, 액세스 토큰 없음");
        setInitialRoute("Login");
      } else {
        console.log("푸쉬 알림을 통한 접속 - 앱 종료 상태");
        const token = await getPushToken();
        const loginSuccess = await prepare(token, true);
        if (!loginSuccess) {
          setInitialRoute("Login");
        } else {
          setInitialUrl(url); // 성공하면 URL을 상태로 저장
        }
      }
    }
  };

  const getPushToken = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      console.log("Expo push token:", token);
      return token;
    } else {
      console.log("Failed to get expo push token");
      return null;
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
      console.log("Notification channel set for Android");
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log("Existing notification permission status:", existingStatus);
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("Requested notification permission status:", status);
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      console.log("Notification permission not granted");
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      console.log("Project ID:", projectId);
      if (!projectId) {
        throw new Error("No projectId configured");
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;
      console.log("Push token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching Expo push token", error);
      return null;
    }
  };

  const prepare = async (token) => {
    console.log("Prepare function called");
    try {
      const storedEmail = await SecureStore.getItemAsync("userEmail");
      const storedPassword = await SecureStore.getItemAsync("userPassword");
      if (storedEmail && storedPassword) {
        const loginSuccess = await submitLoginData(
          storedEmail,
          storedPassword,
          token
        );
        if (loginSuccess) {
          setInitialRoute("TabNavigation");
        } else {
          setInitialRoute("Login");
        }
        return loginSuccess;
      } else {
        console.log("Stored credentials not found, redirecting to login...");
        setIsLoggedIn(false);
        setInitialRoute("Login");
        return false;
      }
    } catch (e) {
      console.warn(e);
      setIsLoggedIn(false);
      setInitialRoute("Login");
      return false;
    } finally {
      // setIsLoading(false); // 이 부분을 주석 처리
    }
  };

  const submitLoginData = async (email, password, token) => {
    try {
      const response = await Api.post("/accounts/login", { email, password });
      console.log("백엔드로 전송", response.data);

      if (response.data && response.data.status === 200) {
        const { accessToken, refreshToken } = response.data.data;

        await SecureStore.setItemAsync("userEmail", email);
        await SecureStore.setItemAsync("userPassword", password);
        await SecureStore.setItemAsync("accessToken", accessToken);
        await SecureStore.setItemAsync("refreshToken", refreshToken);
        console.log("로그인 정보와 토큰이 성공적으로 저장되었습니다.");

        const formData = new FormData();
        formData.append("token", token);
        console.log("FCM token being sent:", token);
        await Api.post(`/fcm/save`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setIsLoggedIn(true);
        return true;
      } else if (
        response.data.status === 401 &&
        response.data.code === "T001"
      ) {
        console.log("로그인 실패: 사용자 인증에 실패했습니다.");
        setIsLoggedIn(false);
        return false;
      } else {
        console.log("로그인 실패: 서버로부터 성공 메시지를 받지 못했습니다.");
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data.code === "T001"
      ) {
        console.log("로그인 실패: 사용자 인증에 실패했습니다.");
        setIsLoggedIn(false);
        return false;
      } else {
        console.error("네트워크 오류:", error);
        setIsLoggedIn(false);
        return false;
      }
    } finally {
      // setIsLoading(false); // 이 부분을 주석 처리
    }
  };

  const handleLoadingFinish = () => {
    setIsLoading(false); // 로딩 완료 후 isLoading을 false로 설정
  };

  if (isLoading || initialRoute === null) {
    return (
      <LoadingScreen onFinish={handleLoadingFinish} />
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <AppNavigation
        initialRouteName={initialRoute}
        initialUrl={initialUrl} // 추가된 부분
      />
    </NavigationContainer>
  );
};

export default App;
