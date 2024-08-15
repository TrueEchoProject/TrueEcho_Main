import 'dotenv/config'; // .env 파일을 불러오기 위해 필요합니다.

export default {
  expo: {
    name: "TrueEcho",
    slug: "trueecho",
    scheme: "trueecho",
    version: "1.0.0",
    orientation: "portrait",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.hanseo.TrueEcho",
      googleServicesFile: "./GoogleService-Info.plist",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY, // 환경 변수에서 API 키를 가져옵니다.
      },
    },
    android: {
      package: "com.hanseo.TrueEcho",
      googleServicesFile: "./google-services.json",
      softwareKeyboardLayoutMode: "pan",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: ["NOTIFICATIONS"],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY, // 환경 변수에서 API 키를 가져옵니다.
        },
      },
    },
    web: {
      favicon: "./assets/icon.png",
    },
    owner: "trueecho",
    extra: {
      eas: {
        projectId: "71a30e64-a2a8-4e53-888b-f53592590986",
      },
    },
    plugins: ["expo-secure-store"],
  },
};
